import { demoProps } from "./ToastProvider";

export function SiteFooter() {
  return (
    <footer id="guide">
      <div className="container">
        <div className="foot-main">
          <div className="foot-info">
            <span>© 2026 ISLAND QUEST · 인천 섬 레저 탐험대</span>
            <span>문의: contact@islandquest.kr</span>
          </div>
          <nav className="foot-links" aria-label="푸터 링크">
            <a href="#" {...demoProps("개인정보처리방침 페이지는 준비 중이에요 📄")}>
              개인정보처리방침
            </a>
            <a href="#" {...demoProps("이용약관 페이지는 준비 중이에요 📄")}>
              이용약관
            </a>
            <a href="#" {...demoProps("제휴 문의 페이지는 준비 중이에요 🤝")}>
              제휴 문의
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
