import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { useOverallRank } from "@/hooks/useLeaderboard";

/**
 * 마이페이지 리더보드 요약
 *
 * 주간/월간 XP 는 없앴다 — DB 에 기간별 점수가 없어 만들어 낸 값이었다.
 * 지금은 전체 순위 API 가 주는 "획득 배지 수" 하나만 보여준다.
 */
export function MyPageLeaderboard() {
  const { mine, ranking, loading } = useOverallRank();

  return (
    <section className="mp-section mp-rank-card" aria-label="리더보드">
      <div className="mp-rank-head">
        <div className="mp-rank-head-top">
          <p className="mp-section-label">리더보드</p>
          <a href="/leaderboard" className="mp-section-link">
            전체 리더보드 보기 →
          </a>
        </div>
        <div className="mp-rank-value-row">
          <h2 className="mp-rank-value">
            전체{" "}
            {mine ? (
              <>
                <strong className="mp-rank-value-num">
                  <CountUpNumber value={mine.rank} delay={120} suffix="위" />
                </strong>
                <span className="mp-rank-points">
                  <CountUpNumber value={mine.badgeCount} delay={220} suffix=" 배지" />
                </span>
              </>
            ) : (
              <strong className="mp-rank-value-num">{loading ? "…" : "순위 없음"}</strong>
            )}
          </h2>
        </div>
      </div>

      <div className="mp-rank-periods">
        <div className="mp-rank-pill is-active">
          <span className="mp-rank-pill-label">획득 배지</span>
          <b className="mp-rank-pill-rank">{mine?.badgeCount ?? 0}개</b>
        </div>
        <div className="mp-rank-pill">
          <span className="mp-rank-pill-label">방문 섬</span>
          <b className="mp-rank-pill-rank">{mine?.visitedCount ?? 0}곳</b>
        </div>
        <div className="mp-rank-pill">
          <span className="mp-rank-pill-label">참여 탐험가</span>
          <b className="mp-rank-pill-rank">{ranking.length}명</b>
        </div>
      </div>
    </section>
  );
}
