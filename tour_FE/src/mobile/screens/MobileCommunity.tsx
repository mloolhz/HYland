import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePosts, usePostsStatus } from "@/lib/post-store";
import {
  commentCount,
  filterPosts,
  postSummary,
  sortPosts,
  type SortKey,
} from "@/lib/posts";
import { formatRelativeTime } from "@/lib/time";
import { getIslandColors } from "@/constants/island";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { NoticeBoard } from "@/components/community/NoticeBoard";
import { useSession } from "@/store/session";
import { useAuthSheet } from "../auth/AuthSheetProvider";
import type { Post } from "@/types/community";

type Category = "all" | Post["type"];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "review", label: "후기" },
  { key: "photo", label: "인증샷" },
  { key: "question", label: "Q&A" },
];

const PAGE_STEP = 10;

function parseCategory(value: string | null): Category {
  return value === "review" || value === "photo" || value === "question" ? value : "all";
}

function PostCard({ post }: { post: Post }) {
  const colors = getIslandColors(post.island);
  const thumb = post.images?.[0];

  return (
    <li>
      <Link to={`/community/${post.id}`} className="m-card m-post">
        <div className="m-post__body">
          <div className="m-post__top">
            {post.isNotice ? (
              <span className="m-post__island m-post__island--notice">공지</span>
            ) : (
              <>
                <span className="m-post__island" style={{ background: colors.bg, color: colors.text }}>
                  {post.island}
                </span>
                <span className="m-post__activity">{post.activity}</span>
              </>
            )}
            {post.isResolved && <span className="m-post__solved">해결됨</span>}
          </div>

          <b className="m-post__title">{post.title}</b>
          <p className="m-post__summary">{postSummary(post, 64)}</p>

          <div className="m-post__foot">
            <AuthorAvatar author={post.author} className="m-post__avatar" />
            <span className="m-post__author">{post.author.nickname}</span>
            <span className="m-post__dot" aria-hidden="true">
              ·
            </span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="m-post__stats">
              ♥ {post.likes} · 💬 {commentCount(post)} · 👁 {post.views}
            </span>
          </div>
        </div>

        {thumb && (
          <div className="m-post__thumb">
            <img src={thumb} alt="" loading="lazy" />
            {(post.images?.length ?? 0) > 1 && (
              <span className="m-post__thumb-count">+{(post.images?.length ?? 1) - 1}</span>
            )}
          </div>
        )}
      </Link>
    </li>
  );
}

/**
 * 모바일 커뮤니티
 *
 * 데스크톱은 사이드바 + 표 형태의 글 목록이다. 폰에서는 표를 버리고
 * 썸네일이 붙은 카드 피드로 바꿨고, 페이지 번호 대신 "더 보기"로 이어 붙인다.
 * 글쓰기는 화면 오른쪽 아래 떠 있는 버튼으로 뺐다.
 */
export function MobileCommunity() {
  const posts = usePosts();
  const status = usePostsStatus();
  const { isLoggedIn } = useSession();
  const { openAuth } = useAuthSheet();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = parseCategory(searchParams.get("category"));
  const sort: SortKey = searchParams.get("sort") === "popular" ? "popular" : "latest";
  const query = searchParams.get("q") ?? "";

  const [draft, setDraft] = useState(query);
  const [limit, setLimit] = useState(PAGE_STEP);

  // 필터가 바뀌면 다시 처음부터 보여준다
  useEffect(() => {
    setLimit(PAGE_STEP);
  }, [category, sort, query]);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const patch = useCallback(
    (next: { category?: Category; sort?: SortKey; q?: string }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next.category !== undefined) {
            if (next.category === "all") params.delete("category");
            else params.set("category", next.category);
          }
          if (next.sort !== undefined) {
            if (next.sort === "latest") params.delete("sort");
            else params.set("sort", next.sort);
          }
          if (next.q !== undefined) {
            if (!next.q.trim()) params.delete("q");
            else params.set("q", next.q);
          }
          params.delete("page");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const list = useMemo(() => {
    const filtered = filterPosts(posts, {
      category,
      islands: new Set<string>(),
      activities: new Set<string>(),
      query,
    });
    return sortPosts(filtered, sort);
  }, [posts, category, sort, query]);

  const visible = list.slice(0, limit);
  // 공지는 목록(filterPosts)에서 빠지므로 위에 따로 보여 준다
  const notices = useMemo(() => posts.filter((p) => p.isNotice), [posts]);

  return (
    <div className="m-screen m-cm">
      <div className="m-chips" role="tablist" aria-label="글 분류">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={category === c.key}
            className={`m-chip${category === c.key ? " is-on" : ""}`}
            onClick={() => patch({ category: c.key })}
          >
            {c.label}
          </button>
        ))}
      </div>

      <form
        className="m-search"
        onSubmit={(e) => {
          e.preventDefault();
          patch({ q: draft });
        }}
      >
        <span className="m-search__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.4" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          className="m-search__input"
          placeholder="제목·섬 이름으로 검색"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="글 검색"
        />
      </form>

      <NoticeBoard notices={notices} className="cm-notice-board--mobile" />

      <div className="m-cm__bar">
        <span className="m-isl__count">{list.length}개의 글</span>
        <div className="m-seg m-seg--sm">
          <button
            type="button"
            className={`m-seg__btn${sort === "latest" ? " is-on" : ""}`}
            onClick={() => patch({ sort: "latest" })}
          >
            최신순
          </button>
          <button
            type="button"
            className={`m-seg__btn${sort === "popular" ? " is-on" : ""}`}
            onClick={() => patch({ sort: "popular" })}
          >
            인기순
          </button>
        </div>
      </div>

      {status === "loading" && list.length === 0 ? (
        <p className="m-empty">글을 불러오는 중…</p>
      ) : status === "error" ? (
        <p className="m-empty">글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
      ) : list.length === 0 ? (
        <p className="m-empty">
          {query.trim() ? "검색 결과가 없습니다." : "이 분류에 해당하는 글이 아직 없습니다."}
        </p>
      ) : (
        <>
          <ul className="m-cm__feed">
            {visible.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </ul>

          {limit < list.length && (
            <button
              type="button"
              className="m-btn m-btn--ghost"
              onClick={() => setLimit((n) => n + PAGE_STEP)}
            >
              더 보기 ({list.length - limit}개 남음)
            </button>
          )}
        </>
      )}

      {/* 글쓰기 — 비로그인이면 로그인 시트부터 */}
      {isLoggedIn ? (
        <Link to="/community/write" className="m-fab" aria-label="글쓰기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      ) : (
        <button
          type="button"
          className="m-fab"
          aria-label="글쓰기 (로그인 필요)"
          onClick={() => openAuth("login")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
