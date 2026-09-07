export function SocialButtons() {
  const handleSns = (provider: string) => {
    // TODO: OAuth 연동
    // TODO: OAuth 후 추가 정보 입력 단계 (닉네임 + 전화번호 인증, 아이디·비밀번호 스킵)
    console.log(`${provider} login`);
  };

  return (
    <div className="auth-social">
      <button type="button" className="auth-social-btn" onClick={() => handleSns("naver")}>
        <span className="auth-social-icon auth-social-naver" aria-hidden="true">
          N
        </span>
        <span className="auth-social-label">네이버</span>
      </button>
      <button type="button" className="auth-social-btn" onClick={() => handleSns("google")}>
        <span className="auth-social-icon auth-social-google" aria-hidden="true">
          G
        </span>
        <span className="auth-social-label">구글</span>
      </button>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="auth-divider">
      <span>간편 로그인</span>
    </div>
  );
}
