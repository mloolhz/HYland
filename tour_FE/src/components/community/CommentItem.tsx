import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/time";
import { ISLAND_BTI } from "@/constants/island";
import type { Comment } from "@/types/community";

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function CommentMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="cm-comment-menu" ref={ref}>
      <button
        type="button"
        className="cm-comment-dots"
        aria-label="댓글 메뉴"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <DotsIcon />
      </button>
      {open && (
        <div className="cm-comment-dropdown" role="menu">
          {(["수정", "삭제", "신고"] as const).map((item) => (
            <button key={item} type="button" role="menuitem" onClick={() => setOpen(false)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InlineReplyInput({
  mention,
  onCancel,
}: {
  mention: string;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="cm-inline-reply">
      <span className="cm-mention-chip">@{mention}</span>
      <textarea ref={inputRef} rows={2} placeholder="답글을 남겨보세요" />
      <div className="cm-inline-reply-actions">
        <button type="button" className="cm-inline-cancel" onClick={onCancel}>
          취소
        </button>
        <button type="button" className="cm-thread-submit">
          등록
        </button>
      </div>
    </div>
  );
}

type CommentBubbleProps = {
  comment: Comment;
  isReply?: boolean;
  onReply?: () => void;
  showReplyButton?: boolean;
};

export function CommentBubble({ comment, isReply, onReply, showReplyButton }: CommentBubbleProps) {
  const btiColors = ISLAND_BTI[comment.author.bti];
  const avaSize = isReply ? 26 : 28;

  return (
    <div id={`comment-${comment.id}`} className={`cm-comment-bubble${isReply ? " cm-comment-bubble-reply" : ""}`}>
      <div className="cm-comment-bubble-top">
        <div className="cm-comment-head">
          <span
            className="cm-comment-ava"
            style={{
              width: avaSize,
              height: avaSize,
              background: btiColors.bg,
              color: btiColors.text,
            }}
          >
            {comment.author.nickname[0]}
          </span>
          <span className="cm-comment-nick">{comment.author.nickname}</span>
          {comment.isAuthor ? (
            <span className="cm-chip cm-chip-author">작성자</span>
          ) : (
            <span className="cm-chip" style={{ background: btiColors.bg, color: btiColors.text }}>
              {comment.author.bti}
            </span>
          )}
          <span className="cm-comment-time">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <CommentMenu />
      </div>
      <p className="cm-comment-body">{comment.content}</p>
      <div className="cm-comment-actions">
        <button type="button" className="cm-comment-action" aria-pressed={false}>
          ♡ {comment.likes}
        </button>
        {showReplyButton && onReply && (
          <button type="button" className="cm-comment-action" onClick={onReply}>
            답글
          </button>
        )}
      </div>
    </div>
  );
}

type CommentGroupProps = {
  comment: Comment;
  replyingTo: string | null;
  onReply: (id: string) => void;
  onCancelReply: () => void;
  isLoggedIn: boolean;
};

export function CommentGroup({
  comment,
  replyingTo,
  onReply,
  onCancelReply,
  isLoggedIn,
}: CommentGroupProps) {
  return (
    <div className="cm-comment-group">
      <CommentBubble
        comment={comment}
        showReplyButton={isLoggedIn}
        onReply={() => onReply(comment.id)}
      />
      {replyingTo === comment.id && (
        <InlineReplyInput mention={comment.author.nickname} onCancel={onCancelReply} />
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="cm-replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="cm-comment-reply-wrap">
              <CommentBubble comment={reply} isReply />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
