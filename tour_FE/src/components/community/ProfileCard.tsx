import { Link } from "react-router-dom";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { usePosts } from "@/lib/post-store";
import { formatJoinDate } from "@/mocks/accounts";
import { getLikedPosts, getMyComments, getMyPosts } from "@/mocks/myActivity";

function ProfilePlaceholderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type StatItem =
  | { type: "text"; label: string; value: string }
  | { type: "link"; label: string; value: string; href: string };

export function ProfileCard() {
  const posts = usePosts();
  const profile = getCurrentUserProfile();
  const postCount = getMyPosts(posts).length;
  const commentCount = getMyComments(posts).length;
  const likeCount = getLikedPosts(posts).length;

  const stats: StatItem[] = [
    { type: "text", label: "방문 횟수", value: `${profile.visitedIslandCount}회` },
    { type: "link", label: "내가 작성한 게시글", value: `${postCount}개`, href: "/community/my-posts" },
    { type: "link", label: "내가 작성한 댓글", value: `${commentCount}개`, href: "/community/my-comments" },
    { type: "link", label: "내가 누른 좋아요", value: `${likeCount}개`, href: "/community/liked" },
  ];

  return (
    <aside className="cm-profile-card">
      <div className="cm-profile-head">
        <span className="cm-profile-ava" aria-hidden="true">
          <ProfilePlaceholderIcon />
        </span>
        <div className="cm-profile-meta">
          <b className="cm-profile-name">{profile.nickname}</b>
          <span className="cm-profile-joined">{formatJoinDate(profile.joinedAt)}</span>
        </div>
      </div>

      <dl className="cm-profile-stats">
        {stats.map((stat) =>
          stat.type === "link" ? (
            <div className="cm-profile-stat" key={stat.label}>
              <Link to={stat.href} className="cm-profile-stat-link">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
              </Link>
            </div>
          ) : (
            <div className="cm-profile-stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ),
        )}
      </dl>
    </aside>
  );
}
