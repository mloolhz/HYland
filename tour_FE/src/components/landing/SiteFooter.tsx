import { Link } from "react-router-dom";
import { LEGAL_CONTEST_LABEL } from "@/content/legal";
import { demoProps } from "./ToastProvider";

export function SiteFooter() {
  return (
    <footer id="guide">
      <div className="container">
        <div className="foot-main">
          <div className="foot-info">
            <span>© 2026 인천섬 레저누리</span>
            <span>{LEGAL_CONTEST_LABEL}</span>
            <span>제작: HYland 팀</span>
          </div>
          <nav className="foot-links" aria-label="푸터 링크">
            <Link to="/legal/privacy">개인정보처리방침</Link>
            <Link to="/legal/terms">이용약관</Link>
            <button type="button" className="foot-link-btn" {...demoProps("제휴 문의 페이지는 추후에 안내할 예정이에요.")}>
              제휴 문의
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
