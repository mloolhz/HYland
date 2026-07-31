/** public 히어로 이미지 — ASCII 경로 사용 (한글 파일명 URL 인코딩 이슈 회피) */
export const LANDING_IMAGE_1 = "/landing-1.png";
export const LANDING_IMAGE_2 = "/landing-2.png";
export const LEISURE_SPORTS_HERO = "/leisure-sports-hero.png";

const PH3 = "https://i.postimg.cc/TP4xqZnN/baegyeong3.jpg";
const PH4 = "https://i.postimg.cc/8C0GBqLK/baegyeong4.jpg";
const PH1 = "https://i.postimg.cc/wBGzcSD0/baegyeong1.jpg";

/** 랜딩 히어로 5장 — 기존 5장 중 ph2·ph5(중복) 제거, 랜딩1·2 추가 */
export const HERO_SLIDES = [
  LANDING_IMAGE_1,
  LANDING_IMAGE_2,
  PH3,
  PH4,
  PH1,
] as const;
