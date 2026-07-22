import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { CommentThread } from "@/components/community/CommentThread";
import { Lightbox } from "@/components/community/Lightbox";
import { CommentIcon, HeartIcon } from "@/components/community/PostActionIcons";
import { PostRow } from "@/components/community/PostRow";
import { isCurrentUser } from "@/constants/auth";
import { getIslandColors } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { countComments, filterPosts, findComment, removeComment, sortPosts } from "@/lib/posts";
import { parseIslandsQuery } from "@/lib/query";
import { formatDetailDate } from "@/lib/time";
import { getPostById, incrementPostViews, usePosts } from "@/lib/post-store";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const posts = usePosts();
  const post = id ? getPostById(id) : undefined;
  const [comments, setComments] = useState(post?.comments ?? []);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hash = location.hash;

  useEffect(() => {
    setComments(post?.comments ?? []);
  }, [post]);

  useEffect(() => {
    if (!id) return;
    incrementPostViews(id);
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
    const query = listParams.get("q") ?? "";
    return sortPosts(filterPosts(posts, { category, islands, query }), sort);
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

  const related = useMemo(() => {
    if (!post) return [];
    return posts.filter(
      (p) => !p.isNotice && p.island === post.island && p.id !== post.id,
    ).slice(0, 3);
  }, [post, posts]);

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

  const handleDeleteComment = (commentId: string) => {
    const target = findComment(comments, commentId);
    if (!target || !isCurrentUser(target.author.id)) return;
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

              <h1 className="cm-detail-title">{post.title}</h1>

              <div className="cm-detail-meta">
                <div className="cm-detail-author">
                  <AuthorAvatar author={post.author} className="cm-detail-avatar" />
                  <span className="cm-post-nick">{post.author.nickname}</span>
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

              <hr className="cm-detail-divider" />

              <div className="cm-detail-body">
                <p className="cm-detail-content">{post.content}</p>
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
                <button type="button" className="cm-action-btn cm-action-btn--like" aria-pressed={false}>
                  <HeartIcon />
                  {post.likes}
                </button>
                <span className="cm-action-btn cm-action-btn--comment">
                  <CommentIcon />
                  {countComments(post.comments)}
                </span>
                <div className="cm-detail-actions-side">
                  <button type="button" className="cm-action-btn cm-action-btn--share">
                    공유
                  </button>
                  <button type="button" className="cm-action-btn cm-action-btn--report">
                    신고
                  </button>
                </div>
              </div>

              <hr className="cm-detail-divider" />

              <CommentThread
                comments={comments}
                isLoggedIn
                onDeleteComment={handleDeleteComment}
              />
            </div>

            {related.length > 0 && (
              <section className="cm-detail-related">
                <h2 className="cm-detail-related-title">{post.island}의 다른 글</h2>
                <div className="cm-post-list cm-post-list-compact">
                  {related.map((p) => (
                    <PostRow key={p.id} post={p} columns="community" compact fromSearch={backSearch} />
                  ))}
                </div>
              </section>
            )}
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
