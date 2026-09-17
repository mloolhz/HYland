import type { CSSProperties } from "react";
import { IslandBtiCharacterArt } from "@/components/island-bti/IslandBtiCharacterArt";
import { IslandBtiCharacterVisual } from "@/components/island-bti/IslandBtiCharacterVisual";
import { PassportAvatarArt } from "./passport-avatars";
import type { IslandSpiritLevel } from "@/lib/island-spirit-growth";
import type { ProfileCharacter } from "@/types/profile-character";

type ProfileCharacterVisualProps = {
  character: ProfileCharacter;
  className?: string;
  compact?: boolean;
  /** 여권 원형 프로필 등 — 정령 SVG만 표시 */
  avatarOnly?: boolean;
  spiritLevel?: IslandSpiritLevel;
};

function getIslandBtiThemeStyle(themeColor?: string): CSSProperties {
  const color = themeColor ?? "var(--blue)";
  return {
    "--character-theme": color,
    "--ibti-character-accent": color,
    "--ibti-character-body": color,
    "--ibti-character-belly": "color-mix(in srgb, #fff 88%, var(--ibti-character-accent))",
    "--ibti-character-blush": "color-mix(in srgb, #FCA5A5 70%, var(--ibti-character-accent))",
    "--ibti-character-dark": "color-mix(in srgb, #1F2937 75%, var(--ibti-character-accent))",
  } as CSSProperties;
}

export function ProfileCharacterVisual({
  character,
  className,
  compact = false,
  avatarOnly = false,
  spiritLevel,
}: ProfileCharacterVisualProps) {
  if (character.category === "default" && character.defaultAvatarId) {
    return <PassportAvatarArt id={character.defaultAvatarId} className={className} />;
  }

  if (character.category === "islandBti" && character.islandBtiCode) {
    const themeStyle = getIslandBtiThemeStyle(character.themeColor);

    if (avatarOnly) {
      return (
        <div
          className={[
            "profile-character-visual",
            "profile-character-visual--island-bti",
            "profile-character-visual--avatar-only",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={themeStyle}
        >
          <IslandBtiCharacterArt
            code={character.islandBtiCode}
            className="profile-character-visual__art"
          />
        </div>
      );
    }

    return (
      <div
        className={["profile-character-visual", "profile-character-visual--island-bti", className]
          .filter(Boolean)
          .join(" ")}
        style={themeStyle}
      >
        <IslandBtiCharacterVisual
          code={character.islandBtiCode}
          themeColor={character.themeColor}
          variant={compact ? "compact" : "default"}
          spiritLevel={spiritLevel}
          showCode={!compact}
          showName={!compact}
          className="profile-character-visual__island-bti"
        />
      </div>
    );
  }

  return (
    <div
      className={["profile-character-visual", "profile-character-visual--fallback", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="profile-character-visual__name">{character.name}</span>
    </div>
  );
}
