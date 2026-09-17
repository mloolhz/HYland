type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaDemo?: string;
};

export function EmptyState({ title, description, ctaLabel, onCta, ctaDemo }: EmptyStateProps) {
  return (
    <div className="cm-empty">
      <div className="cm-empty-illus cm-empty-illus-bg" aria-hidden="true">
        <svg viewBox="0 0 120 80" fill="none">
          <path
            d="M10 60 Q30 40 50 55 T90 50 L110 60 L110 75 L10 75 Z"
            fill="currentColor"
            opacity="0.08"
          />
        </svg>
      </div>
      <p className="cm-empty-title">{title}</p>
      {description && <p className="cm-empty-desc">{description}</p>}
      {ctaLabel && (
        <button
          type="button"
          className="cm-empty-cta"
          onClick={onCta}
          {...(ctaDemo ? { "data-demo": ctaDemo } : {})}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
