/**
 * 신고 사유 입력 모달 — 글과 댓글이 같이 쓴다.
 *
 * 사유를 고르지 않고는 보낼 수 없게 한다. "신고" 한 번에 바로 접수되면
 * 오조작이 그대로 신고가 되고, 관리자는 왜 신고됐는지 알 수 없다.
 */
import { useState } from "react";
import { createReport, REPORT_REASONS, type ReportTarget } from "@/api/reports";
import { ApiError } from "@/api/auth";

type ReportDialogProps = {
  target: ReportTarget;
  targetId: string;
  /** 무엇을 신고하는지 한 줄로 — 잘못 누른 사람이 알아채도록 */
  summary?: string;
  onClose: () => void;
  onDone?: () => void;
};

export function ReportDialog({ target, targetId, summary, onClose, onDone }: ReportDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const label = target === "POST" ? "글" : "댓글";

  const handleSubmit = async () => {
    if (!reason || sending) return;
    setSending(true);
    setError("");
    try {
      await createReport({ target, targetId, reason, detail: detail.trim() || undefined });
      window.alert("신고가 접수됐어요. 관리자가 확인할게요.");
      onDone?.();
      onClose();
    } catch (err) {
      // 중복 신고(409)·삭제된 글(404) 등은 서버 문구를 그대로 보여준다
      setError(err instanceof ApiError ? err.message : "신고를 보내지 못했어요.");
      setSending(false);
    }
  };

  return (
    <div className="rp-backdrop" onClick={onClose} role="presentation">
      <div
        className="rp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${label} 신고`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rp-dialog__head">
          <h2>{label} 신고</h2>
          <button type="button" className="rp-dialog__close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {summary && <p className="rp-dialog__summary">“{summary}”</p>}

        <fieldset className="rp-reasons">
          <legend className="rp-reasons__legend">신고 사유를 선택해주세요</legend>
          {REPORT_REASONS.map((r) => (
            <label key={r.code} className={`rp-reason${reason === r.code ? " is-on" : ""}`}>
              <input
                type="radio"
                name="report-reason"
                value={r.code}
                checked={reason === r.code}
                onChange={() => setReason(r.code)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="rp-detail">
          <span>자세한 내용 (선택)</span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value.slice(0, 500))}
            placeholder="어떤 점이 문제인지 적어주시면 확인에 도움이 돼요."
            rows={3}
          />
          <span className="rp-detail__count">{detail.length}/500</span>
        </label>

        {error && (
          <p className="rp-dialog__error" role="alert">
            {error}
          </p>
        )}

        <div className="rp-dialog__actions">
          <button type="button" className="rp-btn" onClick={onClose} disabled={sending}>
            취소
          </button>
          <button
            type="button"
            className="rp-btn rp-btn--danger"
            onClick={handleSubmit}
            disabled={!reason || sending}
          >
            {sending ? "보내는 중…" : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
