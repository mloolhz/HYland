import { useRef, useState } from "react";
import { PassportBook, type PassportBookHandle } from "@/components/landing/PassportBook";
import { PASSPORT_BADGES } from "@/components/landing/passport-book-data";
import { buildBookSpreads, type BookNavState } from "@/components/landing/passport-book-spreads";
import { useOptionalProfileCharacter } from "@/context/ProfileCharacterContext";
import type { UserProfile } from "@/lib/user-profile";

const BOOK_SPREADS = buildBookSpreads(PASSPORT_BADGES);

const INITIAL_NAV: BookNavState = {
  spread: 0,
  totalSpreads: BOOK_SPREADS.length,
  canPrev: false,
  canNext: BOOK_SPREADS.length > 1,
  flipping: false,
};

type MyPagePassportBookProps = {
  profile: UserProfile;
};

export function MyPagePassportBook({ profile }: MyPagePassportBookProps) {
  const [nav, setNav] = useState<BookNavState>(INITIAL_NAV);
  const bookRef = useRef<PassportBookHandle>(null);
  const profileCharacterContext = useOptionalProfileCharacter();
  const isProfileSelectModalOpen = profileCharacterContext?.isProfileSelectModalOpen ?? false;

  return (
    <div className="mp-passport-book" aria-label="i-바다패스 여권">
      <div className="passport-book passport-book--open passport-book--embedded">
        <div className="passport-book__shell">
          <div className="passport-book__frame">
            <div className="passport-book__scene">
              <PassportBook
                ref={bookRef}
                spreads={BOOK_SPREADS}
                profile={profile}
                titleId="mp-passport-title"
                onNavStateChange={setNav}
              />

              <div className="passport-book__back-board" aria-hidden="true" />
              <div className="passport-book__cover-shadow" aria-hidden="true" />
            </div>
          </div>

          <div className="passport-book__controls">
            {nav.canPrev && (
              <button
                type="button"
                className="passport-book__tab passport-book__tab--prev"
                aria-label="이전 페이지"
                disabled={nav.flipping || isProfileSelectModalOpen}
                onClick={() => bookRef.current?.goPrev()}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M14 7L9 12L14 17"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {nav.canNext && (
              <button
                type="button"
                className="passport-book__tab passport-book__tab--next"
                aria-label="다음 페이지"
                disabled={nav.flipping || isProfileSelectModalOpen}
                onClick={() => bookRef.current?.goNext()}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10 7L15 12L10 17"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
