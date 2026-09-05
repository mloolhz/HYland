import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isCurrentUser } from "@/constants/auth";
import { findAuthorInPosts, getUserCommentCount, getUserPosts, getUserPublicProfile } from "@/lib/community-users";
import { usePosts } from "@/lib/post-store";
import { formatJoinDate } from "@/mocks/accounts";
import { useMyActivity } from "@/hooks/useMyActivity";

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

type StatLink = { label: string; value: string; href: string };
type StatText = { label: string; value: string };

type ProfileCardProps = {
  userId?: string;
};

export function ProfileCard({ userId }: ProfileCardProps) {
  const posts = usePosts();
  // 훅은 분기 밖에서 부른다 (조건부 호출은 리액트 훅 규칙 위반)
  const profile = useUserProfile();
  const { myPosts, myComments, likedPosts } = useMyActivity();
  const isSelf = !userId || isCurrentUser(userId);

  if (isSelf) {
    const postCount = myPosts.length;
    const commentCount = myComments.length;
    const likeCount = likedPosts.length;

    const stats: StatLink[] = [
      { label: "내가 작성한 게시글", value: `${postCount}개`, href: "/community/my-posts" },
      { label: "내가 작성한 댓글", value: `${commentCount}개`, href: "/community/my-comments" },
      { label: "내가 누른 좋아요", value: `${likeCount}개`, href: "/community/liked" },
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
          {stats.map((stat) => (
            <div className="cm-profile-stat" key={stat.label}>
              <Link to={stat.href} className="cm-profile-stat-link">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
              </Link>
            </div>
          ))}
        </dl>

        <Link to="/community/write" className="cm-profile-write-btn">
          글 작성하기
        </Link>
      </aside>
    );
  }

  const publicProfile = getUserPublicProfile(userId, posts);
  const author = findAuthorInPosts(userId, posts);

  if (!publicProfile || !author) {
    return (
      <aside className="cm-profile-card">
        <p className="cm-profile-empty">프로필을 찾을 수 없어요.</p>
      </aside>
    );
  }

  const postCount = getUserPosts(userId, posts).length;
  const commentCount = getUserCommentCount(userId, posts);

  const stats: StatText[] = [
    { label: "작성한 게시글", value: `${postCount}개` },
    { label: "작성한 댓글", value: `${commentCount}개` },
  ];

  return (
    <aside className="cm-profile-card cm-profile-card--other">
      <div className="cm-profile-head">
        <span className="cm-profile-ava" aria-hidden="true">
          <ProfilePlaceholderIcon />
        </span>
        <div className="cm-profile-meta">
          <b className="cm-profile-name">{publicProfile.nickname}</b>
          <p className="cm-profile-subline">
            <span className="cm-profile-bti">{publicProfile.bti}</span>
            <span className="cm-profile-subline-sep" aria-hidden="true">
              ·
            </span>
            <span className="cm-profile-joined">{formatJoinDate(publicProfile.joinedAt)}</span>
          </p>
        </div>
      </div>

      <dl className="cm-profile-stats">
        {stats.map((stat) => (
          <div className="cm-profile-stat" key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
