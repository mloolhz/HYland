import { Link } from "react-router-dom";
import { buildCommunitySportHref } from "@/lib/community-activities";

type SportCommunityLinkProps = {
  sportName: string;
  className?: string;
};

export function SportCommunityLink({ sportName, className }: SportCommunityLinkProps) {
  return (
    <Link
      to={buildCommunitySportHref(sportName)}
      className={["sp-community-btn", className].filter(Boolean).join(" ")}
    >
      {sportName} 후기 보기
    </Link>
  );
}
