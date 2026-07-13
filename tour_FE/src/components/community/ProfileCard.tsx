import { Link } from "react-router-dom";
import { ISLAND_BTI } from "@/constants/island";
import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { MOCK_POSTS } from "@/mocks/posts";

export function ProfileCard() {
  const profilePost = MOCK_POSTS.find((p) => p.author.id === CURRENT_USER_ID);
  const bti: IslandBti = profilePost?.author.bti ?? "파도형";
  const nickname = profilePost?.author.nickname ?? "이파도";
  const colors = ISLAND_BTI[bti];

  return (
    <aside className="cm-profile-card">
      <div className="cm-profile-head">
        <span className="cm-profile-ava" aria-hidden="true">
          {nickname[0]}
        </span>
        <div>
          <b className="cm-profile-name">{nickname}</b>
          <span className="cm-profile-bti" style={{ color: colors.text }}>
            {bti}
          </span>
        </div>
      </div>
      <div className="cm-profile-bars">
        <div className="cm-profile-bar-row">
          <div className="cm-profile-bar-label">
            <span>스탬프</span>
            <b>12 / 48</b>
          </div>
          <div className="cm-profile-track">
            <div className="cm-profile-fill cm-profile-fill-brand" style={{ width: "25%" }} />
          </div>
        </div>
        <div className="cm-profile-bar-row">
          <div className="cm-profile-bar-label">
            <span>배지</span>
            <b>36%</b>
          </div>
          <div className="cm-profile-track">
            <div className="cm-profile-fill cm-profile-fill-gold" style={{ width: "36%" }} />
          </div>
        </div>
      </div>
      <Link to="/community/me" className="cm-profile-activity-link">
        내 활동 보기 →
      </Link>
    </aside>
  );
}
