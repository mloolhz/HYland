import { useCallback, useState } from "react";

export type PassportAvatarId =
  | "wave-boy"
  | "anchor-girl"
  | "compass-bear"
  | "seagull"
  | "lighthouse"
  | "shell-cat"
  | "coral-fish"
  | "star-sailor"
  | "tide-dog"
  | "pearl-otter"
  | "reef-turtle"
  | "moon-jelly";

export type PassportAvatarOption = {
  id: PassportAvatarId;
  label: string;
};

export const PASSPORT_AVATAR_OPTIONS: PassportAvatarOption[] = [
  { id: "wave-boy", label: "파도 소년" },
  { id: "anchor-girl", label: "닻 소녀" },
  { id: "compass-bear", label: "나침반 곰" },
  { id: "seagull", label: "갈매기" },
  { id: "lighthouse", label: "등대지기" },
  { id: "shell-cat", label: "조개 고양이" },
  { id: "coral-fish", label: "산호 물고기" },
  { id: "star-sailor", label: "별 선원" },
  { id: "tide-dog", label: "조수 강아지" },
  { id: "pearl-otter", label: "진주 수달" },
  { id: "reef-turtle", label: "암초 거북" },
  { id: "moon-jelly", label: "달빛 해파리" },
];

const STORAGE_KEY = "hyland-passport-avatar";

export function getStoredPassportAvatarId(): PassportAvatarId {
  if (typeof window === "undefined") return "wave-boy";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && PASSPORT_AVATAR_OPTIONS.some((option) => option.id === stored)) {
    return stored as PassportAvatarId;
  }
  return "wave-boy";
}

export function usePassportAvatar() {
  const [avatarId, setAvatarIdState] = useState<PassportAvatarId>(getStoredPassportAvatarId);

  const setAvatarId = useCallback((id: PassportAvatarId) => {
    setAvatarIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return [avatarId, setAvatarId] as const;
}

type PassportAvatarArtProps = {
  id: PassportAvatarId;
  className?: string;
};

/** 여권 프로필용 일러스트 아바타 */
export function PassportAvatarArt({ id, className }: PassportAvatarArtProps) {
  const classes = ["passport-avatar-art", className].filter(Boolean).join(" ");

  switch (id) {
    case "wave-boy":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#E8F4FD" />
          <circle cx="40" cy="34" r="16" fill="#FFD4A8" />
          <path d="M22 62C24 48 30 42 40 42C50 42 56 48 58 62H22Z" fill="#1A5FCC" />
          <path d="M28 30C30 24 34 22 40 22C46 22 50 24 52 30" fill="#3D2314" />
          <circle cx="34" cy="34" r="2" fill="#3D2314" />
          <circle cx="46" cy="34" r="2" fill="#3D2314" />
          <path d="M36 40C38 42 42 42 44 40" stroke="#C97B5A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 28L28 24L26 34L18 32Z" fill="#4DA3FF" />
        </svg>
      );
    case "anchor-girl":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#FCEAF3" />
          <circle cx="40" cy="34" r="16" fill="#FFD4A8" />
          <path d="M22 62C24 48 30 42 40 42C50 42 56 48 58 62H22Z" fill="#DB2777" />
          <path d="M24 28C28 22 34 20 40 22C46 24 52 26 56 32L52 36C48 30 44 28 40 28C36 28 32 30 28 34L24 28Z" fill="#5C3317" />
          <circle cx="34" cy="34" r="2" fill="#3D2314" />
          <circle cx="46" cy="34" r="2" fill="#3D2314" />
          <path d="M37 40C39 42 41 42 43 40" stroke="#C97B5A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="58" cy="52" r="5" stroke="#C9A962" strokeWidth="2" />
          <path d="M58 47V57M54 57H62" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "compass-bear":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#FEF3E8" />
          <circle cx="28" cy="26" r="9" fill="#B8844A" />
          <circle cx="52" cy="26" r="9" fill="#B8844A" />
          <circle cx="40" cy="38" r="20" fill="#D4A064" />
          <circle cx="34" cy="36" r="2.5" fill="#3D2314" />
          <circle cx="46" cy="36" r="2.5" fill="#3D2314" />
          <ellipse cx="40" cy="42" rx="4" ry="3" fill="#8B5E3C" />
          <path d="M22 62C26 50 32 46 40 46C48 46 54 50 58 62H22Z" fill="#7C3AED" />
          <circle cx="40" cy="58" r="10" stroke="#C9A962" strokeWidth="1.5" />
          <path d="M40 50V58M36 54H44" stroke="#C9A962" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "seagull":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#E6F7F5" />
          <ellipse cx="40" cy="44" rx="22" ry="18" fill="#F8FAFC" />
          <circle cx="40" cy="32" r="14" fill="#F8FAFC" />
          <circle cx="36" cy="31" r="2.5" fill="#0F172A" />
          <path d="M44 33L50 31" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 40L30 36M62 40L50 36" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 58C28 52 34 50 40 50C46 50 52 52 58 58" stroke="#0D9488" strokeWidth="2" />
        </svg>
      );
    case "lighthouse":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#FFF7ED" />
          <circle cx="40" cy="34" r="15" fill="#FFD4A8" />
          <rect x="24" y="24" width="32" height="8" rx="2" fill="#EA580C" />
          <circle cx="34" cy="34" r="2" fill="#3D2314" />
          <circle cx="46" cy="34" r="2" fill="#3D2314" />
          <path d="M22 62C24 48 30 42 40 42C50 42 56 48 58 62H22Z" fill="#EA580C" />
          <rect x="34" y="48" width="12" height="16" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M34 52H46M34 56H46M34 60H46" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M40 18V24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "shell-cat":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#F1EBFD" />
          <path d="M26 28L30 38M54 28L50 38" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="40" r="18" fill="#E9D5FF" />
          <circle cx="34" cy="38" r="2.5" fill="#3D2314" />
          <circle cx="46" cy="38" r="2.5" fill="#3D2314" />
          <path d="M36 44L40 46L44 44" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 58C32 52 36 50 40 50C44 50 48 52 52 58" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 62C28 54 34 52 40 52C46 52 52 54 58 62" fill="#FBCFE8" />
        </svg>
      );
    case "coral-fish":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#FEE2E2" />
          <ellipse cx="42" cy="40" rx="20" ry="14" fill="#F97316" />
          <path d="M22 40L32 32V48L22 40Z" fill="#FB923C" />
          <circle cx="48" cy="36" r="2.5" fill="#0F172A" />
          <path d="M30 52C34 56 40 58 46 56" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          <circle cx="58" cy="28" r="4" fill="#FDA4AF" opacity="0.8" />
          <circle cx="54" cy="54" r="3" fill="#FB7185" opacity="0.7" />
        </svg>
      );
    case "star-sailor":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#EEF2FF" />
          <circle cx="40" cy="34" r="15" fill="#FFD4A8" />
          <path d="M22 28L28 24L26 32L22 28Z" fill="#1E3A8A" />
          <path d="M22 62C24 48 30 42 40 42C50 42 56 48 58 62H22Z" fill="#1E3A8A" />
          <circle cx="34" cy="34" r="2" fill="#3D2314" />
          <circle cx="46" cy="34" r="2" fill="#3D2314" />
          <path d="M52 20L54 26L60 26L55 30L57 36L52 32L47 36L49 30L44 26L50 26L52 20Z" fill="#C9A962" />
        </svg>
      );
    case "tide-dog":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#ECFEFF" />
          <ellipse cx="34" cy="30" rx="8" ry="12" fill="#B8844A" />
          <ellipse cx="50" cy="30" rx="8" ry="12" fill="#B8844A" />
          <circle cx="40" cy="40" r="17" fill="#D4A064" />
          <circle cx="35" cy="38" r="2.5" fill="#3D2314" />
          <circle cx="45" cy="38" r="2.5" fill="#3D2314" />
          <ellipse cx="40" cy="44" rx="5" ry="4" fill="#8B5E3C" />
          <path d="M22 62C26 52 32 48 40 48C48 48 54 52 58 62H22Z" fill="#0891B2" />
        </svg>
      );
    case "pearl-otter":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#F0FDFA" />
          <circle cx="40" cy="38" r="18" fill="#92400E" />
          <circle cx="34" cy="36" r="2.5" fill="#0F172A" />
          <circle cx="46" cy="36" r="2.5" fill="#0F172A" />
          <circle cx="40" cy="42" r="3" fill="#FDE68A" />
          <path d="M22 62C26 52 32 48 40 48C48 48 54 52 58 62H22Z" fill="#5EEAD4" />
          <circle cx="56" cy="50" r="6" fill="#F8FAFC" stroke="#99F6E4" strokeWidth="1.5" />
        </svg>
      );
    case "reef-turtle":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#F0FDF4" />
          <ellipse cx="40" cy="42" rx="22" ry="16" fill="#16A34A" />
          <circle cx="40" cy="42" r="10" fill="#15803D" />
          <circle cx="28" cy="30" r="5" fill="#16A34A" />
          <circle cx="52" cy="30" r="5" fill="#16A34A" />
          <circle cx="36" cy="40" r="2" fill="#052E16" />
          <path d="M18 48C22 44 26 52 30 48M62 48C58 44 54 52 50 48" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "moon-jelly":
      return (
        <svg className={classes} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#EDE9FE" />
          <path d="M20 44C24 30 34 24 40 24C46 24 56 30 60 44" fill="#C4B5FD" opacity="0.85" />
          <path d="M24 44V56M32 44V58M40 44V56M48 44V58M56 44V56" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="52" cy="26" r="5" fill="#FDE68A" opacity="0.9" />
          <circle cx="48" cy="24" r="4" fill="#FEF3C7" />
        </svg>
      );
    default:
      return null;
  }
}
