import { demoProps } from "./ToastProvider";

const AI_COURSES = [
  {
    thumb: "t1",
    level: "easy",
    levelLabel: "초급",
    title: "하나개 카약 체험",
    loc: "📍 무의도 · 소요 2시간",
    why: "🤖 잔잔한 물살을 좋아하는 입문자에게 추천!",
    demo: "카약 코스 상세는 준비 중이에요 🛶",
  },
  {
    thumb: "t2",
    level: "mid",
    levelLabel: "중급",
    title: "무의바다누리길 트레일 러닝",
    loc: "📍 소무의도 · 코스 2.5km",
    why: "🤖 바다 조망 러닝을 원한다면 이 코스!",
    demo: "트레일 러닝 코스 상세는 준비 중이에요 🏃",
  },
  {
    thumb: "t3",
    level: "mid",
    levelLabel: "중급",
    title: "서해 맑은물 스노클링",
    loc: "📍 백령도 · 소요 1.5시간",
    why: "🤖 물이 맑은 날, 서해 속살을 보고 싶다면!",
    demo: "스노클링 코스 상세는 준비 중이에요 🤿",
  },
] as const;

type AISectionProps = {
  onRequestCustomRecommendation?: () => void;
};

export function AISection({ onRequestCustomRecommendation }: AISectionProps) {
  return (
    <section className="sec" id="ai" style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">🤖</span>
          <h2>AI 추천</h2>
        </div>
        <p className="sec-sub reveal">
          당신에게 딱 맞는 레저스포츠와 섬을 추천해드려요! 관심사와 체력 레벨을 알려주면 코스를 골라드립니다.
        </p>
        <div className="ai-grid reveal">
          {AI_COURSES.map((course) => (
            <article className="ai-card" key={course.title} {...demoProps(course.demo)}>
              <div className={`thumb ${course.thumb}`}>
                <span className={`lv ${course.level}`}>{course.levelLabel}</span>
              </div>
              <div className="ai-body">
                <h4>{course.title}</h4>
                <div className="loc">{course.loc}</div>
                <div className="why">{course.why}</div>
              </div>
            </article>
          ))}
        </div>
        <div className="center reveal">
          <button
            type="button"
            className="btn btn-outline"
            style={{ minWidth: 260 }}
            onClick={onRequestCustomRecommendation}
          >
            ✨ 맞춤 추천 받기
          </button>
        </div>
      </div>
    </section>
  );
}
