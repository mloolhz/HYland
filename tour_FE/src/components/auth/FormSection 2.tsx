import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  first?: boolean;
  required?: boolean;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, first, required, description, children }: FormSectionProps) {
  return (
    <section className={`auth-form-section${first ? " auth-form-section-first" : ""}`}>
      {!first && <hr className="auth-section-divider" aria-hidden="true" />}
      <h2 className="auth-section-label">
        {title}
        {required && (
          <span className="auth-section-required" aria-hidden="true">
            *
          </span>
        )}
      </h2>
      {description && <p className="auth-section-description">{description}</p>}
      <div className="auth-section-fields">{children}</div>
    </section>
  );
}
