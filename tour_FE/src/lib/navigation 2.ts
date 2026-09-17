import type { NavigateFunction } from "react-router-dom";

export function navigateToLink(navigate: NavigateFunction, link: string) {
  const hashIndex = link.indexOf("#");
  if (hashIndex === -1) {
    navigate(link);
    return;
  }

  const pathname = link.slice(0, hashIndex) || "/";
  const hash = link.slice(hashIndex);
  navigate({ pathname, hash });
}
