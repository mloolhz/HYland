import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommunitySubPageLayout } from "@/components/community/CommunitySubPageLayout";
import { EmptyState } from "@/components/community/EmptyState";
import { PostList } from "@/components/community/PostList";
import { paginate, totalPages } from "@/lib/posts";
import { parsePageQuery } from "@/lib/query";
import { usePosts } from "@/lib/post-store";
import { getLikedPosts } from "@/mocks/myActivity";

export function MyLikedPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageQuery(searchParams.get("page"));
  const posts = usePosts();
  const [likedIds, setLikedIds] = useState(() => getLikedPosts(posts).map((p) => p.id));
  const [undo, setUndo] = useState<{ postId: string } | null>(null);

  const likedPosts = useMemo(
    () => posts.filter((p) => likedIds.includes(p.id)),
    [posts, likedIds],
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

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  const handleUnlike = (postId: string) => {
    setLikedIds((ids) => ids.filter((id) => id !== postId));
    setUndo({ postId });
  };

  const handleUndoUnlike = () => {
    if (!undo) return;
    setLikedIds((ids) => [...ids, undo.postId]);
    setUndo(null);
  };

  const pagedLiked = paginate(likedPosts, page);
  const pages = totalPages(likedPosts.length);

  return (
    <>
      <CommunitySubPageLayout title="내가 누른 좋아요" showProfileSidebar={false}>
        {likedPosts.length === 0 ? (
          <EmptyState
            title="좋아요한 글이 없어요"
            ctaLabel="커뮤니티 둘러보기"
            onCta={() => navigate("/community")}
          />
        ) : (
          <PostList
            columns="liked"
            posts={pagedLiked}
            page={page}
            totalPages={pages}
            onPageChange={setPage}
            showFooter={pages > 1}
            showSearch={false}
            onUnlikePost={handleUnlike}
          />
        )}
      </CommunitySubPageLayout>

      {undo && (
        <div className="cm-undo-toast" role="status">
          좋아요를 취소했습니다
          <button type="button" onClick={handleUndoUnlike}>
            실행 취소
          </button>
        </div>
      )}
    </>
  );
}
