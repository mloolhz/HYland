import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export function RouterError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = is404
    ? "요청하신 페이지를 찾을 수 없어요."
    : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";

  return (
    <main className="not-found-page">
      <div className="container not-found-inner">
        <p className="not-found-code">{is404 ? "404" : "!"}</p>
        <h1>{is404 ? "페이지를 찾을 수 없어요" : "문제가 발생했어요"}</h1>
        <p className="not-found-desc">{message}</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-navy">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
