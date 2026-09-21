import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLeaderboard, type LeaderboardRow } from "@/api/me";
import { avaColor } from "@/lib/landing-data";

const PODIUM_ORDER = [2, 1, 3] as const;
/** 등수별 메달 — 가운데 1등이 트로피 (예전엔 자리 순서로 넣어 2등이 트로피를 받았다) */
const MEDALS: Record<1 | 2 | 3, string> = { 1: "🏆", 2: "🥈", 3: "🥉" };
const PREVIEW_SIZE = 5;

/**
 * 랜딩 미션 섹션 우측 — 리더보드 미리보기.
 *
 * 예전에는 lib/landing-data 의 고정 순위표("섬마스터 2,310P" 등)를 그렸는데,
 * "더보기"로 들어간 실제 리더보드와 이름·점수가 달라 가짜 데이터로 보였다.
 * 리더보드 화면과 같은 API(배지 수 기준)를 쓴다.
 */
export function MissionLeaderboardPreview() {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLeaderboard(PREVIEW_SIZE)
      .then((res) => {
        if (alive) setRows(res.ranking.filter((r) => r.badgeCount > 0).slice(0, PREVIEW_SIZE));
      })
      .catch((err: unknown) => {
        console.error("[landing] 리더보드 미리보기 조회 실패:", err);
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const topThree = rows?.slice(0, 3) ?? [];
  const restRanks = rows?.slice(3) ?? [];

  return (
    <section className="mis-lb-preview" aria-label="리더보드 미리보기">
      <div className="mis-lb-preview__head">
        <div>
          <span className="mis-lb-preview__eyebrow">LEADERBOARD</span>
          <h3 className="mis-lb-preview__title">탐험가 순위</h3>
        </div>
        <Link className="mis-lb-preview__more" to="/leaderboard">
          더보기 →
        </Link>
      </div>

      {rows !== null && rows.length === 0 ? (
        <p className="mis-lb-preview__empty">
          아직 배지를 받은 탐험가가 없어요.
          <br />
          미션을 완료하고 첫 번째 탐험가가 되어 보세요!
        </p>
      ) : (
        <>
          <div className="mis-lb-preview__podium" aria-busy={rows === null}>
            {PODIUM_ORDER.map((rank) => {
              const row = topThree[rank - 1];
              const name = row?.nickname ?? "";
              return (
                <div
                  className={`mis-lb-preview__pd mis-lb-preview__pd--${rank}${row ? "" : " is-empty"}`}
                  key={rank}
                >
                  <span className="mis-lb-preview__rank">#{rank}</span>
                  <div
                    className="mis-lb-preview__ava"
                    style={
                      row
                        ? { background: `linear-gradient(150deg, ${avaColor(name)}, #2D2E6B)` }
                        : undefined
                    }
                  >
                    {name[0] ?? ""}
                  </div>
                  <span className="mis-lb-preview__medal" aria-hidden="true">
                    {MEDALS[rank]}
                  </span>
                  <span className="mis-lb-preview__name">{row ? name : "—"}</span>
                  <span className="mis-lb-preview__pts">
                    {row ? `배지 ${row.badgeCount}개` : " "}
                  </span>
                </div>
              );
            })}
          </div>

          {restRanks.length > 0 && (
            <ul className="mis-lb-preview__list">
              {restRanks.map((row) => (
                <li key={row.userId}>
                  <span className="mis-lb-preview__rk">#{row.rank}</span>
                  <span
                    className="mis-lb-preview__list-ava"
                    style={{ background: avaColor(row.nickname) }}
                  >
                    {row.nickname[0]}
                  </span>
                  <span className="mis-lb-preview__list-name">{row.nickname}</span>
                  <span className="mis-lb-preview__list-pts">배지 {row.badgeCount}개</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
