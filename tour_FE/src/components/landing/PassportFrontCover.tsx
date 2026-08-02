/** 모달 여권 앞표지 — 닫힌 상태에서 보이는 네이비·골드 표지 */
import { PassportIslandEmblem } from "./PassportIslandEmblem";

export function PassportFrontCover() {
  return (
    <div className="passport-front-cover">
      <div className="passport-front-cover__face passport-front-cover__face--front">
        <span className="passport-front-cover__sheen" aria-hidden="true" />
        <p className="passport-front-cover__title">
          ISLAND
          <br />
          PASSPORT
        </p>
        <PassportIslandEmblem className="passport-front-cover__emblem" />
        <p className="passport-front-cover__footer">INCHEON</p>
      </div>
      <div className="passport-front-cover__face passport-front-cover__face--back" aria-hidden="true">
        <div className="passport-front-cover__inner-paper" />
      </div>
    </div>
  );
}
