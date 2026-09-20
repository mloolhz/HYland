import { Link } from "react-router-dom";

/**
 * 모바일 404
 *
 * 데스크톱 NotFound 는 자기 안에서 SiteHeader/SiteFooter 를 또 그린다.
 * 모바일 셸에 넣으면 상단바·탭바가 이미 있는데도 숨겨진 헤더와 내비 서랍이
 * DOM 에 남아 탭 이동이 그쪽으로 새 버린다. 모바일은 본문만 그린다.
 */
export function MobileNotFound() {
  return (
    <div className="m-screen m-404">
      <p className="m-404__code" aria-hidden="true">
        404
      </p>
      <h1 className="m-404__title">페이지를 찾을 수 없어요</h1>
      <p className="m-404__desc">주소가 잘못되었거나 삭제된 페이지일 수 있어요.</p>
      <div className="m-404__actions">
        <Link to="/" className="m-btn m-btn--primary">
          홈으로 돌아가기
        </Link>
        <Link to="/community" className="m-btn m-btn--ghost">
          커뮤니티 보기
        </Link>
      </div>
    </div>
  );
}
