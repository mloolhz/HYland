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
        <p className="m-foot__info">
          문의: contact@islandquest.kr
          <br />
          제작: HYland 팀
        </p>
        <p className="m-foot__copy">© 2026 인천섬 레저누리</p>
      </div>
    </footer>
  );
}
