import type { Post } from "@/types/community";
import { EmptyState } from "./EmptyState";
import { GalleryTile } from "./GalleryTile";
type GalleryGridProps = {
  posts: Post[];
  hasIslandFilter?: boolean;
  onOpen: (index: number, triggerRef: HTMLButtonElement | null) => void;
  onClearFilters?: () => void;
};

export function GalleryGrid({ posts, hasIslandFilter, onOpen, onClearFilters }: GalleryGridProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title={hasIslandFilter ? "선택한 섬에 사진이 없어요" : "사진이 아직 없어요"}
        description={hasIslandFilter ? undefined : "첫 인증샷을 남겨보세요"}
        ctaLabel={hasIslandFilter ? "필터 초기화" : "글 작성하기"}
        onCta={hasIslandFilter ? onClearFilters : undefined}
        ctaDemo={hasIslandFilter ? undefined : "글 작성은 로그인 후 이용할 수 있어요 ✍️"}
      />
    );
  }

  return (
    <div className="cm-gallery-grid">
      {posts.map((post, index) => (
        <GalleryTile key={post.id} post={post} index={index} onOpen={onOpen} />
      ))}
    </div>
  );
}
