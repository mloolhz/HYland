import type { CSSProperties } from "react";
import { PassportAvatarArt } from "./passport-avatars";
import { IslandBtiCharacterVisual } from "@/components/island-bti/IslandBtiCharacterVisual";
import type { IslandSpiritLevel } from "@/lib/island-spirit-growth";
import type { ProfileCharacter } from "@/types/profile-character";

type ProfileCharacterVisualProps = {
  character: ProfileCharacter;
  className?: string;
  compact?: boolean;
  spiritLevel?: IslandSpiritLevel;
};

export function ProfileCharacterVisual({
  character,
  className,
  compact = false,
  spiritLevel,
}: ProfileCharacterVisualProps) {
  if (character.category === "default" && character.defaultAvatarId) {
    return <PassportAvatarArt id={character.defaultAvatarId} className={className} />;
  }

  if (character.category === "islandBti" && character.islandBtiCode) {
    const themeStyle = {
      "--character-theme": character.themeColor ?? "var(--blue)",
    } as CSSProperties;

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
