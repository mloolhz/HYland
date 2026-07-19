import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/types/community";
import { PostRow } from "./PostRow";

export type ListColumns = "community" | "myPosts" | "liked";

type PostListProps = {
  columns?: ListColumns;
  notices?: Post[];
  posts: Post[];
  page?: number;
  totalPages?: number;
  query?: string;
  onPageChange?: (page: number) => void;
  onQueryChange?: (query: string) => void;
  emptyMessage?: string;
  showFooter?: boolean;
  showSearch?: boolean;
  onUnlikePost?: (id: string) => void;
};

const HEADERS: Record<ListColumns, { key: string; label: string; className?: string }[]> = {
  community: [
    { key: "island", label: "섬", className: "cm-list-col-center" },
    { key: "title", label: "제목" },
    { key: "author", label: "글쓴이", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "views", label: "조회수", className: "cm-list-col-center" },
  ],
  myPosts: [
    { key: "island", label: "섬", className: "cm-list-col-center" },
    { key: "title", label: "제목" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "views", label: "조회수", className: "cm-list-col-center" },
  ],
  liked: [
    { key: "unlike", label: "", className: "cm-list-col-center" },
    { key: "island", label: "섬", className: "cm-list-col-center" },
    { key: "title", label: "제목" },
    { key: "author", label: "글쓴이", className: "cm-list-hide-mobile" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "views", label: "조회수", className: "cm-list-col-center" },
  ],
};

function ListSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (query: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const composingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!composingRef.current) {
      setDraft(value);
    }
  }, [value]);

  const scheduleChange = useCallback(
    (next: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(next), 200);
    },
    [onChange],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return (
    <label className="cm-list-search">
      <span className="sr-only">검색</span>
      <input
        type="search"
        value={draft}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          if (!composingRef.current) {
            scheduleChange(next);
          }
        }}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          const next = e.currentTarget.value;
          setDraft(next);
          scheduleChange(next);
        }}
        placeholder="제목, 섬 이름 등으로 검색"
      />
    </label>
  );
}

export function PostList({
  columns = "community",
  notices = [],
  posts,
  page = 1,
  totalPages = 1,
  query = "",
  onPageChange,
  onQueryChange,
  emptyMessage = "첫 번째 탐험 기록을 남겨보세요",
  showFooter = true,
  showSearch = true,
  onUnlikePost,
}: PostListProps) {
  const pages = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  }, [totalPages]);

  const gridClass = `cm-post-row-grid cm-post-row-grid--${columns}`;

  return (
    <div className="cm-post-list">
      <div className={`cm-post-row cm-post-row-header ${gridClass}`} role="row">
        {HEADERS[columns].map((col) => (
          <span key={col.key} className={col.className}>
            {col.label}
          </span>
        ))}
      </div>

      {notices.map((post) => (
        <PostRow key={post.id} post={post} columns={columns} />
      ))}

      {posts.length === 0 ? (
        <div className="cm-post-list-empty">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            columns={columns}
            onUnlike={() => onUnlikePost?.(post.id)}
          />
        ))
      )}

      {showFooter && onPageChange && (
        <div className="cm-post-list-footer">
          <nav className="cm-pagination" aria-label="페이지">
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                className={`cm-page-btn${p === page ? " is-active" : ""}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
          </nav>
          {showSearch && onQueryChange && (
            <ListSearchInput value={query} onChange={onQueryChange} />
          )}
        </div>
      )}
    </div>
  );
}
