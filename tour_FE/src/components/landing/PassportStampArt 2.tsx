import type { PassportBadge } from "./passport-book-data";
import { getBadgeInkColor } from "./passport-book-data";
import { PassportInkStampArt, type StampVariant } from "./PassportInkStampArt";
import { getStampTheme, getStampLayout } from "@/lib/passport/stamp-themes";

export type { StampVariant };

function getStampVariant(island: string): StampVariant {
  switch (island) {
    case "백령도":
      return "baengnyeong-cliff";
    case "자월도":
      return "jawol-mountain";
    case "덕적도":
      return "deokjeok-camp";
    case "영종도":
      return "yeongjong-cycle";
    case "무의도":
      return "mui-kayak";
    case "섬BTI":
      return "island-bti";
    default:
      return "generic";
  }
}

type PassportStampArtProps = {
  badge: PassportBadge;
  acquired: boolean;
};

/** @deprecated badge model — use PassportInkStamp */
export function PassportStampArt({ badge, acquired }: PassportStampArtProps) {
  const variant = getStampVariant(badge.island);
  const theme = getStampTheme(variant);
  const ink = acquired ? getBadgeInkColor(badge) : theme.ink;

  const layout = getStampLayout(badge.id);

  return (
    <PassportInkStampArt
      stampId={badge.id}
      place={badge.island}
      activity={badge.activity}
      variant={variant}
      shape={layout.shape}
      ink={ink}
      acquired={acquired}
    />
  );
}
