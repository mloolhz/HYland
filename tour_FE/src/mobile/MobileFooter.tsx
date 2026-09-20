import { Link } from "react-router-dom";
import { LEGAL_CONTEST_LABEL } from "@/content/legal";
import { demoProps } from "@/components/landing/ToastProvider";

/**
 * 모바일 푸터
 *
 * 화면 좌우 여백 안에 떠 있던 네모 박스가 아니라, 화면 아래를 가로로 꽉 채운다.
 * 하단 탭바를 걷어낸 자리에 페이지의 끝을 알려 주는 역할도 같이 한다.
 */
export function MobileFooter() {
  return (
    <footer className="m-foot">
      <div className="m-foot__inner">
        <p className="m-foot__brand">인천섬 레저누리</p>
        <nav className="m-foot__links" aria-label="푸터 링크">
          <Link to="/legal/privacy">개인정보처리방침</Link>
          <Link to="/legal/terms">이용약관</Link>
          <button type="button" className="m-foot__link-btn" {...demoProps("제휴 문의 페이지는 추후에 안내할 예정이에요.")}>
            제휴 문의
          </button>
        </nav>
        <p className="m-foot__info">
          {LEGAL_CONTEST_LABEL}
          <br />
          제작: HYland 팀
        </p>
        <p className="m-foot__copy">© 2026 인천섬 레저누리</p>
      </div>
    </footer>
  );
}
