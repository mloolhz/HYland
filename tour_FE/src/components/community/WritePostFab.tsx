import { Link } from "react-router-dom";

export function WritePostFab() {
  return (
    <Link to="/community/write" className="cm-write-fab" aria-label="글 작성하기">
      글 작성하기
    </Link>
  );
}
