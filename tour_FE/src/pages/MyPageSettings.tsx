import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSession } from "@/store/session";
import { deleteAccount } from "@/api/auth";
import { CONTAINER } from "@/constants/layout";
import { formatJoinDateYmd } from "@/mocks/accounts";

export function MyPageSettings() {
  const navigate = useNavigate();
  const profile = useUserProfile();
  const { signOut, token, isLoggedIn } = useSession();

  /** 로그아웃 — 예전에는 mock 플래그만 지워서 새로고침하면 다시 로그인 상태였다 */
  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleWithdraw = async () => {
    if (!window.confirm("정말 회원탈퇴하시겠습니까? 탈퇴 후에는 계정 정보를 복구할 수 없습니다.")) {
      return;
    }
    try {
      if (token) await deleteAccount(token);
    } catch (err) {
      console.error("[auth] 회원탈퇴 실패:", err);
      window.alert("탈퇴 처리에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <main className="mp-page mp-page--settings">
      <div className={CONTAINER}>
        <div className="mp-settings-head">
          <Link to="/mypage" className="mp-settings-back">
            ← 마이페이지
          </Link>
          <h2 className="mp-settings-title">설정</h2>
        </div>

        <section className="mp-section mp-settings-section" aria-label="회원 정보">
          <h3 className="mp-settings-group-title">회원 정보</h3>
          <dl className="mp-settings-info">
            <div className="mp-settings-info-row">
              <dt>닉네임</dt>
              <dd>{profile.nickname}</dd>
            </div>
            <div className="mp-settings-info-row">
              <dt>레벨</dt>
              <dd>
                Lv.{profile.level} · {profile.levelTitle}
              </dd>
            </div>
            <div className="mp-settings-info-row">
              <dt>가입일</dt>
              <dd>{formatJoinDateYmd(profile.joinedAt)}</dd>
            </div>
          </dl>
        </section>

        <section className="mp-section mp-settings-section" aria-label="계정 관리">
          <h3 className="mp-settings-group-title">계정 관리</h3>
          <ul className="mp-settings-menu">
            <li>
              <Link to="/mypage/settings/profile" className="mp-settings-menu-link">
                회원정보 수정
              </Link>
            </li>
            <li>
              <Link to="/mypage/settings/profile?tab=password" className="mp-settings-menu-link">
                비밀번호 변경
              </Link>
            </li>
            <li>
              <button type="button" className="mp-settings-menu-btn" onClick={handleWithdraw}>
                회원탈퇴
              </button>
            </li>
          </ul>
        </section>

        <div className="mp-settings-actions">
          {isLoggedIn ? (
            <button type="button" className="mp-settings-text-btn" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="mp-settings-text-btn">
              로그인
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
