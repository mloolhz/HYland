import { LogoIcon } from "./LogoIcon";

export function PortalBand() {
  return (
    <section className="sec" id="portal" style={{ paddingBottom: 0 }}>
      <div className="container">
        <div className="portal-band reveal rv-z">
          <LogoIcon size={72} />
          <div className="pb-txt">
            <h3>인천섬포털 바로가기</h3>
            <p>
              여객선 시간표, 섬별 관광 정보, 체험 프로그램 신청까지 — 더 많은 섬 정보를 공식 포털에서
              확인하세요.
            </p>
          </div>
          <a
            className="btn btn-white"
            href="https://isum.incheon.go.kr"
            target="_blank"
            rel="noopener noreferrer"
          >
            인천섬포털 방문하기 ↗
          </a>
        </div>
      </div>
    </section>
  );
}
