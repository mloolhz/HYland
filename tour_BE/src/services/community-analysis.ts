/**
 * 커뮤니티 글 본문 분석.
 *
 * 태그(island·activity)만 쓰면 "무슨 활동인지"는 알아도 "좋았는지"는 모른다.
 * 지금까지는 후기 1건 = 긍정 근거 1건으로 세서, "낚시 꽝이었어요"도 낚시 추천
 * 근거로 들어갔다. 그 빈틈을 본문 분석으로 메운다.
 *
 * 분석은 글당 한 번만 하고 DB에 저장한다. 추천은 브라우저에서 동기적으로 돌기
 * 때문에 추천할 때마다 분석하는 구조는 성립하지 않는다.
 */

/** 활동 어휘 — 본문에서 실제로 언급된 활동을 뽑는다. 태그와 다를 수 있다. */
const ACTIVITY_TERMS = [
  "낚시", "해루질", "트레킹", "하이킹", "등산", "백패킹", "산림욕",
  "카약", "SUP", "패들보드", "패들보트", "요트", "해수욕", "스노클링",
  "사이클", "자전거", "갯벌", "캠핑", "산책", "드라이브", "러닝",
  "일몰", "일출", "온천", "골프", "유람선", "짚라인", "루지", "모노레일",
];

/**
 * 구조화 추출용 사전.
 *
 * 커뮤니티 글이 대량으로 쌓였을 때를 가정한다. 글 한 건에서 뽑은 사실은
 * 믿을 게 못 되지만(주관·오타), 수십·수백 건이 같은 말을 하면 신호가 된다.
 * 그래서 여기서는 문장에서 후보만 뽑고, 합의 판단은 집계 단계에서 한다.
 */

/** 동행 적합도 — 여행 조건 companion(solo/couple/friend/family)과 매칭한다. */
const COMPANION_HINTS: Record<string, string[]> = {
  family: ["가족", "아이", "아이들", "애들", "부모님", "어른", "유아", "아기", "노약자"],
  couple: ["연인", "커플", "데이트", "둘이서", "여자친구", "남자친구", "신혼"],
  friend: ["친구", "친구들", "동기", "우정", "무리"],
  solo: ["혼자", "혼행", "나홀로", "솔로", "혼자서"],
};

/** 방문객 주의·팁 — 점수엔 안 쓰고 카드에 그대로 보여준다. */
const CAUTION_HINTS = [
  "주차", "챙기", "미리", "예약", "매진", "없으니", "없어서", "부족", "조심",
  "주의", "위험", "그늘", "화장실", "편의점", "식당", "배 시간", "배편", "결항",
  "물때", "만조", "간조", "썰물", "밀물", "현금",
];

const POSITIVE = [
  "좋았", "좋아", "좋다", "좋은", "최고", "추천", "만족", "예쁘", "예뻤", "아름",
  "맑", "깨끗", "잔잔", "편했", "편하", "친절", "훌륭", "완벽", "인생", "강추",
  "재밌", "재미있", "행복", "감동", "시원", "멋있", "멋졌", "대박", "짱",
];

const NEGATIVE = [
  "별로", "실망", "아쉽", "아쉬웠", "최악", "비추", "불편", "힘들", "위험",
  "더럽", "지저분", "비싸", "웨이팅", "붐볐", "복잡", "시끄",
  "실패", "후회", "짜증", "불친절", "빡세", "빡셈", "험하", "막히", "헬",
];

/**
 * 부정형 서술 — "좋지 않았다", "깨끗하지 못했다".
 * 긍정어에 부정 어미가 붙은 형태라, 긍정어 검사보다 **먼저** 잡아내고 그 구간을
 * 지운 뒤 나머지를 센다. 그러지 않으면 "좋지"의 "좋"이 긍정으로 잡힌다.
 */
/**
 * 부정어 + 부정 어미 = 칭찬. "험하지 않고", "불편하지 않았어요".
 *
 * 긍정어 쪽(NEGATED_PRAISE)만 처리하고 이쪽을 빠뜨려서, "길이 험하지 않고"가
 * '험하' 하나 때문에 감점됐다. 뜻이 정반대인데 부정으로 세던 셈이다.
 */
const NEGATED_COMPLAINT =
  /(험하|힘들|불편|위험|비싸|복잡|더럽|지저분|시끄|막히|붐비|붐볐|빡세)[가-힣]{0,3}(지\s?않|지\s?못|진\s?않|지도\s?않)/g;

const NEGATED_PRAISE =
  /(좋|괜찮|깨끗|편하|편했|친절|재밌|재미있|맑|시원|아름답|멋있)[가-힣]{0,3}(지\s?않|지\s?못|진\s?않|지도\s?않)/g;

/**
 * 의문문은 감성 판단에서 뺀다.
 * "낚시하기 좋은 포인트 있을까요?"는 그 섬이 좋다는 뜻이 아니라 묻는 말인데,
 * "좋은"만 보고 긍정으로 세면 질문 글이 추천 근거가 되어버린다.
 */
const REQUEST_PATTERNS = [
  "부탁", "궁금", "알려주", "문의", "여쭤", "조언 구", "정보 구", "추천 좀",
];

function isQuestion(sentence: string): boolean {
  if (/\?\s*$/.test(sentence)) return true;
  if (/(까요|나요|을까|인가요|는지요)[?.\s]*$/.test(sentence)) return true;
  // "장비 대여 가능한 곳 추천 부탁드려요" — 여기서 '추천'은 칭찬이 아니라 요청이다.
  return REQUEST_PATTERNS.some((r) => sentence.includes(r));
}

export type PostAnalysis = {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  highlight: string | null;
  mentionedActivities: string[];
  /** 후기에서 "좋았다"고 한 달 (1~12). 여행 시기 매칭용. */
  bestMonths: number[];
  /** 이 글이 시사하는 동행 형태 (family/couple/friend/solo). */
  companionFit: string[];
  /** 방문객 주의·팁 문장. 점수엔 안 쓰고 카드에 보여준다. */
  cautions: string[];
  analyzedBy: "lexicon" | "gemini";
};

/** 본문에서 월(1~12)을 뽑는다. "9월", "구월"까진 보고 애매한 건 버린다. */
function extractMonths(text: string): number[] {
  const months = new Set<number>();
  for (const m of text.matchAll(/(\d{1,2})\s*월/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 12) months.add(n);
  }
  return [...months];
}

function extractCompanionFit(text: string): string[] {
  return Object.entries(COMPANION_HINTS)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([key]) => key);
}

function extractCautions(sentences: string[]): string[] {
  return sentences.filter((s) => CAUTION_HINTS.some((w) => s.includes(w))).slice(0, 3);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+|[\r\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6);
}

function scoreSentence(sentence: string): number {
  if (isQuestion(sentence)) return 0;

  let score = 0;

  // 1) 어미로 뜻이 뒤집히는 표현을 먼저 처리하고 그 구간을 지운다.
  //    순서가 중요하다 — 지우지 않으면 아래 단어 검사에서 반대로 잡힌다.
  const praised = sentence.match(NEGATED_COMPLAINT);
  score += (praised?.length ?? 0) * 1;

  const negated = sentence.replace(NEGATED_COMPLAINT, " ").match(NEGATED_PRAISE);
  score -= (negated?.length ?? 0) * 2;

  const rest = sentence.replace(NEGATED_COMPLAINT, " ").replace(NEGATED_PRAISE, " ");

  // 2) 남은 부분에서 긍정어·부정어를 센다.
  for (const word of POSITIVE) {
    if (rest.includes(word)) score += 1;
  }
  for (const word of NEGATIVE) {
    if (rest.includes(word)) score -= 2;
  }

  return score;
}

export function analyzeWithLexicon(title: string, content: string): PostAnalysis {
  const full = `${title}. ${content}`;
  const sentences = splitSentences(full);

  let total = 0;
  let best: { sentence: string; weight: number } | null = null;

  for (const sentence of sentences) {
    const score = scoreSentence(sentence);
    total += score;
    // 대표 문장은 "긍정적이면서 활동을 언급한" 문장을 고른다.
    // 순점수가 양수인 문장만 대표로 쓴다.
    // "주말엔 교통이 좀 빡세니 평일 추천."은 '추천'(+1)과 '빡세'(-2)가 상쇄돼
    // 음수가 되므로 자연히 빠진다. 예전엔 '빡세'가 사전에 없어 단점 문장이
    // 추천 근거 자리에 실렸다.
    const weight = score + (ACTIVITY_TERMS.some((t) => sentence.includes(t)) ? 1 : 0);
    if (score > 0 && (!best || weight > best.weight)) best = { sentence, weight };
  }

  const mentionedActivities = ACTIVITY_TERMS.filter((t) => full.includes(t));

  // 전체 문장 수로 나누면 긴 글이 불리하다. 사실만 적은 문장이 분모를 키워
  // "진짜 최고였습니다" 한 줄이 섞인 글도 중립으로 밀렸다.
  // 의견이 담긴 문장(점수가 0이 아닌 문장) 기준으로 본다.
  const opinionated = sentences.filter((x) => scoreSentence(x) !== 0).length;
  const normalized = opinionated > 0 ? total / opinionated : 0;
  const sentimentScore = Math.max(-100, Math.min(100, Math.round(normalized * 40)));

  // 구조화 추출 — 긍정 글에서만 "좋은 시기"를 인정한다(부정 글의 "9월은 별로"를
  // 좋은 시기로 세면 안 된다). 동행·주의사항은 감성과 무관하게 뽑는다.
  const bestMonths = sentimentScore > 0 ? extractMonths(full) : [];
  const companionFit = extractCompanionFit(full);
  const cautions = extractCautions(sentences);

  return {
    sentiment: sentimentScore > 15 ? "positive" : sentimentScore < -15 ? "negative" : "neutral",
    sentimentScore,
    highlight: best?.sentence ?? null,
    mentionedActivities,
    bestMonths,
    companionFit,
    cautions,
    analyzedBy: "lexicon",
  };
}

/**
 * Gemini로 분석한다. 사전 방식이 놓치는 반어·완곡("나쁘지 않았다")까지 잡는다.
 *
 * 다만 할당량(429)이 자주 문제였으므로 실패는 정상 경로로 취급한다 —
 * 호출부가 사전 분석으로 대체할 수 있게 null을 돌려준다.
 */
export async function analyzeWithGemini(
  title: string,
  content: string,
  askGemini: (prompt: string) => Promise<string>,
): Promise<PostAnalysis | null> {
  const prompt = `다음은 섬 여행 커뮤니티 후기입니다. 아래 JSON 형식으로만 답하세요.

제목: ${title}
본문: ${content}

{
  "sentiment": "positive | neutral | negative",
  "sentimentScore": -100~100 정수,
  "highlight": "이 섬을 추천할 근거가 되는 문장 하나를 본문에서 그대로 인용(없으면 null)",
  "mentionedActivities": ["본문에 실제로 언급된 레저 활동"],
  "bestMonths": [본문에서 방문하기 좋았다고 한 달의 숫자 1~12, 없으면 빈 배열],
  "companionFit": ["이 글이 어울린다고 시사하는 동행: family|couple|friend|solo 중에서만"],
  "cautions": ["다음 방문자가 알면 좋을 주의·팁을 본문 근거로 1~3개(주차·배편·물때·챙길 것 등). 없으면 빈 배열"]
}

주의:
- 질문("~할까요?")은 추천 근거가 아니므로 neutral로 두세요.
- highlight는 요약하지 말고 본문 문장을 그대로 쓰세요.
- bestMonths는 "좋았다"는 맥락일 때만. "9월은 사람이 너무 많았다"처럼 부정이면 넣지 마세요.
- 본문에 없는 내용은 지어내지 말고 빈 배열로 두세요.`;

  try {
    const raw = await askGemini(prompt);
    const json = raw.match(/\{[\s\S]*\}/);
    if (!json) return null;

    const parsed = JSON.parse(json[0]) as Partial<PostAnalysis>;
    const sentiment =
      parsed.sentiment === "positive" || parsed.sentiment === "negative"
        ? parsed.sentiment
        : "neutral";

    return {
      sentiment,
      sentimentScore: Math.max(-100, Math.min(100, Math.round(Number(parsed.sentimentScore) || 0))),
      highlight: typeof parsed.highlight === "string" ? parsed.highlight : null,
      mentionedActivities: Array.isArray(parsed.mentionedActivities)
        ? parsed.mentionedActivities.filter((a): a is string => typeof a === "string")
        : [],
      bestMonths: Array.isArray(parsed.bestMonths)
        ? parsed.bestMonths.map(Number).filter((n) => n >= 1 && n <= 12)
        : [],
      companionFit: Array.isArray(parsed.companionFit)
        ? parsed.companionFit.filter(
            (c): c is string =>
              c === "family" || c === "couple" || c === "friend" || c === "solo",
          )
        : [],
      cautions: Array.isArray(parsed.cautions)
        ? parsed.cautions.filter((c): c is string => typeof c === "string").slice(0, 3)
        : [],
      analyzedBy: "gemini",
    };
  } catch (error) {
    console.warn("Gemini 본문 분석 실패 — 사전 분석으로 대체합니다:", error);
    return null;
  }
}
