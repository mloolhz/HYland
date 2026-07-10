import { useEffect, useRef, useState } from "react";
import { demoProps } from "@/components/landing/ToastProvider";
import { countComments } from "@/lib/posts";
import type { Comment } from "@/types/community";
import { CommentGroup } from "./CommentItem";

type CommentThreadProps = {
  comments: Comment[];
  isLoggedIn?: boolean;
};

function MainCommentInput({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        className="cm-thread-login"
        {...demoProps("댓글 작성은 로그인 후 이용할 수 있어요 💬")}
      >
        로그인하고 댓글 남기기
      </button>
    );
  }

  return (
    <div className={`cm-thread-input${focused ? " is-focused" : ""}`}>
      <span className="cm-thread-input-ava">나</span>
      {!focused ? (
        <button type="button" className="cm-thread-fake" onClick={() => setFocused(true)}>
          댓글을 남겨보세요
        </button>
      ) : (
        <>
          <textarea
            ref={inputRef}
            rows={3}
            placeholder="댓글을 남겨보세요"
            onBlur={(e) => {
              if (!e.relatedTarget?.closest(".cm-thread-input")) setFocused(false);
            }}
          />
          <button type="button" className="cm-thread-submit">
            등록
          </button>
        </>
      )}
    </div>
  );
}

export function CommentThread({ comments, isLoggedIn = false }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const total = countComments(comments);

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
              onReply={setReplyingTo}
              onCancelReply={() => setReplyingTo(null)}
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
