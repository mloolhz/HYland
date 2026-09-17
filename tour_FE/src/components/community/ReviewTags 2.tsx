import { useId } from "react";
import { MAX_REVIEW_TAGS, normalizeReviewTags, REVIEW_TAG_CATEGORIES, REVIEW_TAGS, reviewTagLabel, type ReviewTagId } from "@/constants/review-tags";

export function ReviewTagChips({ tags }: { tags?: ReviewTagId[] }) {
  const ids = normalizeReviewTags(tags);
  if (!ids.length) return null;
  return <div className="cm-review-tags cm-review-tags--quiet" aria-label="이 섬에서 느낀 특징">
    {ids.map((id) => <span key={id} className="cm-review-tag">{reviewTagLabel(id)}</span>)}
  </div>;
}

export function ReviewTagPicker({ value, onChange }: { value: ReviewTagId[]; onChange: (tags: ReviewTagId[]) => void }) {
  const id = useId();
  const full = value.length >= MAX_REVIEW_TAGS;
  return <fieldset className="cm-review-picker" aria-describedby={`${id}-hint ${id}-status`}>
    <legend className="cm-write-label">이 섬에서 느낀 특징을 골라주세요</legend>
    <p id={`${id}-hint`} className="cm-review-note">여행하면서 가장 인상 깊었던 특징을 최대 {MAX_REVIEW_TAGS}개까지 선택할 수 있어요.</p>
    <p id={`${id}-status`} className="cm-review-note" role="status">
      <strong>{value.length}/{MAX_REVIEW_TAGS}</strong> · {full ? "최대 개수를 선택했어요. 다른 특징을 고르려면 선택한 특징을 해제해주세요." : value.length ? "선택한 특징을 다시 누르면 해제할 수 있어요." : "최소 1개를 선택해주세요."}
    </p>
    {REVIEW_TAG_CATEGORIES.map((category) => <fieldset key={category.id} className="cm-review-tag-group">
      <legend>{category.label}</legend>
      <div className="cm-review-tags">
        {REVIEW_TAGS.filter((tag) => tag.category === category.id).map((tag) => {
          const selected = value.includes(tag.id);
          return <button key={tag.id} type="button" className={`cm-review-tag${selected ? " is-active" : ""}`}
            aria-pressed={selected} disabled={full && !selected}
            onClick={() => onChange(selected ? value.filter((id) => id !== tag.id) : full ? value : [...value, tag.id])}>
            {tag.label}
          </button>;
        })}
      </div>
    </fieldset>)}
  </fieldset>;
}
