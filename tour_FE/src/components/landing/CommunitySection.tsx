import { Link } from "react-router-dom";
import {
  avaColor,
  COMMUNITY_LANDING_EXAMPLE_REVIEWS,
  type LandingExampleReview,
} from "@/lib/landing-data";

function ExampleReviewItem({ review }: { review: LandingExampleReview }) {
  return (
    <li className="review-item review-item--example">
      <span className="r-ava" style={{ background: avaColor(review.name + review.isl) }}>
        {review.name[0]}
      </span>
      <div className="r-body">
        <div className="r-line">
          <span className="isl-tag">{review.isl}</span>
          <span className="r-name">{review.name}</span>
          <span className="r-act">{review.act}</span>
        </div>
        <div className="r-text">{review.text}</div>
      </div>
    </li>
  );
}

/** 랜딩 커뮤니티 — 옆 카드는 고정 예시 후기, 실제 글은 커뮤니티 탭에서 본다. */
export function CommunitySection() {
  return (
    <section className="sec" id="community">
      <div className="container com-wrap">
        <div className="com-info reveal rv-l">
          <span className="eyebrow">COMMUNITY</span>
          <h2>인천섬 레저누리 커뮤니티</h2>
          <p>다른 탐험가들의 생생한 후기가 올라오는 곳이에요.</p>
          <div className="com-btns">
            <Link to="/community/write" className="btn btn-gold">
              후기 남기기
            </Link>
            <Link className="btn btn-outline" to="/community">
              전체 후기 보기
            </Link>
          </div>
        </div>
        <div className="live-card live-card--example reveal rv-r">
          <p className="live-card-example-label">예시 후기</p>
          <ul className="feed feed--example">
            {COMMUNITY_LANDING_EXAMPLE_REVIEWS.map((review) => (
              <ExampleReviewItem key={`${review.isl}-${review.act}`} review={review} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
