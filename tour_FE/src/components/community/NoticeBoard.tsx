import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatListDate } from "@/lib/time";
import type { Post } from "@/types/community";

/** 처음에 펼쳐 두는 공지 수 — 넘치면 "더 보기" */
const VISIBLE = 3;

/**
 * 모바일 커뮤니티 맨 위 공지사항 영역.
 *
 * 모바일 카드 피드는 목록에서 공지를 빼고 있어 공지가 아예 보이지 않았다.
 * 카드 목록 위에 따로 고정한다. (PC 는 글 목록 표의 첫 줄들로 이어 붙인다 — PostRow)
 * 관리자가 글쓰기에서 "공지사항으로 등록"하면 여기 뜬다.
 */
export function NoticeBoard({ notices, className = "" }: { notices: Post[]; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(
    () => [...notices].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notices],
  );

  if (sorted.length === 0) return null;
  const shown = expanded ? sorted : sorted.slice(0, VISIBLE);

  return (
    <section className={`cm-notice-board ${className}`.trim()} aria-labelledby="cm-notice-board-title">
      <div className="cm-notice-board__head">
        <h2 id="cm-notice-board-title" className="cm-notice-board__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          공지사항
        </h2>
        <span className="cm-notice-board__count">{sorted.length}건</span>
      </div>

      <ul className="cm-notice-board__list">
        {shown.map((post) => (
          <li key={post.id}>
            <Link to={`/community/${post.id}`} className="cm-notice-board__item">
              <span className="cm-notice-board__chip">공지</span>
              <span className="cm-notice-board__item-title">{post.title}</span>
              <time className="cm-notice-board__date" dateTime={post.createdAt}>
                {formatListDate(post.createdAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>

      {sorted.length > VISIBLE && (
        <button
          type="button"
          className="cm-notice-board__more"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "접기" : `공지 ${sorted.length - VISIBLE}건 더 보기`}
        </button>
      )}
    </section>
  );
}
