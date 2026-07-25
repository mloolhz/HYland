/** Hero 여권 표지 — 클릭 시 펼침 모달 트리거용 비주얼 */
export function PassportCoverVisual() {
  return (
    <div className="passport-cover__book">
      <span className="passport-cover__shadow" aria-hidden="true" />
      <span className="passport-cover__thickness" aria-hidden="true" />
      <span className="passport-cover__spine" aria-hidden="true" />
      <span className="passport-cover__pages" aria-hidden="true" />
      <div className="passport-cover__face">
        <span className="passport-cover__sheen" aria-hidden="true" />
        <div className="passport-cover__top">
          <p className="passport-cover__country">REPUBLIC OF KOREA</p>
          <p className="passport-cover__type">LEISURE PASSPORT</p>
        </div>
        <svg className="passport-cover__emblem" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="31" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
          <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.5 3.8" opacity="0.65" />
          <path d="M40 13 L43.2 19.5 L36.8 19.5 Z" fill="currentColor" />
          <path d="M40 67 L43.2 60.5 L36.8 60.5 Z" fill="currentColor" />
          <path d="M13 40 L19.5 36.8 L19.5 43.2 Z" fill="currentColor" />
          <path d="M67 40 L60.5 36.8 L60.5 43.2 Z" fill="currentColor" />
          <circle cx="40" cy="27" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path d="M40 31.5 V50" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M29 42 H51" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M40 50 C32 50 25.5 55 23 62 C29.5 58.5 34.5 58 40 58 C45.5 58 50.5 58.5 57 62 C54.5 55 48 50 40 50 Z"
            fill="currentColor"
          />
        </svg>
        <div className="passport-cover__bottom">
          <p className="passport-cover__title">i-바다패스</p>
          <p className="passport-cover__footer">INCHEON</p>
        </div>
      </div>
    </div>
  );
}
