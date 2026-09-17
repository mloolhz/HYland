import { PASSPORT_AVATAR_OPTIONS } from "@/components/landing/passport-avatars";
import { ISLAND_BTI_RESULT_CODES, ISLAND_BTI_RESULTS } from "@/data/island-bti/results";
import type { ProfileCharacter } from "@/types/profile-character";
import type { IslandBtiResultCode } from "@/types/island-bti";

export const DEFAULT_PROFILE_CHARACTERS: ProfileCharacter[] = PASSPORT_AVATAR_OPTIONS.map(
  (option) => ({
    id: `default-${option.id}`,
    name: option.label,
    category: "default" as const,
    defaultAvatarId: option.id,
    description: "기본 프로필 캐릭터",
  }),
);

export const ISLAND_BTI_PROFILE_CHARACTERS: ProfileCharacter[] = ISLAND_BTI_RESULT_CODES.map(
  (code) => {
    const result = ISLAND_BTI_RESULTS[code];
    return {
      id: `island-bti-${code.toLowerCase()}`,
      name: result.name,
      category: "islandBti" as const,
      islandBtiCode: code,
      themeColor: result.themeColor,
      description: `${code} 유형 전용 캐릭터`,
    };
  },
);

export const ALL_PROFILE_CHARACTERS: ProfileCharacter[] = [
  ...DEFAULT_PROFILE_CHARACTERS,
  ...ISLAND_BTI_PROFILE_CHARACTERS,
];

export const DEFAULT_PROFILE_CHARACTER_ID = DEFAULT_PROFILE_CHARACTERS[0]?.id ?? "default-wave-boy";

export function getProfileCharacterById(id: string): ProfileCharacter | undefined {
  return ALL_PROFILE_CHARACTERS.find((character) => character.id === id);
}

export function getMyIslandBtiProfileCharacter(
  islandBtiResultCode: IslandBtiResultCode | null,
): ProfileCharacter | null {
  if (!islandBtiResultCode) return null;
  return (
    ISLAND_BTI_PROFILE_CHARACTERS.find(
      (character) => character.islandBtiCode === islandBtiResultCode,
    ) ?? null
  );
}

export function isProfileCharacterUnlocked(
  character: ProfileCharacter,
  islandBtiResultCode: IslandBtiResultCode | null,
): boolean {
  if (character.category === "default") return true;
  if (character.category === "islandBti") {
    return islandBtiResultCode !== null && character.islandBtiCode === islandBtiResultCode;
  }
  return false;
}
