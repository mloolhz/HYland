import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentType,
} from "react";
import type { UserProfile } from "@/lib/user-profile";
import { useOptionalProfileCharacter } from "@/context/ProfileCharacterContext";
import { PassportMissionStampPage } from "./PassportMissionStampPage";
import { PassportIslandStoryPage } from "./PassportIslandStoryPage";
import { PassportProfilePage } from "./PassportProfilePage";
import type { BookNavState, PassportBookSpread } from "./passport-book-spreads";

export type PassportProfilePageComponent = ComponentType<{
  profile: UserProfile;
  titleId?: string;
}>;

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
  ProfilePage?: PassportProfilePageComponent;
};

function LeftPage({
  spread,
  profile,
  titleId,
  totalSpreads,
  ProfilePage,
}: {
  spread: PassportBookSpread;
  profile: UserProfile;
  titleId?: string;
  totalSpreads: number;
  ProfilePage: PassportProfilePageComponent;
}) {
  return (
    <div className="passport-book__page passport-book__page--left">
      {spread.left.type === "profile" ? (
        <ProfilePage profile={profile} titleId={titleId} />
      ) : spread.left.type === "blank" ? (
        <div className="passport-page passport-page--blank" aria-hidden="true">
          <div className="passport-page__paper-texture" />
          <div className="passport-page__paper-edge passport-page__paper-edge--left" />
        </div>
      ) : (
        <PassportMissionStampPage
          quests={spread.left.quests}
          spreadIndex={spread.index}
          totalSpreads={totalSpreads}
          side="left"
          category={spread.left.category}
          pageInCategory={spread.left.pageInCategory}
          totalPagesInCategory={spread.left.totalPagesInCategory}
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
      {spread.right.type === "island-story" ? (
        <PassportIslandStoryPage />
      ) : (
        <PassportMissionStampPage
          quests={spread.right.quests}
          spreadIndex={spread.index}
          totalSpreads={totalSpreads}
          side="right"
          category={spread.right.category}
          pageInCategory={spread.right.pageInCategory}
          totalPagesInCategory={spread.right.totalPagesInCategory}
        />
      )}
    </div>
  );
}

export const PassportBook = forwardRef<PassportBookHandle, PassportBookProps>(function PassportBook(
  { spreads, profile, titleId, onNavStateChange, ProfilePage = PassportProfilePage },
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

  useEffect(() => {
    if (spreadIndex >= totalSpreads) {
      setSpreadIndex(Math.max(0, totalSpreads - 1));
    }
  }, [spreadIndex, totalSpreads]);

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

  const current = spreads[Math.min(spreadIndex, spreads.length - 1)] ?? spreads[0];
  const target = spreads[Math.min(targetIndex, spreads.length - 1)] ?? spreads[0];

  return (
    <div className="passport-book__flip-root">
      <div className="passport-book__viewport">
        <div className="passport-book__layer passport-book__layer--base">
          <div className="passport-book__page-slot passport-book__page-slot--left">
            <LeftPage
              spread={current}
              profile={profile}
              titleId={titleId}
              totalSpreads={totalSpreads}
              ProfilePage={ProfilePage}
            />
          </div>
          <div className="passport-book__spine" aria-hidden="true" />
          <div className="passport-book__page-slot passport-book__page-slot--right">
            <RightPage spread={flip === "idle" ? current : target} totalSpreads={totalSpreads} />
          </div>
        </div>

        {flip !== "idle" && (
          <div
            className={`passport-book__layer passport-book__layer--turn passport-book__layer--turn-${flip}`}
            aria-hidden="true"
          >
            <div className="passport-book__page-turn">
              <div className="passport-book__page-turn-face passport-book__page-turn-face--front">
                <RightPage spread={current} totalSpreads={totalSpreads} />
              </div>
              <div className="passport-book__page-turn-face passport-book__page-turn-face--back">
                <LeftPage
                  spread={target}
                  profile={profile}
                  titleId={titleId}
                  totalSpreads={totalSpreads}
                  ProfilePage={ProfilePage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
