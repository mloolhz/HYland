import { PassportIslandEmblem } from "./PassportIslandEmblem";

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
        <p className="passport-cover__title">
          ISLAND
          <br />
          PASSPORT
        </p>
        <PassportIslandEmblem className="passport-cover__emblem" />
        <p className="passport-cover__footer">INCHEON</p>
      </div>
    </div>
  );
}
