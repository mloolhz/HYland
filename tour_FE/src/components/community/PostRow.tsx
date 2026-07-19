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

type PostRowProps = {
  post: Post;
  columns: ListColumns;
  compact?: boolean;
  fromSearch?: string;
  onUnlike?: () => void;
};

const NOTICE_AUTHOR_LABEL = "관리자";

export function PostRow({
  post,
  columns,
  compact,
  fromSearch,
  onUnlike,
}: PostRowProps) {
  const location = useLocation();
  const linkSearch = fromSearch ?? location.search;
  const colors = getIslandColors(post.island);
  const replies = commentCount(post);
  const showSummary = false;
  const summary = postSummary(post, 40);
  const hasImages = (post.images?.length ?? 0) > 0;
  const gridClass = `cm-post-row-grid cm-post-row-grid--${columns}`;

  if (post.isNotice) {
    const noticeIsland = (
      <span className="cm-list-island">
        <span className="cm-list-chip cm-list-chip-notice">공지</span>
      </span>
    );
    const noticeTitle = (
      <div className="cm-list-title-col min-w-0">
        <div className="cm-list-title-line cm-list-title-line--single">
          <span className="cm-list-title cm-list-title-notice">{post.title}</span>
        </div>
        {columns === "community" && (
          <p className="cm-list-meta-mobile truncate">
            {NOTICE_AUTHOR_LABEL} · {formatListDate(post.createdAt)}
          </p>
        )}
      </div>
    );

    const noticeAuthorCell = (
      <span className="cm-list-author cm-list-hide-mobile truncate">{NOTICE_AUTHOR_LABEL}</span>
    );
    const noticeDateCell = (
      <span className="cm-list-date cm-list-hide-mobile">{formatListDate(post.createdAt)}</span>
    );
    const noticeViewsCell = <span className="cm-list-views">{post.views}</span>;

    if (columns === "liked") {
      return (
        <div className={`cm-post-row cm-post-row-notice ${gridClass}`}>
          <span className="cm-list-unlike" />
          {noticeIsland}
          {noticeTitle}
          {noticeAuthorCell}
          {noticeDateCell}
          {noticeViewsCell}
        </div>
      );
    }

    return (
      <div className={`cm-post-row cm-post-row-notice ${gridClass}`}>
        {noticeIsland}
        {noticeTitle}
        {columns === "community" && (
          <>
            {noticeAuthorCell}
            {noticeDateCell}
            {noticeViewsCell}
          </>
        )}
        {columns === "myPosts" && (
          <>
            {noticeDateCell}
            {noticeViewsCell}
          </>
        )}
      </div>
    );
  }

  const unlikeButton = columns === "liked" && (
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
  );

  const islandCell = (
    <span className="cm-list-island">
      <span className="cm-list-chip" style={{ background: colors.bg, color: colors.text }}>
        {post.island}
      </span>
    </span>
  );

  const titleCell = (
    <div className="cm-list-title-col min-w-0">
      <div
        className={`cm-list-title-line${!showSummary ? " cm-list-title-line--single" : ""}`}
      >
        {post.isResolved && <span className="cm-list-resolved-text">답변완료</span>}
        {hasImages && <PhotoIcon />}
        <span className="cm-list-title truncate">{post.title}</span>
        {replies > 0 && <span className="cm-list-comment-count">{replies}</span>}
      </div>
      {showSummary && <p className="cm-list-summary truncate">{summary}</p>}
      <p className="cm-list-meta-mobile truncate">
        {post.author.nickname} · {formatListDate(post.createdAt)}
      </p>
    </div>
  );

  const row =
    columns === "liked" ? (
      <>
        {unlikeButton}
        {islandCell}
        {titleCell}
        <span className="cm-list-author cm-list-hide-mobile truncate">{post.author.nickname}</span>
        <span className="cm-list-date cm-list-hide-mobile">{formatListDate(post.createdAt)}</span>
        <span className="cm-list-views">{post.views}</span>
      </>
    ) : (
      <>
        {islandCell}
        {titleCell}
        {columns === "community" && (
          <span className="cm-list-author cm-list-hide-mobile truncate">{post.author.nickname}</span>
        )}
        <span className="cm-list-date cm-list-hide-mobile">{formatListDate(post.createdAt)}</span>
        {(columns === "community" || columns === "myPosts") && (
          <span className="cm-list-views">{post.views}</span>
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
