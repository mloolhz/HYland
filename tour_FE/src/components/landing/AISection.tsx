import { Link } from "react-router-dom";

const AI_COURSES = [
  {
    thumb: "t1",
    level: "easy",
    levelLabel: "초급",
    title: "하나개 카약 체험",
    loc: "📍 무의도 · 소요 2시간",
    why: "🤖 잔잔한 물살을 좋아하는 입문자에게 추천!",
    to: "/sports?category=water",
  },
  {
    thumb: "t2",
    level: "mid",
    levelLabel: "중급",
    title: "무의바다누리길 트레일 러닝",
    loc: "📍 소무의도 · 코스 2.5km",
    why: "🤖 바다 조망 러닝을 원한다면 이 코스!",
    to: "/sports?category=land",
  },
  {
    thumb: "t3",
    level: "mid",
    levelLabel: "중급",
    title: "서해 맑은물 스노클링",
    loc: "📍 백령도 · 소요 1.5시간",
    why: "🤖 물이 맑은 날, 서해 속살을 보고 싶다면!",
    to: "/sports?category=water",
  },
] as const;

type AISectionProps = {
  onRequestCustomRecommendation?: () => void;
};

export function AISection({ onRequestCustomRecommendation }: AISectionProps) {
  return (
    <section className="sec" id="ai">
      <div className="container">
        <div className="sec-head reveal">
          <div className="sec-head-copy">
            <span className="eyebrow">AI RECOMMEND</span>
            <h2>AI 추천</h2>
          </div>
        </div>
        <p className="sec-sub reveal">
          당신에게 딱 맞는 레저스포츠와 섬을 추천해드려요! 관심사와 체력 레벨을 알려주면 코스를 골라드립니다.
        </p>
        <div className="ai-grid">
          {AI_COURSES.map((course) => (
            <Link className="ai-card reveal" key={course.title} to={course.to}>
              <div className={`thumb ${course.thumb}`}>
                <span className={`lv ${course.level}`}>{course.levelLabel}</span>
              </div>
              <div className="ai-body">
                <h4>{course.title}</h4>
                <div className="loc">{course.loc}</div>
                <div className="why">{course.why}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="center reveal">
          <button
            type="button"
            className="btn btn-outline btn-ai-custom"
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
