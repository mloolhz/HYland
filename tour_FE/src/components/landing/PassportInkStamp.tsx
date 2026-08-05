import type { StampLayout, StampTheme } from "@/lib/passport/stamp-themes";
import type { StampVariant } from "./PassportInkStampArt";
import { PassportInkStampArt } from "./PassportInkStampArt";

export type PassportInkStampProps = {
  place: string;
  activity: string;
  variant: StampVariant;
  theme: StampTheme;
  layout: StampLayout;
  acquired: boolean;
  doing?: boolean;
  hidden?: boolean;
  date?: string;
  stampId: number | string;
};

export function PassportInkStamp({
  place,
  activity,
  variant,
  theme,
  layout,
  acquired,
  doing = false,
  hidden = false,
  date,
  stampId,
}: PassportInkStampProps) {
  const stateClass = hidden ? "hidden" : acquired ? "earned" : doing ? "doing" : "locked";

  return (
    <div className={`passport-ink-stamp-wrap passport-ink-stamp-wrap--${stateClass}`} role="listitem">
      <div
        className={`passport-ink-stamp passport-ink-stamp--${stateClass}`}
        style={{
          ["--stamp-rotate" as string]: `${layout.rotate}deg`,
          ["--stamp-scale" as string]: String(layout.scale),
          ["--stamp-x" as string]: `${layout.offsetX}px`,
          ["--stamp-y" as string]: `${layout.offsetY}px`,
        }}
      >
        <PassportInkStampArt
          stampId={stampId}
          place={place}
          activity={activity}
          variant={variant}
          shape={layout.shape}
          ink={theme.ink}
          acquired={acquired}
          doing={doing}
          hidden={hidden}
        />
      </div>

      {!hidden && acquired && date ? (
        <p className="passport-ink-stamp__date">{date}</p>
      ) : !hidden && doing ? (
        <p className="passport-ink-stamp__date passport-ink-stamp__date--doing">진행 중</p>
      ) : !hidden ? (
        <p className="passport-ink-stamp__date passport-ink-stamp__date--locked">미획득</p>
      ) : null}
    </div>
  );
}
