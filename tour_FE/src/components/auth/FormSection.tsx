import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  first?: boolean;
  children: ReactNode;
};

export function FormSection({ title, first, children }: FormSectionProps) {
  return (
    <section className={`auth-form-section${first ? " auth-form-section-first" : ""}`}>
      {!first && <hr className="auth-section-divider" aria-hidden="true" />}
      <h2 className="auth-section-label">{title}</h2>
      <div className="auth-section-fields">{children}</div>
    </section>
  );
}
