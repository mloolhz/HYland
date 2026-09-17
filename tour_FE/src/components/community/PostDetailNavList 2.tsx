import { Link } from "react-router-dom";
import { formatListDate } from "@/lib/time";
import type { SurroundingPost } from "@/lib/post-navigation";

type PostDetailNavListProps = {
  items: SurroundingPost[];
  fromSearch: string;
};

export function PostDetailNavList({ items, fromSearch }: PostDetailNavListProps) {
  if (items.length === 0) return null;

  return (
    <section className="cm-detail-nav-list" aria-label="전체 글 목록">
      <h2 className="cm-detail-nav-list-title">전체 글 목록</h2>
      <ol className="cm-detail-nav-list-items">
        {items.map(({ post, isCurrent }) => (
          <li key={post.id} className={isCurrent ? "is-current" : undefined}>
            {isCurrent ? (
              <span className="cm-detail-nav-list-current" aria-current="page">
                <span className="cm-detail-nav-list-label">현재 글</span>
                <span className="cm-detail-nav-list-title-text">{post.title}</span>
                <time className="cm-detail-nav-list-date" dateTime={post.createdAt}>
                  {formatListDate(post.createdAt)}
                </time>
              </span>
            ) : (
              <Link
                to={`/community/${post.id}`}
                state={{ fromSearch }}
                className="cm-detail-nav-list-link"
              >
                <span className="cm-detail-nav-list-title-text">{post.title}</span>
                <time className="cm-detail-nav-list-date" dateTime={post.createdAt}>
                  {formatListDate(post.createdAt)}
                </time>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
