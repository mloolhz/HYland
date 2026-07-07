
import { useEffect, useRef, useState } from "react";
import { avaColor, REVIEWS, type Review } from "@/lib/landing-data";
import { demoProps } from "./ToastProvider";

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
          <span className="eyebrow">COMMUNITY LIVE</span>
          <h2>커뮤니티 라이브 후기</h2>
          <p>
            다른 탐험가들의 생생한 후기가 실시간으로 올라오고 있어요. 지금 이 순간에도 누군가는 인천의 섬을
            달리는 중!
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
            <button className="btn btn-gold" {...demoProps("후기 작성은 로그인 후 이용할 수 있어요 ✍️")}>
              후기 남기기
            </button>
            <button className="btn btn-outline" {...demoProps("전체 후기 페이지는 준비 중이에요 💬")}>
              전체 후기 보기
            </button>
          </div>
        </div>
        <div className="live-card reveal rv-r" id="liveCard">
          <div className="live-head">
            <span className="live-badge">
              <span className="live-dot" />
              LIVE
            </span>
            <b>실시간 탐험 후기</b>
            <small>새 후기가 계속 올라와요</small>
          </div>
          <ul className="feed" aria-live="polite">
            {items.map(({ id, review }) => (
              <ReviewItem key={id} review={review} />
            ))}
          </ul>
          <div className="live-input">
            <div className="fake">로그인 후 후기를 남길 수 있어요</div>
            <button {...demoProps("후기 작성은 로그인 후 이용할 수 있어요 ✍️")}>작성</button>
          </div>
        </div>
      </div>
    </section>
  );
}
