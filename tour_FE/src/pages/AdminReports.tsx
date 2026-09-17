/**
 * 신고 관리 (ADMIN)
 *
 * 글·댓글 신고를 한 화면에 모아 본다. 권한 확인은 서버가 하므로
 * (ADMIN 아니면 403) 화면은 그 응답을 그대로 안내한다.
 *
 * 신고당한 글이 지워지면 신고도 함께 사라진다 — 목록에서 "삭제된 글"을
 * 보게 되는 경우는 다른 관리자가 방금 지웠을 때뿐이다.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "@/api/auth";
import {
  fetchReports,
  updateReport,
  type Report,
  type ReportStatus,
} from "@/api/reports";
import { CONTAINER } from "@/constants/layout";

const TABS = [
  { key: "PENDING", label: "접수" },
  { key: "RESOLVED", label: "조치함" },
  { key: "DISMISSED", label: "문제 없음" },
  { key: "ALL", label: "전체" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "접수",
  RESOLVED: "조치함",
  DISMISSED: "문제 없음",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function ReportCard({
  item,
  onHandle,
  busy,
}: {
  item: Report;
  onHandle: (id: string, status: ReportStatus, note?: string) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  const pending = item.status === "PENDING";
  const isPost = item.target === "POST";

  return (
    <li className="adm-card adm-card--report">
      <div className="adm-card-body">
        <div className="adm-card-head">
          <span className={`adm-status adm-status--${item.status.toLowerCase()}`}>
            {STATUS_LABEL[item.status]}
          </span>
          <span className="rpa-kind">{isPost ? "게시글" : "댓글"}</span>
          <span className="rpa-reason">{item.reasonLabel}</span>
          <span className="rpa-when">{formatDate(item.createdAt)}</span>
        </div>

        {/* 신고당한 내용 */}
        {item.content ? (
          <div className="rpa-quote">
            {item.content.title && <b className="rpa-quote__title">{item.content.title}</b>}
            <p className="rpa-quote__body">{item.content.body}</p>
            <div className="rpa-quote__meta">
              <span>
                작성자 <b>{item.content.author.nickname}</b>
              </span>
              {item.content.island && <span>📍 {item.content.island}</span>}
              <span>{formatDate(item.content.createdAt)}</span>
              <Link className="rpa-quote__link" to={`/community/${item.content.postId}`}>
                글로 이동 →
              </Link>
            </div>
          </div>
        ) : (
          <p className="rpa-quote rpa-quote--gone">이미 삭제된 내용입니다.</p>
        )}

        <div className="rpa-meta">
          <span>
            신고자 <b>{item.reporter.nickname}</b>
          </span>
          {item.detail && <span className="rpa-detail">“{item.detail}”</span>}
        </div>

        {!pending && (
          <p className="rpa-handled">
            {item.handler?.nickname ?? "관리자"} · {item.handledAt ? formatDate(item.handledAt) : ""}
            {item.handleNote ? ` · ${item.handleNote}` : ""}
          </p>
        )}

        <div className="rpa-actions">
          {pending ? (
            <>
              <input
                className="rpa-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                placeholder="처리 메모 (선택)"
              />
              <button
                type="button"
                className="rpa-btn rpa-btn--resolve"
                disabled={busy}
                onClick={() => onHandle(item.id, "RESOLVED", note)}
              >
                조치함
              </button>
              <button
                type="button"
                className="rpa-btn"
                disabled={busy}
                onClick={() => onHandle(item.id, "DISMISSED", note)}
              >
                문제 없음
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rpa-btn"
              disabled={busy}
              onClick={() => onHandle(item.id, "PENDING")}
            >
              다시 접수로
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function AdminReports() {
  const [tab, setTab] = useState<TabKey>("PENDING");
  const [items, setItems] = useState<Report[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ReportStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReports(tab);
      setItems(data.reports);
      setCounts(data.counts);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "신고를 볼 권한이 없어요. 관리자 계정으로 로그인해주세요."
          : "신고 목록을 불러오지 못했어요.",
      );
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const handle = async (id: string, status: ReportStatus, note?: string) => {
    setBusy(true);
    setToast("");
    try {
      await updateReport(id, status, note);
      setToast(status === "PENDING" ? "다시 접수로 돌렸어요." : "처리했어요.");
      await load();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : "처리에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="adm-page">
      <div className={CONTAINER}>
        <header className="adm-head">
          <h1 className="adm-title">신고 관리</h1>
          <p className="adm-sub">
            커뮤니티 글과 댓글 신고를 확인하고 처리합니다. 신고당한 글을 삭제하면 그 신고도 목록에서
            사라집니다.
          </p>
        </header>

        <div className="adm-tabs" role="tablist">
          {TABS.map((t) => {
            const n = t.key === "ALL" ? undefined : counts[t.key as ReportStatus];
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={tab === t.key ? "on" : ""}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {n ? ` ${n}` : ""}
              </button>
            );
          })}
        </div>

        {toast && (
          <p className="adm-toast" role="status">
            {toast}
          </p>
        )}

        {loading && <p className="adm-state">불러오는 중…</p>}
        {error && <p className="adm-state adm-state--error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="adm-state">해당하는 신고가 없어요.</p>
        )}

        {items.length > 0 && (
          <ul className="adm-list">
            {items.map((item) => (
              <ReportCard key={item.id} item={item} onHandle={handle} busy={busy} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
