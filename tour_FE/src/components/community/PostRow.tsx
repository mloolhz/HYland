import { Link, useLocation } from "react-router-dom";
import { getIslandColors } from "@/constants/island";
import { commentCount, postSummary } from "@/lib/posts";
import { formatListDate } from "@/lib/time";
import type { Post } from "@/types/community";
import type { ListColumns } from "./PostList";

function PhotoIcon() {
  return (
    <svg className="cm-list-photo-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
      <path d="M21 16l-5-5L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

type PostRowProps = {
  post: Post;
  columns: ListColumns;
  compact?: boolean;
  fromSearch?: string;
  onDelete?: () => void;
  onUnlike?: () => void;
};

export function PostRow({
  post,
  columns,
  compact,
  fromSearch,
  onDelete,
  onUnlike,
}: PostRowProps) {
  const location = useLocation();
  const linkSearch = fromSearch ?? location.search;
  const colors = getIslandColors(post.island);
  const replies = commentCount(post);
  const summary = postSummary(post, 40);
  const hasImages = (post.images?.length ?? 0) > 0;
  const gridClass = `cm-post-row-grid cm-post-row-grid--${columns}`;

  if (post.isNotice) {
    return (
      <div className={`cm-post-row cm-post-row-notice ${gridClass}`}>
        <span className="cm-list-island">
          <span className="cm-list-chip cm-list-chip-notice">공지</span>
        </span>
        <div className="cm-list-title-col min-w-0">
          <div className="cm-list-title-line cm-list-title-line--single">
            <span className="cm-list-title cm-list-title-notice">{post.title}</span>
          </div>
        </div>
        {columns !== "myPosts" && columns !== "liked" && (
          <>
            <span className="cm-list-author cm-list-hide-mobile" />
            <span className="cm-list-date cm-list-hide-mobile" />
          </>
        )}
        {columns === "myPosts" && <span className="cm-list-date cm-list-hide-mobile" />}
        <span className="cm-list-likes" />
        {columns === "myPosts" && <span className="cm-list-manage" />}
        {columns === "liked" && <span className="cm-list-unlike" />}
      </div>
    );
  }

  const row = (
    <>
      <span className="cm-list-island">
        <span className="cm-list-chip" style={{ background: colors.bg, color: colors.text }}>
          {post.island}
        </span>
      </span>
      <div className="cm-list-title-col min-w-0">
        <div className="cm-list-title-line">
          {post.isResolved && <span className="cm-list-resolved-text">답변완료</span>}
          {hasImages && <PhotoIcon />}
          <span className="cm-list-title truncate">{post.title}</span>
          {replies > 0 && <span className="cm-list-comment-count">{replies}</span>}
        </div>
        <p className="cm-list-summary truncate">{summary}</p>
        <p className="cm-list-meta-mobile truncate">
          {post.author.nickname} · {formatListDate(post.createdAt)}
        </p>
      </div>
      {columns === "community" && (
        <span className="cm-list-author cm-list-hide-mobile truncate">{post.author.nickname}</span>
      )}
      {columns === "liked" && (
        <span className="cm-list-author cm-list-hide-mobile truncate">{post.author.nickname}</span>
      )}
      <span className="cm-list-date cm-list-hide-mobile">{formatListDate(post.createdAt)}</span>
      {columns !== "liked" && <span className="cm-list-likes">{post.likes}</span>}
      {columns === "myPosts" && (
        <span className="cm-list-manage">
          <button
            type="button"
            className="cm-row-dots"
            aria-label="글 관리"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm("이 글을 삭제할까요? 댓글도 함께 사라집니다.")) onDelete?.();
            }}
          >
            <DotsIcon />
          </button>
        </span>
      )}
      {columns === "liked" && (
        <span className="cm-list-unlike">
          <button
            type="button"
            className="cm-unlike-btn"
            aria-label="좋아요 취소"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUnlike?.();
            }}
          >
            ♥
          </button>
        </span>
      )}
    </>
  );

  const className = `cm-post-row ${gridClass}${compact ? " cm-post-row-compact" : ""}`;

  if (columns === "liked") {
    return (
      <Link to={`/community/${post.id}`} state={{ fromSearch: linkSearch }} className={className}>
        {row}
      </Link>
    );
  }

  return (
    <Link to={`/community/${post.id}`} state={{ fromSearch: linkSearch }} className={className}>
      {row}
    </Link>
  );
}
