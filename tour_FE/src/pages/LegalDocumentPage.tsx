import { Link, useParams } from "react-router-dom";
import { LegalDocumentBody } from "@/components/legal/LegalDocumentBody";
import { getLegalDocument, LEGAL_EFFECTIVE_DATE, LEGAL_SERVICE_NAME } from "@/content/legal";
import { CONTAINER } from "@/constants/layout";

export function LegalDocumentPage() {
  const { doc } = useParams<{ doc: string }>();
  const kind = doc === "privacy" ? "privacy" : "terms";
  const { title, sections } = getLegalDocument(kind);

  return (
    <main className="legal-page">
      <div className={`${CONTAINER} legal-page-inner`}>
        <nav className="legal-page-nav" aria-label="약관·정책">
          <Link to="/legal/terms" className={kind === "terms" ? "is-active" : undefined}>
            이용약관
          </Link>
          <Link to="/legal/privacy" className={kind === "privacy" ? "is-active" : undefined}>
            개인정보 처리방침
          </Link>
        </nav>
        <header className="legal-page-head">
          <h1 className="legal-page-title">{title}</h1>
          <p className="legal-page-meta">
            {LEGAL_SERVICE_NAME} · 시행 {LEGAL_EFFECTIVE_DATE}
          </p>
        </header>
        <article className="legal-doc">
          <LegalDocumentBody sections={sections} />
        </article>
      </div>
    </main>
  );
}
