import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { CommentThread } from "@/components/community/CommentThread";
import { Lightbox } from "@/components/community/Lightbox";
import { CommentIcon, HeartIcon } from "@/components/community/PostActionIcons";
import { isCurrentUser } from "@/constants/auth";
import { getIslandColors } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { PostDetailNavList } from "@/components/community/PostDetailNavList";
import { saveCommunityListSearch } from "@/lib/community-list-state";
import { getSurroundingPosts } from "@/lib/post-navigation";
import { countComments, filterPosts, findComment, removeComment, sortPosts } from "@/lib/posts";
import { parseActivitiesQuery, parseIslandsQuery } from "@/lib/query";
import { formatDetailDate } from "@/lib/time";
import { usePosts, refreshPosts } from "@/lib/post-store";
import {
  fetchPost,
  addComment as addCommentRequest,
  deleteComment as deleteCommentRequest,
  togglePostLike,
  deletePost,
  updateComment,
  updatePost,
  type PostDetail as PostDetailData,
} from "@/api/community";
import { useSession } from "@/store/session";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const posts = usePosts();
  // 상세는 목록과 별개로 부른다 — 댓글 본문과 조회수는 상세 응답에만 있다
  const [post, setPost] = useState<PostDetailData | undefined>(undefined);
  const [comments, setComments] = useState<PostDetailData["comments"]>([]);
  const { isLoggedIn, user } = useSession();
  /** 관리자 — 남의 글·댓글도 정리할 수 있다 */
  const canModerate = user?.role === "ADMIN";
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hash = location.hash;

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchPost(id)
      .then((row) => {
        if (!alive) return;
        setPost(row);
        setComments(row.comments);
        setLiked(row.likedByMe);
        setLikeCount(row.likes);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        console.error("[community] 글 상세 조회 실패:", err);
        setPost(undefined);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight");
    const t = setTimeout(() => el.classList.remove("highlight"), 1600);
    return () => clearTimeout(t);
  }, [hash]);

  const backSearch =
    (location.state as { fromSearch?: string } | null)?.fromSearch ?? "";

  useEffect(() => {
    if (backSearch) saveCommunityListSearch(backSearch);
  }, [backSearch]);

  const listParams = useMemo(
    () => new URLSearchParams(backSearch.replace(/^\?/, "")),
    [backSearch],
  );

  const navigablePosts = useMemo(() => {
    const sort = listParams.get("sort") === "popular" ? "popular" : "latest";
    const categoryParam = listParams.get("category");
    const category =
      categoryParam === "review" || categoryParam === "photo" || categoryParam === "question"
        ? categoryParam
        : "all";
    const islands = parseIslandsQuery(listParams.get("islands"));
    const activities = parseActivitiesQuery(listParams.get("activities"));
    const query = listParams.get("q") ?? "";
    return sortPosts(filterPosts(posts, { category, islands, activities, query }), sort);
  }, [posts, listParams]);

  const { prevPost, nextPost } = useMemo(() => {
    if (!post) return { prevPost: undefined, nextPost: undefined };
    const index = navigablePosts.findIndex((p) => p.id === post.id);
    if (index < 0) return { prevPost: undefined, nextPost: undefined };
    return {
      prevPost: index > 0 ? navigablePosts[index - 1] : undefined,
      nextPost: index < navigablePosts.length - 1 ? navigablePosts[index + 1] : undefined,
    };
  }, [navigablePosts, post]);

  const surroundingPosts = useMemo(() => {
    if (!post) return [];
    return getSurroundingPosts(navigablePosts, post.id);
  }, [navigablePosts, post]);

  if (!post) {
    return (
      <main className="cm-page">
        <div className={CONTAINER}>
          <div className="cm-detail-not-found">
            <p>존재하지 않는 게시글입니다</p>
            <Link to={`/community${backSearch}`} className="cm-empty-cta">
              목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const region = getIslandColors(post.island);
  const images = post.images ?? [];

  const startEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditing(true);
  };

  /** 글 수정 — 제목·내용만 고친다 (섬·활동·사진은 그대로) */
  const handleSavePost = async () => {
    if (!id || !editTitle.trim() || !editContent.trim()) return;
    setSavingPost(true);
    try {
      await updatePost(id, { title: editTitle.trim(), content: editContent.trim() });
      const fresh = await fetchPost(id);
      setPost(fresh);
      await refreshPosts();
      setEditing(false);
    } catch (err) {
      console.error("[community] 글 수정 실패:", err);
      window.alert("글을 수정하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSavingPost(false);
    }
  };

  /** 글 삭제 — 되돌릴 수 없어 한 번 묻는다 */
  const handleDeletePost = async () => {
    if (!id || !post) return;
    const ask = post.isMine
      ? "이 글을 삭제할까요? 댓글도 함께 지워지고 되돌릴 수 없어요."
      : "다른 사람의 글입니다. 관리자 권한으로 삭제할까요? 댓글도 함께 지워집니다.";
    if (!window.confirm(ask)) return;
    try {
      await deletePost(id);
      await refreshPosts();
      navigate("/community", { replace: true });
    } catch (err) {
      console.error("[community] 글 삭제 실패:", err);
      window.alert("글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  /** 댓글 등록 — 서버에 저장하고 목록을 다시 받아온다 */
  const handleAddComment = async (content: string) => {
    if (!id) return;
    try {
      await addCommentRequest(id, { content });
      const fresh = await fetchPost(id);
      setComments(fresh.comments);
    } catch (err) {
      console.error("[community] 댓글 등록 실패:", err);
    }
  };

  /** 답글 등록 */
  const handleAddReply = async (parentId: string, content: string) => {
    if (!id) return;
    try {
      await addCommentRequest(id, { content, parentId });
      const fresh = await fetchPost(id);
      setComments(fresh.comments);
    } catch (err) {
      console.error("[community] 답글 등록 실패:", err);
    }
  };

  /** 댓글 수정 */
  const handleEditComment = async (commentId: string, content: string) => {
    if (!id) return;
    try {
      await updateComment(commentId, content);
      const fresh = await fetchPost(id);
      setComments(fresh.comments);
    } catch (err) {
      console.error("[community] 댓글 수정 실패:", err);
    }
  };

  /** 좋아요 토글 — 화면을 먼저 바꾸고 실패하면 되돌린다 */
  const handleToggleLike = async () => {
    if (!id || !isLoggedIn) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await togglePostLike(id);
      setLiked(res.liked);
      setLikeCount(res.likes);
    } catch (err) {
      console.error("[community] 좋아요 실패:", err);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const target = findComment(comments, commentId);
    if (!target || !isCurrentUser(target.author.id)) return;
    // 서버에서 먼저 지우고 화면에서 뺀다 (실패하면 그대로 둔다)
    void deleteCommentRequest(commentId).catch((err: unknown) => {
      console.error("[community] 댓글 삭제 실패:", err);
    });
    setComments((prev) => removeComment(prev, commentId));
  };

  return (
    <main className="cm-page">
      <div className={CONTAINER}>
        <div className="cm-layout cm-layout--single">
          <article className="cm-detail">
            <div className="cm-detail-panel">
              <nav className="cm-detail-nav" aria-label="게시글 탐색">
                {prevPost ? (
                  <Link
                    to={`/community/${prevPost.id}`}
                    state={{ fromSearch: backSearch }}
                    className="cm-detail-nav-btn"
                  >
                    이전글
                  </Link>
                ) : (
                  <span className="cm-detail-nav-btn is-disabled" aria-disabled="true">
                    이전글
                  </span>
                )}
                {nextPost ? (
                  <Link
                    to={`/community/${nextPost.id}`}
                    state={{ fromSearch: backSearch }}
                    className="cm-detail-nav-btn"
                  >
                    다음글
                  </Link>
                ) : (
                  <span className="cm-detail-nav-btn is-disabled" aria-disabled="true">
                    다음글
                  </span>
                )}
                <Link to={`/community${backSearch}`} className="cm-detail-nav-btn">
                  목록으로
                </Link>
              </nav>

              {editing ? (
                <input
                  className="cm-detail-title-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="제목 수정"
                />
              ) : (
                <h1 className="cm-detail-title">{post.title}</h1>
              )}

              <div className="cm-detail-meta">
                <div className="cm-detail-author">
                  <AuthorAvatar author={post.author} className="cm-detail-avatar" />
                  <Link to={`/community/users/${post.author.id}`} className="cm-post-nick cm-author-link">
                    {post.author.nickname}
                  </Link>
                  <time className="cm-detail-date" dateTime={post.createdAt}>
                    {formatDetailDate(post.createdAt)}
                  </time>
                </div>

                <div className="cm-detail-tags">
                  <span className="cm-tag-island" style={{ background: region.bg, color: region.text }}>
                    {post.island}
                  </span>
                  <span className="cm-tag-activity">{post.activity}</span>
                  {post.badge && <span className="cm-badge-rare">{post.badge}</span>}
                </div>
              </div>

              <div className="cm-detail-body">
                {editing ? (
                  <div className="cm-detail-edit">
                    <textarea
                      rows={8}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      aria-label="내용 수정"
                    />
                    <div className="cm-detail-edit-actions">
                      <button
                        type="button"
                        className="cm-action-btn"
                        onClick={() => setEditing(false)}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="cm-action-btn cm-action-btn--save"
                        disabled={!editTitle.trim() || !editContent.trim() || savingPost}
                        onClick={handleSavePost}
                      >
                        {savingPost ? "저장 중…" : "저장"}
                      </button>
                    </div>
                  </div>
                ) : (
                <p className="cm-detail-content">{post.content}</p>
                )}
                {images.length > 0 && (
                  <div className="cm-detail-images">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        className="cm-detail-image-btn"
                        onClick={() => {
                          setLightboxImageIndex(i);
                          setLightboxOpen(true);
                        }}
                      >
                        <img src={src} alt={post.title} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="cm-detail-actions">
                <button
                  type="button"
                  className={`cm-action-btn cm-action-btn--like${liked ? " is-on" : ""}`}
                  aria-pressed={liked}
                  disabled={!isLoggedIn}
                  title={isLoggedIn ? undefined : "로그인 후 이용할 수 있어요"}
                  onClick={handleToggleLike}
                >
                  <HeartIcon />
                  {likeCount}
                </button>
                <span className="cm-action-btn cm-action-btn--comment">
                  <CommentIcon />
                  {countComments(comments)}
                </span>
                <div className="cm-detail-actions-side">
                  {post.isMine ? (
                    <>
                      {!editing && (
                        <button type="button" className="cm-action-btn" onClick={startEdit}>
                          수정
                        </button>
                      )}
                      <button
                        type="button"
                        className="cm-action-btn cm-action-btn--delete"
                        onClick={handleDeletePost}
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="cm-action-btn cm-action-btn--report">
                        신고
                      </button>
                      {/* 관리자는 남의 글도 정리할 수 있어야 한다 */}
                      {canModerate && (
                        <button
                          type="button"
                          className="cm-action-btn cm-action-btn--delete"
                          onClick={handleDeletePost}
                        >
                          삭제
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <CommentThread
                comments={comments}
                isLoggedIn={isLoggedIn}
                onDeleteComment={handleDeleteComment}
                onSubmitComment={handleAddComment}
                onSubmitReply={handleAddReply}
                onEditComment={handleEditComment}
              />
            </div>

            <PostDetailNavList items={surroundingPosts} fromSearch={backSearch} />
          </article>
        </div>
      </div>

      {lightboxOpen && images.length > 0 && (
        <Lightbox
          posts={[post]}
          postIndex={0}
          imageIndex={lightboxImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPostNavigate={() => {}}
          onImageNavigate={setLightboxImageIndex}
        />
      )}
    </main>
  );
}
