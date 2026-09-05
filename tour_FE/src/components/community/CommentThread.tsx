import { useEffect, useRef, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link, useLocation } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { countComments } from "@/lib/posts";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Comment } from "@/types/community";
import { CommentGroup } from "./CommentItem";

type CommentThreadProps = {
  comments: Comment[];
  isLoggedIn?: boolean;
  onDeleteComment?: (id: string) => void;
  /** 댓글 등록 — 서버 저장은 상위(PostDetail)가 맡는다 */
  onSubmitComment?: (content: string) => Promise<void>;
};

function MainCommentInput({
  isLoggedIn,
  onSubmitComment,
}: {
  isLoggedIn: boolean;
  onSubmitComment?: (content: string) => Promise<void>;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const { buildLoginUrl } = useAuthRedirect();
  const loginUrl = buildLoginUrl(`${location.pathname}${location.search}${location.hash}`);
  const profile = useUserProfile();
  const [saving, setSaving] = useState(false);
  const canSubmit = draft.trim().length > 0 && !saving;

  const submit = async () => {
    if (!canSubmit || !onSubmitComment) return;
    setSaving(true);
    try {
      await onSubmitComment(draft.trim());
      setDraft("");
      setFocused(false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  if (!isLoggedIn) {
    return (
      <Link to={loginUrl} className="cm-thread-login">
        로그인하고 댓글 남기기
      </Link>
    );
  }

  return (
    <div className={`cm-thread-input${focused ? " is-focused" : ""}`}>
      <AuthorAvatar
        author={{ nickname: profile.nickname }}
        className="cm-comment-avatar cm-thread-input-avatar"
      />
      <div className="cm-thread-input-field">
        {!focused ? (
          <button type="button" className="cm-thread-fake" onClick={() => setFocused(true)}>
            댓글을 남겨보세요
          </button>
        ) : (
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="댓글을 남겨보세요"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest(".cm-thread-input")) {
                if (!draft.trim()) setFocused(false);
              }
            }}
          />
        )}
      </div>
      <button type="button" className="cm-thread-submit" disabled={!canSubmit} onClick={submit}>
        {saving ? "등록 중…" : "등록"}
      </button>
    </div>
  );
}

export function CommentThread({
  comments,
  isLoggedIn = false,
  onDeleteComment,
  onSubmitComment,
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const total = countComments(comments);

  const handleDeleteComment = (id: string) => {
    onDeleteComment?.(id);
  };

  const handleReply = (id: string) => {
    setReplyingTo((current) => (current === id ? null : id));
  };

  return (
    <section className="cm-detail-comments" aria-label="댓글">
      <h2 className="cm-detail-comments-title">댓글 {total}개</h2>
      {comments.length === 0 ? (
        <p className="cm-thread-empty">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
      ) : (
        <div className="cm-comment-list">
          {comments.map((c) => (
            <CommentGroup
              key={c.id}
              comment={c}
              replyingTo={replyingTo}
              onReply={handleReply}
              onCancelReply={() => setReplyingTo(null)}
              onDeleteComment={handleDeleteComment}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
      <div className="cm-thread-input-wrap">
        <MainCommentInput isLoggedIn={isLoggedIn} onSubmitComment={onSubmitComment} />
      </div>
    </section>
  );
}
