import { Link } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export function CitizenBanner() {
  const { authSearch } = useAuthRedirect();

  return (
    <Link to={`/signup${authSearch}`} className="auth-citizen-banner">
      <span className="auth-citizen-icon" aria-hidden="true">
        <i className="ti ti-id-badge-2" />
      </span>
      <span className="auth-citizen-text">
        <b>인천시민이신가요?</b>
        <span>가입 후 인증하면 예약 할인·추가 미션 혜택을 받을 수 있어요</span>
      </span>
      <i className="ti ti-chevron-right auth-citizen-arrow" aria-hidden="true" />
    </Link>
  );
}
