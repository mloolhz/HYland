import { useRef } from "react";
import { getIslandColors } from "@/constants/island";
import { commentCount } from "@/lib/posts";
import type { Post } from "@/types/community";

type GalleryTileProps = {
  post: Post;
  index: number;
  onOpen: (index: number, trigger: HTMLButtonElement | null) => void;
};

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function GalleryTile({ post, index, onOpen }: GalleryTileProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const region = getIslandColors(post.island);
  const imageCount = post.images?.length ?? 0;
  const cover = post.images?.[0];

  return (
    <button
      ref={ref}
      type="button"
      className="cm-gallery-tile"
      aria-label={`${post.author.nickname}의 인증샷 보기`}
      onClick={() => onOpen(index, ref.current)}
    >
      {cover && <img src={cover} alt={post.title} loading="lazy" />}
      <span className="cm-gallery-island" style={{ background: region.bg, color: region.text }}>
        {post.island}
      </span>
      {post.badge && <span className="cm-gallery-badge">{post.badge}</span>}
      {imageCount > 1 && (
        <span className="cm-gallery-count">
          <CopyIcon />+{imageCount - 1}
        </span>
      )}
      <span className="cm-gallery-overlay">
        <span className="cm-gallery-overlay-nick">{post.author.nickname}</span>
        <span className="cm-gallery-overlay-stats">
          ♡ {post.likes} · 💬 {commentCount(post)}
        </span>
      </span>
    </button>
  );
}
