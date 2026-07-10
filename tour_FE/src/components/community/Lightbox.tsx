import { useCallback, useEffect, useRef } from "react";
import { ISLAND_BTI, getIslandColors } from "@/constants/island";
import { commentCount } from "@/lib/posts";
import { formatRelativeTime } from "@/lib/time";
import type { Post } from "@/types/community";

type LightboxProps = {
  posts: Post[];
  postIndex: number;
  imageIndex: number;
  onClose: () => void;
  onPostNavigate: (index: number) => void;
  onImageNavigate: (index: number) => void;
  returnFocusRef?: HTMLButtonElement | null;
};

export function Lightbox({
  posts,
  postIndex,
  imageIndex,
  returnFocusRef = null,
  onClose,
  onPostNavigate,
  onImageNavigate,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const post = posts[postIndex];
  const imageList = post?.images ?? [];
  const image = imageList[imageIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        if (imageIndex > 0) onImageNavigate(imageIndex - 1);
        else if (postIndex > 0) onPostNavigate(postIndex - 1);
      }
      if (e.key === "ArrowRight") {
        if (imageIndex < imageList.length - 1) onImageNavigate(imageIndex + 1);
        else if (postIndex < posts.length - 1) onPostNavigate(postIndex + 1);
      }
    },
    [imageIndex, imageList.length, onClose, onImageNavigate, onPostNavigate, postIndex, posts.length],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (post) return;
    returnFocusRef?.focus();
  }, [post, returnFocusRef]);

  if (!post || !image) return null;

  const region = getIslandColors(post.island);
  const btiColors = ISLAND_BTI[post.author.bti];
  const globalIndex =
    posts.slice(0, postIndex).reduce((n, p) => n + (p.images?.length ?? 1), 0) + imageIndex + 1;
  const globalTotal = posts.reduce((n, p) => n + (p.images?.length ?? 1), 0);

  return (
    <div className="cm-lightbox-backdrop" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className="cm-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="cm-lightbox-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <span className="cm-lightbox-indicator">
          {globalIndex} / {globalTotal}
        </span>

        <div className="cm-lightbox-main">
          {(postIndex > 0 || imageIndex > 0) && (
            <button
              type="button"
              className="cm-lightbox-nav cm-lightbox-prev"
              onClick={() => {
                if (imageIndex > 0) onImageNavigate(imageIndex - 1);
                else onPostNavigate(postIndex - 1);
              }}
              aria-label="이전"
            >
              ‹
            </button>
          )}

          <div className="cm-lightbox-image-area">
            <div className="cm-lightbox-image-wrap">
              <img src={image} alt={post.title} />
            </div>
            {imageList.length > 1 && (
              <div className="cm-lightbox-thumbs">
                {imageList.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`cm-lightbox-thumb${i === imageIndex ? " is-active" : ""}`}
                    onClick={() => onImageNavigate(i)}
                    aria-label={`${i + 1}번째 사진`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {(postIndex < posts.length - 1 || imageIndex < imageList.length - 1) && (
            <button
              type="button"
              className="cm-lightbox-nav cm-lightbox-next"
              onClick={() => {
                if (imageIndex < imageList.length - 1) onImageNavigate(imageIndex + 1);
                else onPostNavigate(postIndex + 1);
              }}
              aria-label="다음"
            >
              ›
            </button>
          )}
        </div>

        <aside className="cm-lightbox-panel">
          <div className="cm-lightbox-panel-head">
            <span className="cm-post-ava" style={{ background: btiColors.bg, color: btiColors.text }}>
              {post.author.nickname[0]}
            </span>
            <div>
              <b className="cm-lightbox-author">{post.author.nickname}</b>
              <span className="cm-lightbox-meta">
                <span style={{ background: region.bg, color: region.text }} className="cm-tag-island">
                  {post.island}
                </span>
                · {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>
          <h2 className="cm-lightbox-title">{post.title}</h2>
          {post.badge && <span className="cm-badge-rare cm-lightbox-badge">{post.badge}</span>}
          <p className="cm-lightbox-content">{post.content}</p>
          <div className="cm-lightbox-stats">
            ♡ {post.likes} · 💬 {commentCount(post)}
          </div>
          {post.comments.length > 0 && (
            <div className="cm-lightbox-comments">
              <b>댓글 {commentCount(post)}</b>
              {post.comments.slice(0, 3).map((c) => (
                <p key={c.id} className="cm-lightbox-comment">
                  <strong>{c.author.nickname}</strong> {c.content}
                </p>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
