import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { countComments } from "@/lib/posts";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Comment } from "@/types/community";
import { CommentGroup } from "./CommentItem";

type CommentThreadProps = {
  comments: Comment[];
  isLoggedIn?: boolean;
  onDeleteComment?: (id: string) => void;
};

function MainCommentInput({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const { buildLoginUrl } = useAuthRedirect();
  const loginUrl = buildLoginUrl(`${location.pathname}${location.search}${location.hash}`);
  const profile = getCurrentUserProfile();
  const canSubmit = draft.trim().length > 0;

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
      <button type="button" className="cm-thread-submit" disabled={!canSubmit}>
        등록
      </button>
    </div>
  );
}

export function CommentThread({
  comments,
  isLoggedIn = false,
  onDeleteComment,
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
        <MainCommentInput isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}
