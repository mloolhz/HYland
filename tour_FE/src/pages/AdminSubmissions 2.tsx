import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveSubmission,
  fetchPendingSubmissions,
  rejectSubmission,
  type Submission,
} from "@/api/submissions";
import { ApiError } from "@/api/auth";
import { CONTAINER } from "@/constants/layout";

const TABS = [
  { key: "PENDING", label: "검수 대기" },
  { key: "APPROVED", label: "승인됨" },
  { key: "REJECTED", label: "반려됨" },
  { key: "ALL", label: "전체" },
] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function SubmissionCard({
  item,
  onApprove,
  onReject,
  busy,
}: {
  item: Submission;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const pending = item.status === "PENDING";

  return (
    <li className="adm-card">
      <div className="adm-card-photos">
        {item.post.images.length > 0 ? (
          item.post.images.map((src) => (
            <img key={src} src={src} alt={`${item.post.title} 인증샷`} loading="lazy" />
          ))
        ) : (
          <div className="adm-card-nophoto">사진 없음</div>
        )}
      </div>

      <div className="adm-card-body">
        <div className="adm-card-head">
          <span className={`adm-status adm-status--${item.status.toLowerCase()}`}>
            {item.status === "PENDING" ? "대기" : item.status === "APPROVED" ? "승인" : "반려"}
          </span>
          <span className="adm-card-quest">
            {item.quest.icon} {item.quest.title}
          </span>
          <span className="adm-card-reward">🎖️ {item.quest.reward}</span>
        </div>

        <Link className="adm-card-title" to={`/community/${item.post.id}`}>
          {item.post.title}
        </Link>
        <p className="adm-card-meta">
          {item.user.nickname} · {item.post.island} · {item.post.activity} ·{" "}
          {formatDate(item.createdAt)}
        </p>
        <p className="adm-card-content">{item.post.content}</p>

        {item.reviewNote && <p className="adm-card-note">반려 사유: {item.reviewNote}</p>}

        {pending && (
          <div className="adm-card-actions">
            {!rejecting ? (
              <>
                <button
                  type="button"
                  className="adm-btn adm-btn--approve"
                  disabled={busy}
                  onClick={() => onApprove(item.id)}
                >
                  승인
                </button>
                <button
                  type="button"
                  className="adm-btn"
                  disabled={busy}
                  onClick={() => setRejecting(true)}
                >
                  반려
                </button>
              </>
            ) : (
              <div className="adm-reject">
                <input
                  type="text"
                  className="adm-reject-input"
                  placeholder="반려 사유 (선택)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button
                  type="button"
                  className="adm-btn adm-btn--reject"
                  disabled={busy}
                  onClick={() => onReject(item.id, reason)}
                >
                  반려 확정
                </button>
                <button type="button" className="adm-btn" onClick={() => setRejecting(false)}>
                  취소
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * 미션 인증 검수 (관리자 전용)
 *
 * 유저가 올린 인증샷을 보고 승인/반려한다. 승인하면 서버가 미션 진행도를 올리고,
 * 목표를 채우면 배지를 지급한다. 권한 확인은 서버가 하므로(ADMIN 아니면 403),
 * 화면에서는 그 응답을 그대로 보여준다.
 */
export function AdminSubmissions() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchPendingSubmissions(status));
    } catch (err) {
      console.error("[admin] 검수 목록 조회 실패:", err);
      setError(
        err instanceof ApiError && err.status === 403
          ? "검수 권한이 없는 계정이에요."
          : "목록을 불러오지 못했어요.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const handleApprove = async (id: string) => {
    setBusy(true);
    try {
      const r = await approveSubmission(id);
      setToast(
        r.badgeGranted
          ? `승인 완료 — ${r.current}/${r.target}, 🎖️ ${r.badgeGranted} 지급!`
          : `승인 완료 — ${r.current}/${r.target}`,
      );
      await load(tab);
    } catch (err) {
      console.error("[admin] 승인 실패:", err);
      setToast(err instanceof ApiError ? err.message : "승인에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setBusy(true);
    try {
      await rejectSubmission(id, reason);
      setToast("반려했어요.");
      await load(tab);
    } catch (err) {
      console.error("[admin] 반려 실패:", err);
      setToast(err instanceof ApiError ? err.message : "반려에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="adm-page">
      <div className={CONTAINER}>
        <header className="adm-head">
          <h1 className="adm-title">미션 인증 검수</h1>
          <p className="adm-sub">
            유저가 올린 인증샷을 확인하고 승인하면 미션 진행도가 오르고, 목표를 채우면 배지가
            지급됩니다.
          </p>
        </header>

        <div className="adm-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? "on" : ""}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {toast && (
          <p className="adm-toast" role="status">
            {toast}
          </p>
        )}

        {loading && <p className="adm-state">불러오는 중…</p>}
        {error && <p className="adm-state adm-state--error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="adm-state">해당하는 인증이 없어요.</p>
        )}

        {items.length > 0 && (
          <ul className="adm-list">
            {items.map((item) => (
              <SubmissionCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                busy={busy}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
