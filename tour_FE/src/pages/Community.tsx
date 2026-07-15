import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { FilterBar, type FilterValue, type ViewKey } from "@/components/community/FilterBar";
import { GalleryGrid } from "@/components/community/GalleryGrid";
import { Lightbox } from "@/components/community/Lightbox";
import { PostList } from "@/components/community/PostList";
import { PopularIslands } from "@/components/community/PopularIslands";
import { ProfileCard } from "@/components/community/ProfileCard";
import { SelectedIslands } from "@/components/community/SelectedIslands";
import { CONTAINER } from "@/constants/layout";
import {
  filterPosts,
  GALLERY_PAGE_SIZE,
  getNoticePosts,
  islandPostCounts,
  paginate,
  sortPosts,
  totalPages,
  type SortKey,
} from "@/lib/posts";
import { parseIslandsQuery, parsePageQuery, serializeIslandsQuery } from "@/lib/query";
import { MOCK_POSTS } from "@/mocks/posts";

function parseView(value: string | null): ViewKey {
  return value === "gallery" ? "gallery" : "list";
}

function parseSort(value: string | null): SortKey {
  return value === "popular" ? "popular" : "latest";
}

function parseCategory(value: string | null): FilterValue {
  if (value === "review" || value === "photo" || value === "question") return value;
  return "all";
}

type LightboxState = {
  postIndex: number;
  imageIndex: number;
};

export function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const lightboxFocusRef = useRef<HTMLButtonElement | null>(null);

  const view = parseView(searchParams.get("view"));
  const sort = parseSort(searchParams.get("sort"));
  const category = parseCategory(searchParams.get("category"));
  const islands = useMemo(() => parseIslandsQuery(searchParams.get("islands")), [searchParams]);
  const query = searchParams.get("q") ?? "";
  const page = parsePageQuery(searchParams.get("page"));

  const counts = useMemo(() => islandPostCounts(MOCK_POSTS), []);
  const notices = useMemo(() => getNoticePosts(MOCK_POSTS), []);

  const updateQuery = useCallback(
    (patch: {
      view?: ViewKey;
      sort?: SortKey;
      category?: FilterValue;
      islands?: Set<string>;
      q?: string;
      page?: number;
      resetPage?: boolean;
    }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (patch.view !== undefined) {
            if (patch.view === "list") next.delete("view");
            else next.set("view", patch.view);
          }
          if (patch.sort !== undefined) {
            if (patch.sort === "latest") next.delete("sort");
            else next.set("sort", patch.sort);
          }
          if (patch.category !== undefined) {
            if (patch.category === "all") next.delete("category");
            else next.set("category", patch.category);
          }
          if (patch.islands !== undefined) {
            const serialized = serializeIslandsQuery(patch.islands);
            if (serialized) next.set("islands", serialized);
            else next.delete("islands");
          }
          if (patch.q !== undefined) {
            if (!patch.q.trim()) next.delete("q");
            else next.set("q", patch.q.trim());
          }
          if (patch.resetPage) next.delete("page");
          if (patch.page !== undefined) {
            if (patch.page <= 1) next.delete("page");
            else next.set("page", String(patch.page));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const filtered = useMemo(
    () => filterPosts(MOCK_POSTS, { category, islands, query }),
    [category, islands, query],
  );
  const sorted = useMemo(() => sortPosts(filtered, sort), [filtered, sort]);
  const galleryPosts = useMemo(
    () => sorted.filter((p) => (p.images?.length ?? 0) > 0),
    [sorted],
  );
  const listPages = totalPages(sorted.length);
  const galleryPages = totalPages(galleryPosts.length, GALLERY_PAGE_SIZE);
  const paged = useMemo(() => paginate(sorted, page), [sorted, page]);
  const pagedGallery = useMemo(
    () => paginate(galleryPosts, page, GALLERY_PAGE_SIZE),
    [galleryPosts, page],
  );

  const openLightbox = (index: number, trigger: HTMLButtonElement | null) => {
    lightboxFocusRef.current = trigger;
    setLightbox({ postIndex: index, imageIndex: 0 });
  };

  const closeLightbox = () => {
    setLightbox(null);
    lightboxFocusRef.current?.focus();
  };

  const clearFilters = () => {
    updateQuery({ islands: new Set(), q: "", category: "all", resetPage: true });
  };

  const emptyMessage =
    islands.size > 0 ? "선택한 섬에 아직 글이 없어요" : "이 필터에 해당하는 글이 아직 없어요";

  const currentPages = view === "gallery" ? galleryPages : listPages;
  const safePage = Math.min(page, currentPages);

  const feedContent =
    view === "gallery" ? (
      <>
        <GalleryGrid
          posts={pagedGallery}
          hasIslandFilter={islands.size > 0}
          onOpen={(index, trigger) => openLightbox(index, trigger)}
          onClearFilters={clearFilters}
        />
        {galleryPosts.length > 0 && galleryPages > 1 && (
          <div className="cm-post-list-footer cm-gallery-footer">
            <nav className="cm-pagination" aria-label="갤러리 페이지">
              {Array.from({ length: galleryPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cm-page-btn${p === safePage ? " is-active" : ""}`}
                  aria-current={p === safePage ? "page" : undefined}
                  onClick={() => updateQuery({ page: p })}
                >
                  {p}
                </button>
              ))}
            </nav>
          </div>
        )}
      </>
    ) : (
      <PostList
        notices={notices}
        posts={paged}
        page={safePage}
        totalPages={listPages}
        query={query}
        onPageChange={(p) => updateQuery({ page: p })}
        onQueryChange={(q) => updateQuery({ q, resetPage: true })}
        emptyMessage={emptyMessage}
        onClearFilters={islands.size > 0 || query ? clearFilters : undefined}
      />
    );

  return (
    <main className="cm-page">
      <div className={CONTAINER}>
        <CommunityHeader />

        <FilterBar
          active={category}
          view={view}
          sort={sort}
          selectedIslands={islands}
          islandPostCounts={counts}
          onFilterChange={(c) => updateQuery({ category: c, resetPage: true })}
          onViewChange={(v) => updateQuery({ view: v, resetPage: true })}
          onSortChange={(s) => updateQuery({ sort: s, resetPage: true })}
          onIslandsApply={(next) => updateQuery({ islands: next, resetPage: true })}
        />

        <SelectedIslands
          islands={islands}
          onRemove={(name) => {
            const next = new Set(islands);
            next.delete(name);
            updateQuery({ islands: next, resetPage: true });
          }}
          onClear={() => updateQuery({ islands: new Set(), resetPage: true })}
        />

        <div className="cm-layout">
          <section className="cm-feed" aria-label="커뮤니티 피드">
            <div
              key={`${view}-${category}-${sort}-${[...islands].join(",")}-${query}-${safePage}`}
              className="cm-results-fade"
            >
              {feedContent}
            </div>
          </section>

          <aside className="cm-sidebar">
            <div className="cm-sidebar-sticky">
              <ProfileCard />
              <PopularIslands />
            </div>
          </aside>
        </div>
      </div>

      {lightbox !== null && pagedGallery[lightbox.postIndex] && (
        <Lightbox
          posts={pagedGallery}
          postIndex={lightbox.postIndex}
          imageIndex={lightbox.imageIndex}
          returnFocusRef={lightboxFocusRef.current}
          onClose={closeLightbox}
          onPostNavigate={(postIndex) => {
            const next = pagedGallery[postIndex];
            const lastImage = Math.max(0, (next?.images?.length ?? 1) - 1);
            setLightbox({ postIndex, imageIndex: lastImage });
          }}
          onImageNavigate={(imageIndex) => setLightbox((prev) => (prev ? { ...prev, imageIndex } : prev))}
        />
      )}
    </main>
  );
}
