import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { formatDetailDate } from "@/lib/time";
import type { Comment } from "@/types/community";
import { toggleCommentLike } from "@/api/community";
import { useSession } from "@/store/session";

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function CommentMenu({
  isOwner,
  onDelete,
  onEdit,
}: {
  isOwner: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuItems = isOwner ? (["수정", "삭제"] as const) : (["신고"] as const);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const handleSelect = (item: (typeof menuItems)[number]) => {
    setOpen(false);
    if (item === "삭제") {
      if (window.confirm("이 댓글을 삭제할까요?")) onDelete?.();
    }
    if (item === "수정") onEdit?.();
  };

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
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(item)}
            >
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
  onSubmit,
}: {
  mention: string;
  onCancel: () => void;
  onSubmit?: (content: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    if (!draft.trim() || saving || !onSubmit) return;
    setSaving(true);
    try {
      await onSubmit(draft.trim());
      setDraft("");
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cm-inline-reply">
      <span className="cm-mention-chip">@{mention}</span>
      <textarea
        ref={inputRef}
        rows={2}
        placeholder="답글을 남겨보세요"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="cm-inline-reply-actions">
        <button type="button" className="cm-inline-cancel" onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className="cm-thread-submit"
          disabled={!draft.trim() || saving}
          onClick={submit}
        >
          {saving ? "등록 중…" : "등록"}
        </button>
      </div>
    </div>
  );
}

type CommentBubbleProps = {
  comment: Comment;
  isReply?: boolean;
  onReply?: () => void;
  onDelete?: () => void;
  onEdit?: (content: string) => Promise<void>;
  showReplyButton?: boolean;
};

export function CommentBubble({
  comment,
  isReply,
  onReply,
  onDelete,
  onEdit,
  showReplyButton,
}: CommentBubbleProps) {
  const { isLoggedIn, user } = useSession();
  // 예전에는 mock 상수(CURRENT_USER_ID="u1")와 비교해서, 내 댓글인데도
  // 수정·삭제 메뉴가 뜨지 않았다. 실제 로그인 사용자와 비교한다.
  const isOwner = Boolean(user && user.id === comment.author.id);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const submitEdit = async () => {
    if (!draft.trim() || saving || !onEdit) return;
    setSaving(true);
    try {
      await onEdit(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  /** 좋아요 토글 — 화면을 먼저 바꾸고 실패하면 되돌린다 */
  const handleToggleLike = async () => {
    if (!isLoggedIn) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const r = await toggleCommentLike(comment.id);
      setLiked(r.liked);
      setLikeCount(r.likes);
    } catch (err) {
      console.error("[community] 댓글 좋아요 실패:", err);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  return (
    <div id={`comment-${comment.id}`} className={`cm-comment-bubble${isReply ? " cm-comment-bubble-reply" : ""}`}>
      <div className="cm-comment-bubble-top">
        <div className="cm-comment-head">
          <AuthorAvatar
            author={comment.author}
            className={isReply ? "cm-comment-avatar cm-comment-avatar--reply" : "cm-comment-avatar"}
          />
          <Link to={`/community/users/${comment.author.id}`} className="cm-comment-nick cm-author-link">
            {comment.author.nickname}
          </Link>
          {comment.isAuthor && <span className="cm-chip cm-chip-author">작성자</span>}
          <time className="cm-comment-time" dateTime={comment.createdAt}>
            {formatDetailDate(comment.createdAt)}
          </time>
        </div>
        <CommentMenu isOwner={isOwner} onDelete={onDelete} onEdit={() => setEditing(true)} />
      </div>
      {editing ? (
        <div className="cm-comment-edit">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="댓글 수정"
          />
          <div className="cm-inline-reply-actions">
            <button
              type="button"
              className="cm-inline-cancel"
              onClick={() => {
                setDraft(comment.content);
                setEditing(false);
              }}
            >
              취소
            </button>
            <button
              type="button"
              className="cm-thread-submit"
              disabled={!draft.trim() || saving}
              onClick={submitEdit}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <p className="cm-comment-body">{comment.content}</p>
      )}
      <div className="cm-comment-actions">
        <button
          type="button"
          className={`cm-comment-action${liked ? " is-on" : ""}`}
          aria-pressed={liked}
          disabled={!isLoggedIn}
          title={isLoggedIn ? undefined : "로그인 후 이용할 수 있어요"}
          onClick={handleToggleLike}
        >
          {liked ? "♥" : "♡"} {likeCount}
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
  onDeleteComment: (id: string) => void;
  /** 답글 등록 — 부모 댓글 id 와 내용 */
  onSubmitReply?: (parentId: string, content: string) => Promise<void>;
  onEditComment?: (id: string, content: string) => Promise<void>;
  isLoggedIn: boolean;
};

export function CommentGroup({
  comment,
  replyingTo,
  onReply,
  onCancelReply,
  onDeleteComment,
  onSubmitReply,
  onEditComment,
  isLoggedIn,
}: CommentGroupProps) {
  return (
    <div className="cm-comment-group">
      <CommentBubble
        comment={comment}
        showReplyButton={isLoggedIn}
        onReply={() => onReply(comment.id)}
        onDelete={() => onDeleteComment(comment.id)}
        onEdit={onEditComment && ((content) => onEditComment(comment.id, content))}
      />
      {replyingTo === comment.id && (
        <InlineReplyInput
          mention={comment.author.nickname}
          onCancel={onCancelReply}
          onSubmit={onSubmitReply && ((content) => onSubmitReply(comment.id, content))}
        />
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="cm-replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="cm-comment-reply-wrap">
              <CommentBubble
                comment={reply}
                isReply
                showReplyButton={isLoggedIn}
                onReply={() => onReply(reply.id)}
                onDelete={() => onDeleteComment(reply.id)}
                onEdit={onEditComment && ((content) => onEditComment(reply.id, content))}
              />
              {replyingTo === reply.id && (
                <InlineReplyInput
                  mention={reply.author.nickname}
                  onCancel={onCancelReply}
                  onSubmit={onSubmitReply && ((content) => onSubmitReply(reply.id, content))}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
