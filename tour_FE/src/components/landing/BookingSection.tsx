import { Link } from "react-router-dom";

const BOOKINGS = [
  { icon: "🏄", cls: "t-sup", title: "SUP 체험", desc: "덕적도 · 서포리 해수욕장 · 강습 포함", price: "₩30,000" },
  { icon: "🚴", cls: "t-cyc", title: "해안 사이클 투어", desc: "영종도 · 씨사이드파크 코스 · 자전거 대여 포함", price: "₩25,000" },
  { icon: "🤿", cls: "t-snk", title: "스노클링 체험", desc: "백령도 · 장비 대여 포함 · 안전요원 동행", price: "₩35,000" },
  { icon: "🛶", cls: "t-kay", title: "카약 선셋 투어", desc: "무의도 · 하나개 해수욕장 · 일몰 시간대 한정", price: "₩28,000" },
] as const;

export function BookingSection() {
  return (
    <section className="sec" id="booking">
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">📅</span>
          <h2>레저 스포츠 예약</h2>
          <Link className="more" to="/reservation">
            더보기 →
          </Link>
        </div>
        <p className="sec-sub reveal">원하는 섬과 스포츠를 선택하고 간편하게 예약하세요.</p>
        <div className="book-card reveal">
          {BOOKINGS.map((item) => (
            <div className="row" key={item.title}>
              <div className={`thumb2 ${item.cls}`}>{item.icon}</div>
              <div className="info">
                <b>{item.title}</b>
                <span>{item.desc}</span>
              </div>
              <div className="price">{item.price}</div>
              <Link className="go" to="/reservation">
                예약
              </Link>
            </div>
          ))}
          <div className="book-foot">
            <Link className="btn btn-outline btn-block" to="/reservation">
              전체 예약 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
