import { Link } from "react-router-dom";
import { getIslandColors } from "@/constants/island";
import { formatRelativeTime } from "@/lib/time";
import type { MyComment } from "@/types/community";

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

type MyCommentCardProps = {
  comment: MyComment;
  onDelete?: () => void;
};

export function MyCommentCard({ comment, onDelete }: MyCommentCardProps) {
  const colors = getIslandColors(comment.post.island);

  return (
    <article className="cm-my-comment-card">
      <Link
        to={`/community/${comment.post.id}#comment-${comment.id}`}
        className="cm-my-comment-origin"
      >
        <span className="cm-my-comment-origin-chip" style={{ background: colors.bg, color: colors.text }}>
          {comment.post.island}
        </span>
        <span className="cm-my-comment-origin-title truncate">{comment.post.title}</span>
        <ArrowIcon />
      </Link>
      {comment.parentAuthor && (
        <p className="cm-my-comment-reply-to">└ @{comment.parentAuthor}에게 답글</p>
      )}
      <div className="cm-my-comment-body">
        <p className="cm-my-comment-text">{comment.content}</p>
        <div className="cm-my-comment-meta">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <span>· ♡ {comment.likes}</span>
        </div>
        <button
          type="button"
          className="cm-my-comment-menu"
          aria-label="댓글 관리"
          onClick={() => {
            if (window.confirm("이 댓글을 삭제할까요?")) onDelete?.();
          }}
        >
          <DotsIcon />
        </button>
      </div>
    </article>
  );
}
