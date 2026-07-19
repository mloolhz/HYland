
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { avaColor, REVIEWS, type Review } from "@/lib/landing-data";

function ReviewItem({ review }: { review: Review }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
  }, []);

  return (
    <li className="review-item" ref={ref}>
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

export function CommunitySection() {
  const [items, setItems] = useState<{ id: number; review: Review }[]>([]);
  const indexRef = useRef(0);
  const idRef = useRef(0);

  useEffect(() => {
    const pushReview = () => {
      const review = REVIEWS[indexRef.current++ % REVIEWS.length];
      const id = idRef.current++;
      setItems((prev) => {
        const next = [...prev, { id, review }];
        return next.length > 2 ? next.slice(-2) : next;
      });
    };

    pushReview();
    const t1 = setTimeout(pushReview, 500);
    let tick = setInterval(pushReview, 3000);

    const card = document.getElementById("liveCard");
    const pause = () => clearInterval(tick);
    const resume = () => {
      clearInterval(tick);
      tick = setInterval(pushReview, 3000);
    };
    card?.addEventListener("mouseenter", pause);
    card?.addEventListener("mouseleave", resume);

    return () => {
      clearTimeout(t1);
      clearInterval(tick);
      card?.removeEventListener("mouseenter", pause);
      card?.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <section className="sec" id="community">
      <div className="container com-wrap">
        <div className="com-info reveal rv-l">
          <span className="eyebrow">COMMUNITY</span>
          <h2>인천섬 레저누리 커뮤니티</h2>
          <p>
            다른 탐험가들의 생생한 후기가 올라오는 곳이에요.
          </p>
          <div className="com-stats">
            <div className="cs">
              <b>1,248</b>
              <span>누적 후기</span>
            </div>
            <div className="cs">
              <b>+86</b>
              <span>이번 주 새 후기</span>
            </div>
            <div className="cs">
              <b>4.8 ★</b>
              <span>평균 만족도</span>
            </div>
          </div>
          <div className="com-btns">
            <Link to="/community" className="btn btn-gold">
              커뮤니티 바로가기
            </Link>
          </div>
        </div>
        <div className="live-card reveal rv-r" id="liveCard">
          <div className="live-head">
            <b>주요 탐험 후기</b>
          </div>
          <ul className="feed" aria-live="polite">
            {items.map(({ id, review }) => (
              <ReviewItem key={id} review={review} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
