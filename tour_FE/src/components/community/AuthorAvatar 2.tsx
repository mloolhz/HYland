import type { Author } from "@/types/community";

function ProfilePlaceholderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type AuthorAvatarProps = {
  author: Pick<Author, "nickname" | "avatarUrl">;
  className?: string;
};

export function AuthorAvatar({ author, className }: AuthorAvatarProps) {
  const classes = ["cm-author-avatar", className].filter(Boolean).join(" ");

  if (author.avatarUrl) {
    return (
      <span className={classes}>
        <img src={author.avatarUrl} alt="" className="cm-author-avatar-img" />
      </span>
    );
  }

  return (
    <span className={classes} aria-hidden="true">
      <ProfilePlaceholderIcon />
    </span>
  );
}
