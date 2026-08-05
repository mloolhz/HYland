import { Link } from "react-router-dom";
import { buildCommunityActivityLink } from "@/lib/community-activities";

type SportCommunityLinkProps = {
  sportName: string;
  className?: string;
};

export function SportCommunityLink({ sportName, className = "sp-community-btn" }: SportCommunityLinkProps) {
  const to = buildCommunityActivityLink(sportName);

  return (
    <Link to={to} className={className}>
      커뮤니티에서 {sportName} 후기 보기
    </Link>
  );
}
