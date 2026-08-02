import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CommunitySubPageLayout } from "@/components/community/CommunitySubPageLayout";
import { EmptyState } from "@/components/community/EmptyState";
import { PostList } from "@/components/community/PostList";
import { ProfileCard } from "@/components/community/ProfileCard";
import { getUserPosts, getUserPublicProfile } from "@/lib/community-users";
import { usePosts } from "@/lib/post-store";
import { paginate, sortPosts, totalPages } from "@/lib/posts";
import { parsePageQuery } from "@/lib/query";

export function UserProfilePage() {
  const { userId = "" } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageQuery(searchParams.get("page"));
  const posts = usePosts();

  const profile = useMemo(() => getUserPublicProfile(userId, posts), [userId, posts]);
  const userPosts = useMemo(
    () => (profile ? sortPosts(getUserPosts(userId, posts), "latest") : []),
    [profile, userId, posts],
  );

  const setPage = (next: number) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next <= 1) params.delete("page");
        else params.set("page", String(next));
        return params;
      },
      { replace: true },
    );
  };

  const pagedPosts = paginate(userPosts, page);
  const pages = totalPages(userPosts.length);

  if (!profile) {
    return (
      <CommunitySubPageLayout title="프로필" showProfileSidebar={false}>
        <div className="cm-detail-not-found">
          <p>존재하지 않는 사용자입니다.</p>
          <Link to="/community" className="cm-empty-cta">
            커뮤니티로
          </Link>
        </div>
      </CommunitySubPageLayout>
    );
  }

  return (
    <CommunitySubPageLayout title={`${profile.nickname}님의 프로필`} showProfileSidebar={false}>
      <div className="cm-user-profile-layout">
        <ProfileCard userId={userId} />

        <section className="cm-user-profile-posts" aria-label={`${profile.nickname}님의 게시글`}>
          <h3 className="cm-user-profile-posts-title">작성한 게시글</h3>
          {userPosts.length === 0 ? (
            <EmptyState title="아직 작성한 글이 없어요" />
          ) : (
            <PostList
              columns="community"
              posts={pagedPosts}
              page={page}
              totalPages={pages}
              onPageChange={setPage}
              showFooter={pages > 1}
              showSearch={false}
            />
          )}
        </section>
      </div>
    </CommunitySubPageLayout>
  );
}
