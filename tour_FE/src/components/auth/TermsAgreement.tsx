import { useState } from "react";

type TermsAgreementProps = {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
  onChange: (next: { terms: boolean; privacy: boolean; marketing: boolean }) => void;
};

function TermsModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-head">
          <h2>{title}</h2>
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="auth-modal-body">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="auth-check-label">
      <input
        id={id}
        type="checkbox"
        className="auth-check-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="auth-check-box" aria-hidden="true">
        {checked && <i className="ti ti-check" />}
      </span>
      <span className="auth-check-text">{label}</span>
    </label>
  );
}

export function TermsAgreement({ terms, privacy, marketing, onChange }: TermsAgreementProps) {
  const [modal, setModal] = useState<string | null>(null);
  const allChecked = terms && privacy && marketing;

  const setAll = (checked: boolean) => {
    onChange({ terms: checked, privacy: checked, marketing: checked });
  };

  return (
    <div className="auth-terms">
      <AuthCheckbox
        id="terms-all"
        checked={allChecked}
        onChange={setAll}
        label="전체 동의"
      />
      <hr className="auth-terms-divider" />
      <div className="auth-terms-row">
        <AuthCheckbox
          id="terms-required"
          checked={terms}
          onChange={(checked) => onChange({ terms: checked, privacy, marketing })}
          label={
            <>
              <span className="auth-terms-tag auth-terms-required">[필수]</span> 이용약관 동의
            </>
          }
        />
        <button type="button" className="auth-terms-view" onClick={() => setModal("이용약관")}>
          보기 →
        </button>
      </div>
      <div className="auth-terms-row">
        <AuthCheckbox
          id="privacy-required"
          checked={privacy}
          onChange={(checked) => onChange({ terms, privacy: checked, marketing })}
          label={
            <>
              <span className="auth-terms-tag auth-terms-required">[필수]</span> 개인정보 처리방침 동의
            </>
          }
        />
        <button type="button" className="auth-terms-view" onClick={() => setModal("개인정보 처리방침")}>
          보기 →
        </button>
      </div>
      <AuthCheckbox
        id="marketing-optional"
        checked={marketing}
        onChange={(checked) => onChange({ terms, privacy, marketing: checked })}
        label={
          <>
            <span className="auth-terms-tag auth-terms-optional">[선택]</span> 마케팅 정보 수신 동의
          </>
        }
      />
      {modal && <TermsModal title={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function isTermsValid(terms: boolean, privacy: boolean): boolean {
  return terms && privacy;
}
