import { demoProps } from "./ToastProvider";

const BOOKINGS = [
  { icon: "🏄", cls: "t-sup", title: "SUP 체험", desc: "덕적도 · 서포리 해수욕장 · 강습 포함", price: "₩30,000" },
  { icon: "🚴", cls: "t-cyc", title: "해안 사이클 투어", desc: "영종도 · 씨사이드파크 코스 · 자전거 대여 포함", price: "₩25,000" },
  { icon: "🤿", cls: "t-snk", title: "스노클링 체험", desc: "백령도 · 장비 대여 포함 · 안전요원 동행", price: "₩35,000" },
  { icon: "🛶", cls: "t-kay", title: "카약 선셋 투어", desc: "무의도 · 하나개 해수욕장 · 일몰 시간대 한정", price: "₩28,000" },
] as const;

export function BookingSection() {
  return (
    <section className="sec" id="booking" style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">📅</span>
          <h2>레저 스포츠 예약</h2>
          <a className="more" href="#" {...demoProps("예약 전체 보기는 준비 중이에요 📅")}>
            더보기 →
          </a>
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
              <button className="go" {...demoProps("예약 기능은 준비 중이에요 📅")}>
                예약
              </button>
            </div>
          ))}
          <div className="book-foot">
            <button className="btn btn-outline btn-block" {...demoProps("전체 예약 페이지는 준비 중이에요 📅")}>
              전체 예약 보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
