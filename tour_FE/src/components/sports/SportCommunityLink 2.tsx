import { Link, useNavigate } from "react-router-dom";
import { buildCommunityActivityLink } from "@/lib/community-activities";
import {
  fadeOutRouteRoot,
  prefersReducedMotion,
  ROUTE_FADE_MS,
  type CommunityEnterFadeState,
} from "@/lib/route-fade";

type SportCommunityLinkProps = {
  sportName: string;
  className?: string;
};

export function SportCommunityLink({ sportName, className = "sp-community-btn" }: SportCommunityLinkProps) {
  const navigate = useNavigate();
  const to = buildCommunityActivityLink(sportName);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (prefersReducedMotion()) {
      navigate(to);
      return;
    }

    fadeOutRouteRoot();
    window.setTimeout(() => {
      navigate(to, { state: { communityEnterFade: true } satisfies CommunityEnterFadeState });
    }, ROUTE_FADE_MS);
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      커뮤니티에서 {sportName} 후기 보기
    </Link>
  );
}
