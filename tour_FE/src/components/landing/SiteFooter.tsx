import { demoProps } from "./ToastProvider";

export function SiteFooter() {
  return (
    <footer id="guide">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <b>⚓ ISLAND QUEST</b>
            <p>
              인천 섬 레저 탐험대는 인천 168개 섬의 레저스포츠 정보를 한곳에 모아, 탐험하듯 즐기는 새로운
              섬 여행 경험을 제안합니다.
            </p>
          </div>
          <div>
            <h4>서비스</h4>
            <ul>
              <li>
                <a href="#map">섬 지도 탐험</a>
              </li>
              <li>
                <a href="#booking">레저 스포츠 예약</a>
              </li>
              <li>
                <a href="#mission">미션 &amp; 인증</a>
              </li>
              <li>
                <a href="#leaderboard">탐험가 리더보드</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>이용 가이드</h4>
            <ul>
              <li>
                <a href="#" {...demoProps("이용 가이드 페이지는 준비 중이에요 📖")}>
                  서비스 이용 방법
                </a>
              </li>
              <li>
                <a href="#" {...demoProps("안전 수칙 페이지는 준비 중이에요 🛟")}>
                  해양 레저 안전 수칙
                </a>
              </li>
              <li>
                <a href="#" {...demoProps("FAQ 페이지는 준비 중이에요 ❓")}>
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="https://isum.incheon.go.kr" target="_blank" rel="noopener noreferrer">
                  인천섬포털 ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>문의</h4>
            <ul>
              <li>
                <a href="#" {...demoProps("문의 메일 주소는 추후 공개돼요 📮")}>
                  contact@islandquest.kr
                </a>
              </li>
              <li>
                <a href="#" {...demoProps("제휴 문의 페이지는 준비 중이에요 🤝")}>
                  파트너 제휴
                </a>
              </li>
              <li>
                <a href="#" {...demoProps("약관 페이지는 준비 중이에요 📄")}>
                  이용약관 · 개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 ISLAND QUEST · 인천 섬 레저 탐험대</span>
          <span>인천 섬 레저스포츠 활성화 공모전 출품 데모 페이지입니다</span>
        </div>
      </div>
    </footer>
  );
}
