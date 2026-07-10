import { useMemo } from "react";
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
  onClearFilters?: () => void;
  showFooter?: boolean;
  showSearch?: boolean;
  onDeletePost?: (id: string) => void;
  onUnlikePost?: (id: string) => void;
};

const HEADERS: Record<ListColumns, { key: string; label: string; className?: string }[]> = {
  community: [
    { key: "island", label: "섬" },
    { key: "title", label: "제목" },
    { key: "author", label: "글쓴이", className: "cm-list-hide-mobile" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "likes", label: "좋아요", className: "cm-list-col-right" },
  ],
  myPosts: [
    { key: "island", label: "섬" },
    { key: "title", label: "제목" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "likes", label: "좋아요", className: "cm-list-col-right" },
    { key: "manage", label: "관리", className: "cm-list-col-center" },
  ],
  liked: [
    { key: "island", label: "섬" },
    { key: "title", label: "제목" },
    { key: "author", label: "글쓴이", className: "cm-list-hide-mobile" },
    { key: "date", label: "작성일", className: "cm-list-hide-mobile cm-list-col-center" },
    { key: "unlike", label: "", className: "cm-list-col-center" },
  ],
};

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
  onClearFilters,
  showFooter = true,
  showSearch = true,
  onDeletePost,
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
          {onClearFilters && (
            <button type="button" className="cm-empty-cta cm-empty-cta-inline" onClick={onClearFilters}>
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            columns={columns}
            onDelete={() => onDeletePost?.(post.id)}
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
            <label className="cm-list-search">
              <span className="sr-only">검색</span>
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="제목, 섬 이름으로 검색"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
