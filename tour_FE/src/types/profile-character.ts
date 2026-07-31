import type { IslandBtiResultCode } from "@/types/island-bti";
import type { PassportAvatarId } from "@/components/landing/passport-avatars";

export type ProfileCharacterCategory = "default" | "islandBti" | "reward";

export interface ProfileCharacter {
  id: string;
  name: string;
  category: ProfileCharacterCategory;
  imageSrc?: string;
  islandBtiCode?: IslandBtiResultCode;
  themeColor?: string;
  description?: string;
  /** category가 default일 때 기존 SVG 아바타 id */
  defaultAvatarId?: PassportAvatarId;
}
