import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ActivityTabs, type ActivityTab } from "@/components/community/ActivityTabs";
import { demoProps } from "@/components/landing/ToastProvider";
import { EmptyState } from "@/components/community/EmptyState";
import { MyCommentCard } from "@/components/community/MyCommentCard";
import { PostList } from "@/components/community/PostList";
import { PopularIslands } from "@/components/community/PopularIslands";
import { ProfileCard } from "@/components/community/ProfileCard";
import { ISLAND_BTI } from "@/constants/island";
import { isDemoLoggedIn } from "@/constants/auth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { CONTAINER } from "@/constants/layout";
import { paginate, totalPages } from "@/lib/posts";
import { parsePageQuery } from "@/lib/query";
import { useMyActivity } from "@/hooks/useMyActivity";
import { useUserProfile } from "@/hooks/useUserProfile";

function parseTab(value: string | null): ActivityTab {
  if (value === "comments" || value === "liked") return value;
  return "posts";
}

export function MyActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { buildLoginUrl } = useAuthRedirect();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const page = parsePageQuery(searchParams.get("page"));

  const { myPosts, myComments, likedPosts: likedFromServer } = useMyActivity();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  useEffect(() => setLikedIds(likedFromServer.map((p) => p.id)), [likedFromServer]);
  const [undo, setUndo] = useState<{ postId: string } | null>(null);

  // 좋아요 취소를 화면에서 즉시 반영하려고 likedIds 로 한 번 더 거른다
  const likedPosts = useMemo(
    () => likedFromServer.filter((p) => likedIds.includes(p.id)),
    [likedFromServer, likedIds],
  );

  const counts = useMemo(
    () => ({
      posts: myPosts.length,
      comments: myComments.length,
      liked: likedPosts.length,
    }),
    [myPosts.length, myComments.length, likedPosts.length],
  );

  const setTab = useCallback(
    (next: ActivityTab) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "posts") params.delete("tab");
          else params.set("tab", next);
          params.delete("page");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next <= 1) params.delete("page");
          else params.set("page", String(next));
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  if (!isDemoLoggedIn()) {
    return (
      <main className="cm-page">
        <div className={CONTAINER}>
          <EmptyState
            title="로그인하고 내 활동 보기"
            ctaLabel="로그인"
            onCta={() => navigate(buildLoginUrl(location.pathname + location.search))}
          />
        </div>
      </main>
    );
  }

  // 예전에는 mock 글에서 작성자를 뽑았다. 지금은 로그인한 사용자 프로필을 그대로 쓴다
  // (내가 쓴 글이 없어도 동작해야 하는데, 그 경우 mock 글에서 찾는 방식은 크래시했다)
  const author = useUserProfile();
  const btiColors = ISLAND_BTI[author.bti];

  const pagedPosts = paginate(myPosts, page);
  const pagedComments = paginate(myComments, page);
  const pagedLiked = paginate(likedPosts, page);
  const pages =
    tab === "posts"
      ? totalPages(myPosts.length)
      : tab === "comments"
        ? totalPages(myComments.length)
        : totalPages(likedPosts.length);

  const handleUnlike = (postId: string) => {
    setLikedIds((ids) => ids.filter((id) => id !== postId));
    setUndo({ postId });
  };

  const handleUndoUnlike = () => {
    if (!undo) return;
    setLikedIds((ids) => [...ids, undo.postId]);
    setUndo(null);
  };

  return (
    <main className="cm-page">
      <div className={CONTAINER}>
        <header className="cm-activity-header">
          <Link to="/community" className="cm-activity-back">
            ← 커뮤니티
          </Link>
          <div className="cm-activity-header-main">
            <div className="cm-activity-user">
              <span className="cm-activity-ava" style={{ background: btiColors.bg, color: btiColors.text }}>
                {author.nickname[0]}
              </span>
              <div>
                <b className="cm-activity-name">{author.nickname}</b>
                <span className="cm-activity-bti" style={{ color: btiColors.text }}>
                  {author.bti}
                </span>
              </div>
            </div>
            <button type="button" className="cm-activity-write" {...demoProps("글 작성은 로그인 후 이용할 수 있어요 ✍️")}>
              글 작성하기
            </button>
          </div>
        </header>

        <div className="cm-layout">
          <section className="cm-feed" aria-label="내 활동">
            <ActivityTabs active={tab} counts={counts} onChange={setTab} />

            {tab === "posts" && (
              <>
                {myPosts.length === 0 ? (
                  <EmptyState
                    title="아직 남긴 기록이 없어요"
                    ctaLabel="첫 글 작성하기"
                    ctaDemo="글 작성은 로그인 후 이용할 수 있어요 ✍️"
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
              </>
            )}

            {tab === "comments" && (
              <div className="cm-my-comments">
                {myComments.length === 0 ? (
                  <EmptyState title="아직 남긴 댓글이 없어요" ctaLabel="커뮤니티 둘러보기" onCta={() => navigate("/community")} />
                ) : (
                  pagedComments.map((c) => (
                    <MyCommentCard key={c.id} comment={c} />
                  ))
                )}
              </div>
            )}

            {tab === "liked" && (
              <>
                {likedPosts.length === 0 ? (
                  <EmptyState title="좋아요한 글이 없어요" ctaLabel="커뮤니티 둘러보기" onCta={() => navigate("/community")} />
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
              </>
            )}
          </section>

          <aside className="cm-sidebar">
            <div className="cm-sidebar-sticky">
              <ProfileCard />
              <PopularIslands />
            </div>
          </aside>
        </div>
      </div>

      {undo && (
        <div className="cm-undo-toast" role="status">
          좋아요를 취소했습니다
          <button type="button" onClick={handleUndoUnlike}>
            실행 취소
          </button>
        </div>
      )}
    </main>
  );
}
