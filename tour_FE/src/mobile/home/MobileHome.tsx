import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_SLIDES, HERO_SLIDE_DURATION_MS } from "@/lib/landing-images";
import { SPORTS_DATA, type CategoryKey } from "@/data/sports";
import {
  avaColor,
  COMMUNITY_LANDING_EXAMPLE_REVIEWS,
  formatNumber,
  LANDING_LEADERBOARD,
  type Review,
} from "@/lib/landing-data";
import { IncheonWeatherBar } from "@/components/landing/IncheonWeatherBar";
import { useSession } from "@/store/session";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBadgeStats } from "@/hooks/useBadgeStats";
import { getLevelPercent, isMaxLevel } from "@/lib/user-profile";
import { useAuthSheet } from "../auth/AuthSheetProvider";
import { ChevronRightIcon, SafetyIcon, SparkIcon, TrophyIcon, IslandIcon } from "../MobileIcons";

const CATEGORIES: { key: CategoryKey; icon: string; label: string }[] = [
  { key: "water", icon: "⛵", label: "해상 레저" },
  { key: "land", icon: "🥾", label: "육상 레저" },
  { key: "exp", icon: "🎯", label: "체험" },
  { key: "heal", icon: "🌿", label: "힐링" },
];

const AI_COURSES = [
  {
    photo: "/landing-1.png",
    level: "초급",
    title: "하나개 카약 체험",
    loc: "무의도 · 2시간",
    to: "/sports?category=water",
  },
  {
    photo: "/landing-2.png",
    level: "중급",
    title: "무의바다누리길 트레일",
    loc: "소무의도 · 2.5km",
    to: "/sports?category=land",
  },
  {
    photo: "https://i.postimg.cc/wBGzcSD0/baegyeong1.jpg",
    level: "중급",
    title: "서해 맑은물 스노클링",
    loc: "백령도 · 1.5시간",
    to: "/sports?category=water",
  },
] as const;

const SHORTCUTS = [
  { to: "/islands", label: "섬 지도", icon: <IslandIcon size={22} /> },
  { to: "/island-bti", label: "섬BTI", icon: <SparkIcon size={22} /> },
  { to: "/missions", label: "미션", icon: <TrophyIcon size={22} /> },
  { to: "/safety", label: "안전정보", icon: <SafetyIcon size={22} /> },
];

function SectionHead({ title, to, more }: { title: string; to?: string; more?: string }) {
  return (
    <div className="m-sec__head">
      <h2>{title}</h2>
      {to && (
        <Link to={to} className="m-sec__more">
          {more ?? "더보기"}
          <ChevronRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}

function MobileHero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setSlide((prev) => (prev + 1) % HERO_SLIDES.length),
      HERO_SLIDE_DURATION_MS,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="m-hero">
      <div className="m-hero__slides" aria-hidden="true">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`m-hero__slide${slide === i ? " is-on" : ""}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
        <div className="m-hero__shade" />
      </div>

      <div className="m-hero__copy">
        <p className="m-hero__eyebrow">INCHEON ISLAND LEISURE</p>
        <h1 className="m-hero__title">
          인천의 섬에서
          <br />
          <span>나만의 레저 여정</span>을
          <br />
          시작하세요
        </h1>
        <Link to="/islands" className="m-hero__cta">
          섬 탐험 시작하기
          <ChevronRightIcon size={18} />
        </Link>
      </div>
    </section>
  );
}

function PassportBlock() {
  const { isLoggedIn } = useSession();
  const profile = useUserProfile();
  const badges = useBadgeStats();
  const { openAuth } = useAuthSheet();
  const percent = getLevelPercent(profile);
  const atMax = isMaxLevel(profile);

  if (!isLoggedIn) {
    return (
      <section className="m-card m-passport-cta">
        <div className="m-passport-cta__text">
          <b>섬 여권을 만들어보세요</b>
          <span>방문한 섬과 미션 배지가 여권에 기록돼요</span>
        </div>
        <div className="m-passport-cta__btns">
          <button type="button" className="m-btn m-btn--primary" onClick={() => openAuth("signup")}>
            회원가입
          </button>
          <button type="button" className="m-btn m-btn--ghost" onClick={() => openAuth("login")}>
            로그인
          </button>
        </div>
      </section>
    );
  }

  return (
    <Link to="/mypage" className="m-card m-passport">
      <div className="m-passport__top">
        <span className="m-passport__lv">Lv.{profile.level}</span>
        <b className="m-passport__name">{profile.nickname}님</b>
        <ChevronRightIcon size={18} />
      </div>
      <div className="m-passport__bar">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="m-passport__exp">
        {atMax
          ? `최고 레벨 · 방문 섬 ${profile.expCurrent}곳`
          : `다음 레벨까지 섬 ${profile.expMax - profile.expCurrent}곳`}
      </p>
      <div className="m-passport__metrics">
        <div>
          <b>{badges.visited}</b>
          <span>방문 섬</span>
        </div>
        <div>
          <b>{badges.earned}</b>
          <span>획득 배지</span>
        </div>
        <div>
          <b>{badges.unearned}</b>
          <span>남은 배지</span>
        </div>
      </div>
    </Link>
  );
}

function LeisureRail() {
  const [category, setCategory] = useState<CategoryKey>("water");
  const items = useMemo(() => SPORTS_DATA[category].slice(0, 6), [category]);

  return (
    <section className="m-sec">
      <SectionHead title="레저스포츠" to={`/sports?category=${category}`} />

      <div className="m-chips" role="tablist" aria-label="레저 카테고리">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={category === c.key}
            className={`m-chip${category === c.key ? " is-on" : ""}`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="m-rail">
        {items.map((sport) => (
          <Link key={sport.id} to={`/sports?category=${category}`} className="m-rail__card">
            <div className="m-rail__thumb">
              {sport.photo?.trim() ? (
                <img src={sport.photo} alt="" loading="lazy" />
              ) : (
                <span className="m-rail__emoji">
                  {CATEGORIES.find((c) => c.key === category)?.icon}
                </span>
              )}
              <span className="m-rail__tag">{sport.diff}</span>
            </div>
            <b className="m-rail__title">{sport.name}</b>
            <span className="m-rail__sub">
              📍 {sport.islands[0]?.n ?? "인천 섬"}
              {sport.islands.length > 1 ? ` 외 ${sport.islands.length - 1}곳` : ""}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AiRail() {
  return (
    <section className="m-sec">
      <SectionHead title="AI 추천 코스" to="/ai-recommend" more="맞춤 추천" />
      <div className="m-rail m-rail--wide">
        {AI_COURSES.map((course) => (
          <Link key={course.title} to={course.to} className="m-rail__card m-rail__card--wide">
            <div className="m-rail__thumb">
              <img src={course.photo} alt="" loading="lazy" />
              <span className="m-rail__tag m-rail__tag--lv">{course.level}</span>
            </div>
            <b className="m-rail__title">{course.title}</b>
            <span className="m-rail__sub">📍 {course.loc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RankBlock() {
  const top3 = LANDING_LEADERBOARD.slice(0, 3);

  return (
    <section className="m-sec">
      <SectionHead title="탐험가 순위" to="/leaderboard" />
      <ol className="m-card m-rank">
        {top3.map(([name, pts], i) => (
          <li key={name}>
            <span className="m-rank__no">{i + 1}</span>
            <span className="m-rank__ava" style={{ background: avaColor(name) }}>
              {name[0]}
            </span>
            <span className="m-rank__name">{name}</span>
            <span className="m-rank__pts">{formatNumber(pts)} P</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReviewBlock() {
  const items: Review[] = COMMUNITY_LANDING_EXAMPLE_REVIEWS;

  return (
    <section className="m-sec">
      <SectionHead title="최근 탐험 후기" to="/community" />
      <ul className="m-card m-reviews">
        {items.map((review: Review) => (
          <li key={`${review.name}-${review.isl}`}>
            <span className="m-reviews__ava" style={{ background: avaColor(review.name + review.isl) }}>
              {review.name[0]}
            </span>
            <div className="m-reviews__body">
              <div className="m-reviews__line">
                <span className="m-reviews__isl">{review.isl}</span>
                <span className="m-reviews__name">{review.name}</span>
                <span className="m-reviews__act">{review.act}</span>
              </div>
              <p className="m-reviews__text">{review.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MobileHome() {
  return (
    <div className="m-home">
      <MobileHero />

      <div className="m-home__body">
        <div className="m-home__weather">
          <IncheonWeatherBar />
        </div>

        <PassportBlock />

        <nav className="m-cats" aria-label="레저 카테고리">
          {CATEGORIES.map((c) => (
            <Link key={c.key} to={`/sports?category=${c.key}`} className="m-cats__item">
              <span className="m-cats__icon" aria-hidden="true">
                {c.icon}
              </span>
              {c.label}
            </Link>
          ))}
        </nav>

        <nav className="m-shortcuts" aria-label="바로가기">
          {SHORTCUTS.map((s) => (
            <Link key={s.to} to={s.to} className="m-shortcuts__item">
              <span className="m-shortcuts__icon">{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </nav>

        <LeisureRail />
        <AiRail />
        <RankBlock />
        <ReviewBlock />

        <footer className="m-foot">
          <p>© 2026 인천섬 레저누리</p>
          <p>문의: contact@islandquest.kr · 제작: HYland 팀</p>
        </footer>
      </div>
    </div>
  );
}
