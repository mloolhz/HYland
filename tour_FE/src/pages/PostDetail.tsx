import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CommentThread } from "@/components/community/CommentThread";
import { Lightbox } from "@/components/community/Lightbox";
import { PostRow } from "@/components/community/PostRow";
import { ISLAND_BTI, getIslandColors } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { countComments } from "@/lib/posts";
import { formatRelativeTime } from "@/lib/time";
import { getPostById, MOCK_POSTS } from "@/mocks/posts";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const post = id ? getPostById(id) : undefined;
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hash = location.hash;

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

  const related = useMemo(() => {
    if (!post) return [];
    return MOCK_POSTS.filter(
      (p) => !p.isNotice && p.island === post.island && p.id !== post.id,
    ).slice(0, 3);
  }, [post]);

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
  const btiColors = ISLAND_BTI[post.author.bti];
  const images = post.images ?? [];

  return (
    <main className="cm-page">
      <div className={CONTAINER}>
        <div className="cm-layout cm-layout--single">
          <article className="cm-detail">
            <Link
              to={`/community${backSearch}`}
              className="cm-detail-back"
              aria-label="커뮤니티 목록으로 돌아가기"
            >
              ← 목록으로
            </Link>

            <h1 className="cm-detail-title">{post.title}</h1>

            <div className="cm-detail-meta">
              <div className="cm-detail-author">
                <span className="cm-post-ava" style={{ background: btiColors.bg, color: btiColors.text }}>
                  {post.author.nickname[0]}
                </span>
                <span className="cm-post-nick">{post.author.nickname}</span>
                <span className="cm-chip" style={{ background: btiColors.bg, color: btiColors.text }}>
                  {post.author.bti}
                </span>
                <span className="cm-post-time">· {formatRelativeTime(post.createdAt)}</span>
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

            <hr className="cm-detail-divider" />

            <div className="cm-detail-actions">
              <button type="button" className="cm-action-btn" aria-pressed={false}>
                ♡ {post.likes}
              </button>
              <span className="cm-action-btn">💬 {countComments(post.comments)}</span>
              <button type="button" className="cm-action-btn">
                공유
              </button>
            </div>

            <hr className="cm-detail-divider" />

            <CommentThread comments={post.comments} />

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
