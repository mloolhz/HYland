import { Link } from "react-router-dom";

/**
 * 비로그인 안내 카드 (미션 · 리더보드)
 *
 * 로그인 전에는 내 달성률도 내 순위도 없다. 그 자리에 0 으로 채운 카드를
 * 두면 "아무것도 못 깼다"는 기록처럼 보여서, 커뮤니티 사이드바와 같은
 * 모양의 로그인 안내로 바꿔 둔다.
 */
export function MissionLoginPrompt({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="ms-login-prompt" aria-label="로그인 안내">
      <p className="ms-login-prompt__title">{title}</p>
      <p className="ms-login-prompt__desc">{desc}</p>
      <Link to="/login" className="ms-login-prompt__btn">
        로그인
      </Link>
    </section>
  );
}
