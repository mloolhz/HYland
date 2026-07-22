import { Link } from "react-router-dom";
import { getIslandColors } from "@/constants/island";
import { formatListDate } from "@/lib/time";
import type { MyComment } from "@/types/community";

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MyCommentCardProps = {
  comment: MyComment;
};

export function MyCommentCard({ comment }: MyCommentCardProps) {
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
          <span>{formatListDate(comment.createdAt)}</span>
          <span className="cm-my-comment-likes">· ♥ {comment.likes}</span>
        </div>
      </div>
    </article>
  );
}
