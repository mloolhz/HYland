import { useMemo } from "react";
import { reviewTagLabel, type ReviewTagId } from "@/constants/review-tags";
import { summarizeReviewTags } from "@/lib/review-tags";
import type { Post } from "@/types/community";

type Props = {
  posts: Post[];
  island?: string;
  selected: ReviewTagId[];
  status: "idle" | "loading" | "ready" | "error";
  onSelect: (ids: ReviewTagId[]) => void;
};

export function ReviewTagSummary({ posts, island, selected, status, onSelect }: Props) {
  const summary = useMemo(() => summarizeReviewTags(posts, island ?? ""), [posts, island]);
  return <section className="cm-review-summary" aria-label="방문객들이 많이 느낀 특징">
    <h2>방문객들이 많이 느낀 특징</h2>
    {!island ? <p className="cm-review-note">섬을 하나 선택하면 많이 언급된 특징을 보고 후기를 골라볼 수 있어요.</p>
      : status === "error" ? <p className="cm-review-note" role="status">특징을 불러오지 못했어요. 잠시 후 새로고침해주세요.</p>
      : status !== "ready" ? <p className="cm-review-note" role="status">{island} 후기를 불러오는 중이에요.</p>
      : <>
        <p className="cm-review-note">{island} · 전체 후기 {summary.total}개 기준 · 특징 선택 후기 {summary.taggedReviews}개</p>
        {summary.tags.length ? <>
          <div className="cm-review-tags">
            {summary.tags.map((tag) => <button key={tag.id} type="button"
              className={`cm-review-tag${selected.includes(tag.id) ? " is-active" : ""}`}
              aria-pressed={selected.includes(tag.id)}
              aria-label={`${tag.label} ${tag.percent}%, 전체 후기 ${summary.total}개 중 ${tag.count}개`}
              onClick={() => onSelect(selected.includes(tag.id) ? selected.filter((id) => id !== tag.id) : [...selected, tag.id])}>
              {reviewTagLabel(tag.id)} <strong>{tag.percent}%</strong>
            </button>)}
          </div>
          <p className="cm-review-note">특징을 여러 개 선택하면 선택한 특징을 모두 포함한 후기를 볼 수 있어요. 비율은 전체 후기 기준이며 합계는 100%를 넘을 수 있어요.</p>
        </> : <p className="cm-review-note">{summary.total ? "아직 선택된 특징이 없어요. 후기에 이 섬에서 느낀 특징을 남겨주세요." : "아직 등록된 후기가 없어요. 첫 여행 경험을 들려주세요."}</p>}
      </>}
    {selected.length > 0 && <div className="cm-review-tags" aria-label="선택한 특징 필터">
      {selected.map((id) => <button key={id} type="button" className="cm-review-clear"
        onClick={() => onSelect(selected.filter((selectedId) => selectedId !== id))}>
        {reviewTagLabel(id)} 해제 ×
      </button>)}
      <button type="button" className="cm-review-clear" onClick={() => onSelect([])}>특징 필터 전체 해제</button>
    </div>}
  </section>;
}
