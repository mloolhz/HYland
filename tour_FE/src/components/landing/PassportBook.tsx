import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { UserProfile } from "@/lib/user-profile";
import { useOptionalProfileCharacter } from "@/context/ProfileCharacterContext";
import { PassportBadgeSpreadPage } from "./PassportBadgeSpreadPage";
import { PassportProfilePage } from "./PassportProfilePage";
import type { BookNavState, PassportBookSpread } from "./passport-book-spreads";

const FLIP_MS = 400;

export type PassportBookHandle = {
  goPrev: () => void;
  goNext: () => void;
};

type PassportBookProps = {
  spreads: PassportBookSpread[];
  profile: UserProfile;
  titleId?: string;
  onNavStateChange?: (state: BookNavState) => void;
};

function LeftPage({
  spread,
  profile,
  titleId,
  totalSpreads,
}: {
  spread: PassportBookSpread;
  profile: UserProfile;
  titleId?: string;
  totalSpreads: number;
}) {
  return (
    <div className="passport-book__page passport-book__page--left">
      {spread.left.type === "profile" ? (
        <PassportProfilePage profile={profile} titleId={titleId} />
      ) : (
        <PassportBadgeSpreadPage
          badges={spread.left.badges}
          spreadIndex={spread.index}
          totalSpreads={totalSpreads}
          side="left"
        />
      )}
    </div>
  );
}

function RightPage({
  spread,
  totalSpreads,
}: {
  spread: PassportBookSpread;
  totalSpreads: number;
}) {
  return (
    <div className="passport-book__page passport-book__page--right">
      <PassportBadgeSpreadPage
        badges={spread.right.badges}
        spreadIndex={spread.index}
        totalSpreads={totalSpreads}
        side="right"
      />
    </div>
  );
}

export const PassportBook = forwardRef<PassportBookHandle, PassportBookProps>(function PassportBook(
  { spreads, profile, titleId, onNavStateChange },
  ref,
) {
  const totalSpreads = spreads.length;
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flip, setFlip] = useState<"idle" | "next" | "prev">("idle");
  const [targetIndex, setTargetIndex] = useState(0);
  const spreadRef = useRef(spreadIndex);
  spreadRef.current = spreadIndex;
  const profileCharacterContext = useOptionalProfileCharacter();
  const isProfileSelectModalOpen = profileCharacterContext?.isProfileSelectModalOpen ?? false;

  const publishNav = useCallback(
    (index: number, nextFlip: typeof flip) => {
      onNavStateChange?.({
        spread: index,
        totalSpreads,
        canPrev: index > 0,
        canNext: index < totalSpreads - 1,
        flipping: nextFlip !== "idle",
      });
    },
    [onNavStateChange, totalSpreads],
  );

  useEffect(() => {
    publishNav(spreadIndex, flip);
  }, [spreadIndex, flip, publishNav]);

  const goToSpread = useCallback(
    (next: number) => {
      if (flip !== "idle" || next < 0 || next >= totalSpreads || next === spreadRef.current) return;
      const direction = next > spreadRef.current ? "next" : "prev";
      setTargetIndex(next);
      setFlip(direction);
      publishNav(spreadRef.current, direction);
      window.setTimeout(() => {
        setSpreadIndex(next);
        setFlip("idle");
      }, FLIP_MS);
    },
    [flip, publishNav, totalSpreads],
  );

  const goPrev = useCallback(() => goToSpread(spreadRef.current - 1), [goToSpread]);
  const goNext = useCallback(() => goToSpread(spreadRef.current + 1), [goToSpread]);

  useImperativeHandle(ref, () => ({ goPrev, goNext }), [goPrev, goNext]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isProfileSelectModalOpen) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, isProfileSelectModalOpen]);

  const current = spreads[spreadIndex];
  const target = spreads[targetIndex];

  const baseLeftSpread = current;
  const baseRightSpread = flip === "idle" ? current : target;

  return (
    <div className="passport-book__flip-root">
      <div className="passport-book__viewport">
        {/* 현재 spread — 고정 grid, document flow 세로 쌓임 없음 */}
        <div className="passport-book__layer passport-book__layer--base">
          <div className="passport-book__page-slot passport-book__page-slot--left">
            <LeftPage spread={baseLeftSpread} profile={profile} titleId={titleId} totalSpreads={totalSpreads} />
          </div>
          <div className="passport-book__spine" aria-hidden="true" />
          <div className="passport-book__page-slot passport-book__page-slot--right">
            <RightPage spread={baseRightSpread} totalSpreads={totalSpreads} />
          </div>
        </div>

        {/* 넘기는 중에만 — 오른쪽 페이지 1장 */}
        {flip !== "idle" && (
          <div className={`passport-book__layer passport-book__layer--turn passport-book__layer--turn-${flip}`}>
            <div className="passport-book__page-turn">
              <div className="passport-book__page-turn-face passport-book__page-turn-face--front">
                <RightPage
                  spread={flip === "next" ? current : target}
                  totalSpreads={totalSpreads}
                />
              </div>
              <div className="passport-book__page-turn-face passport-book__page-turn-face--back" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export { FLIP_MS as BOOK_FLIP_MS };
