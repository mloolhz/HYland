import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommunitySubPageLayout } from "@/components/community/CommunitySubPageLayout";
import { EmptyState } from "@/components/community/EmptyState";
import { PostList } from "@/components/community/PostList";
import { paginate, sortPosts, totalPages } from "@/lib/posts";
import { parsePageQuery } from "@/lib/query";
import { useMyActivity } from "@/hooks/useMyActivity";

export function MyPostsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageQuery(searchParams.get("page"));
  const { myPosts: fromServer } = useMyActivity();
  const myPosts = useMemo(() => sortPosts(fromServer, "latest"), [fromServer]);

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

  const pagedPosts = paginate(myPosts, page);
  const pages = totalPages(myPosts.length);

  return (
    <CommunitySubPageLayout title="내가 작성한 게시글" showProfileSidebar={false}>
      {myPosts.length === 0 ? (
        <EmptyState
          title="아직 남긴 기록이 없어요"
          ctaLabel="첫 글 작성하기"
          onCta={() => navigate("/community/write")}
        />
      ) : (
        <PostList
          columns="myPosts"
          posts={pagedPosts}
          page={page}
          totalPages={pages}
          onPageChange={setPage}
          showFooter={pages > 1}
          showSearch={false}
        />
      )}
    </CommunitySubPageLayout>
  );
}
