import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommunitySubPageLayout } from "@/components/community/CommunitySubPageLayout";
import { EmptyState } from "@/components/community/EmptyState";
import { MyCommentCard } from "@/components/community/MyCommentCard";
import { paginate, totalPages } from "@/lib/posts";
import { parsePageQuery } from "@/lib/query";
import { getMyComments } from "@/mocks/myActivity";

export function MyCommentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageQuery(searchParams.get("page"));
  const [myComments] = useState(() => getMyComments());

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

  const pagedComments = paginate(myComments, page);
  const pages = totalPages(myComments.length);

  return (
    <CommunitySubPageLayout title="내가 작성한 댓글" showProfileSidebar={false}>
      {myComments.length === 0 ? (
        <EmptyState
          title="아직 남긴 댓글이 없어요"
          ctaLabel="커뮤니티 둘러보기"
          onCta={() => navigate("/community")}
        />
      ) : (
        <>
          <div className="cm-my-comments">
            {pagedComments.map((comment) => (
              <MyCommentCard key={comment.id} comment={comment} />
            ))}
          </div>
          {pages > 1 && (
            <div className="cm-post-list-footer">
              <nav className="cm-pagination" aria-label="페이지">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`cm-page-btn${p === page ? " is-active" : ""}`}
                    aria-current={p === page ? "page" : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </CommunitySubPageLayout>
  );
}
