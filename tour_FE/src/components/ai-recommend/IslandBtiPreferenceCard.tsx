import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { getIslandBtiRecommendedDisplay } from "@/lib/island-bti-recommended-display";
import { useIslandBti } from "@/context/ProfileCharacterContext";

/** 입력창 아래 — 섬BTI 결과 3섬 요약 + AI 추천에서 코스 받기 */
export function IslandBtiPreferenceCard() {
  const navigate = useNavigate();
  const { hasResult, islandBtiResultCode } = useIslandBti();
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(() => {
    if (!hasResult || !islandBtiResultCode) {
      navigate("/island-bti/test");
      return;
    }
    setExpanded((open) => !open);
  }, [hasResult, islandBtiResultCode, navigate]);

  const resultData = islandBtiResultCode ? getIslandBtiResult(islandBtiResultCode) : null;
  const topIslands = islandBtiResultCode ? getIslandBtiRecommendedDisplay(islandBtiResultCode) : [];

  const buttonLabel =
    hasResult && islandBtiResultCode
      ? `${resultData ? resultData.name : islandBtiResultCode} 유형 추천 섬 ${expanded ? "숨기기" : "보기"}`
      : "섬BTI 검사하고 추천 섬 코스 받기";

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

      {expanded && topIslands.length > 0 && (
        <div className="ai-bti-pref-panel">
          <ul className="ai-bti-pref-panel__list">
            {topIslands.map((item, index) => (
              <li key={item.islandName} className="ai-bti-pref-panel__item">
                <span className="ai-bti-pref-panel__rank">{index + 1}</span>
                {item.islandName}
              </li>
            ))}
          </ul>
          <p className="ai-bti-pref-panel__hint">
            위 섬은 결과 화면과 같아요.{" "}
            <Link to="/ai-recommend">AI 추천</Link>에서 「추천 섬 코스 받기」로 일정·시설까지 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
