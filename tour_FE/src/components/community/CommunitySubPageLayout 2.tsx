import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { ProfileCard } from "@/components/community/ProfileCard";
import { CONTAINER } from "@/constants/layout";

type CommunitySubPageLayoutProps = {
  title: string;
  children: ReactNode;
  showProfileSidebar?: boolean;
};

export function CommunitySubPageLayout({
  title,
  children,
  showProfileSidebar = true,
}: CommunitySubPageLayoutProps) {
  return (
    <main className="cm-page">
      <CommunityHeader />

      <div className={CONTAINER}>
        <div className="cm-subpage-head">
          <Link to="/community" className="cm-subpage-back">
            ← 커뮤니티
          </Link>
          <h2 className="cm-subpage-title">{title}</h2>
        </div>

        <div className={`cm-layout${showProfileSidebar ? "" : " cm-layout--single"}`}>
          <section className="cm-feed" aria-label={title}>
            {children}
          </section>

          {showProfileSidebar && (
            <aside className="cm-sidebar">
              <div className="cm-sidebar-sticky">
                <ProfileCard />
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
