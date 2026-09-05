import { Link } from "react-router-dom";

export function SnsHintBanner() {
  return (
    <Link to="/login" className="auth-sns-hint">
      <span className="auth-sns-hint-icon" aria-hidden="true">
        <i className="ti ti-brand-google" />
      </span>
      <span className="auth-sns-hint-text">
        <b>SNS로 가입하셨나요?</b>
        <span>네이버·구글 버튼으로 바로 로그인하세요</span>
      </span>
      <i className="ti ti-chevron-right auth-sns-hint-arrow" aria-hidden="true" />
    </Link>
  );
}
