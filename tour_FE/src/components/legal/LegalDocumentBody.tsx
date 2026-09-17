import { LEGAL_DISCLAIMER, type LegalSection } from "@/content/legal";

type LegalDocumentBodyProps = {
  sections: LegalSection[];
  /** 모달 등 좁은 영역 — 상단 고지만 강조 */
  compact?: boolean;
};

export function LegalDocumentBody({ sections, compact }: LegalDocumentBodyProps) {
  return (
    <div className={`legal-body${compact ? " legal-body--compact" : ""}`}>
      <p className="legal-disclaimer">{LEGAL_DISCLAIMER}</p>
      {sections.map((section) => (
        <section key={section.title} className="legal-section">
          <h3 className="legal-section__title">{section.title}</h3>
          {section.body.map((paragraph, i) => (
            <p key={`${section.title}-${i}`} className="legal-section__p">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
