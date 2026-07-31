import type { CSSProperties } from "react";
import { PassportAvatarArt } from "./passport-avatars";
import type { ProfileCharacter } from "@/types/profile-character";

type ProfileCharacterVisualProps = {
  character: ProfileCharacter;
  className?: string;
  compact?: boolean;
};

function IslandBtiCharacterSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="28" r="14" fill="currentColor" opacity="0.22" />
      <path
        d="M22 62C24 48 30 42 40 42C50 42 56 48 58 62H22Z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M18 34C22 22 30 18 40 18C50 18 58 22 62 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function ProfileCharacterVisual({
  character,
  className,
  compact = false,
}: ProfileCharacterVisualProps) {
  if (character.category === "default" && character.defaultAvatarId) {
    return <PassportAvatarArt id={character.defaultAvatarId} className={className} />;
  }

  if (character.category === "islandBti") {
    const themeStyle = {
      "--character-theme": character.themeColor ?? "var(--blue)",
    } as CSSProperties;

    return (
      <div
        className={["profile-character-visual", "profile-character-visual--island-bti", className]
          .filter(Boolean)
          .join(" ")}
        style={themeStyle}
        aria-hidden={compact ? undefined : true}
      >
        <IslandBtiCharacterSilhouette className="profile-character-visual__silhouette" />
        {character.islandBtiCode ? (
          <span className="profile-character-visual__code">{character.islandBtiCode}</span>
        ) : null}
        {!compact ? (
          <span className="profile-character-visual__name">{character.name}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={["profile-character-visual", "profile-character-visual--fallback", className]
      .filter(Boolean)
      .join(" ")}
    >
      <span className="profile-character-visual__name">{character.name}</span>
    </div>
  );
}
