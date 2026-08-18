import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBtiPreferences, type BtiIslandPreference } from "@/api/bti-preferences";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { useIslandBti } from "@/context/ProfileCharacterContext";

/** 입력창 아래 버튼 하나로 노출되는 섬BTI별 인기 섬 · 미검사자 유도 */
export function IslandBtiPreferenceCard() {
  const navigate = useNavigate();
  const { hasResult, islandBtiResultCode } = useIslandBti();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topIslands, setTopIslands] = useState<BtiIslandPreference[] | null>(null);

  const handleClick = useCallback(() => {
    if (!hasResult || !islandBtiResultCode) {
      navigate("/island-bti/test");
      return;
    }

    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    if (topIslands === null) {
      setLoading(true);
      void getBtiPreferences(islandBtiResultCode).then((entries) => {
        setTopIslands(entries[0]?.topIslands ?? []);
        setLoading(false);
      });
    }
  }, [expanded, hasResult, islandBtiResultCode, navigate, topIslands]);

  const resultData = islandBtiResultCode ? getIslandBtiResult(islandBtiResultCode) : null;
  const buttonLabel =
    hasResult && islandBtiResultCode
      ? `${resultData ? resultData.name : islandBtiResultCode} 유형이 선호하는 섬 ${expanded ? "숨기기" : "보기"}`
      : "섬BTI 검사하고 인기 섬 확인하기";

  return (
    <div className="ai-bti-pref">
      <button
        type="button"
        className="ai-bti-pref-btn"
        onClick={handleClick}
        aria-expanded={hasResult ? expanded : undefined}
      >
        <span className="ai-bti-pref-btn__label">{buttonLabel}</span>
        <span className="ai-bti-pref-btn__arrow" aria-hidden="true">
          ▼
        </span>
      </button>

      {expanded && (
        <div className="ai-bti-pref-panel">
          {loading ? (
            <span className="ai-bti-pref-panel__loading">불러오는 중…</span>
          ) : topIslands && topIslands.length > 0 ? (
            <ul className="ai-bti-pref-panel__list">
              {topIslands.map((item, index) => (
                <li key={item.islandName} className="ai-bti-pref-panel__item">
                  <span className="ai-bti-pref-panel__rank">{index + 1}</span>
                  {item.islandName}
                </li>
              ))}
            </ul>
          ) : (
            <span className="ai-bti-pref-panel__empty">
              아직 같은 유형의 추천 데이터가 부족해요.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
