# tour_BE — HYland 백엔드

인천 섬 레저누리 백엔드. 스택: **Node + TypeScript + Express + Prisma + MySQL**

## 지금 있는 것

- `prisma/schema.prisma` — DB 스키마 초안 (Phase 0~2 + 관광공사 tour_spots)
- `.env.example` — 환경변수 템플릿

## 처음 세팅 (한 번만)

### 1. MySQL 설치 + DB 만들기
MySQL 설치 후, DB 하나 생성:
```sql
CREATE DATABASE hyland CHARACTER SET utf8mb4;
```
(DBeaver 같은 툴에서 실행하면 편함)

### 2. 환경변수
```bash
cp .env.example .env
```
`.env` 의 `DATABASE_URL` 을 본인 MySQL 계정/비번으로 수정.

### 3. 패키지 설치 + 스키마 반영
```bash
npm init -y
npm install prisma @prisma/client
npx prisma migrate dev --name init
```
→ MySQL에 테이블이 전부 생성됨. `npx prisma studio` 로 눈으로 확인 가능.

## 스키마 구조 (Phase별)

| Phase | 테이블 | 설명 |
|---|---|---|
| **0 회원** | users, oauth_accounts, phone_verifications, user_profiles, user_settings | 로그인·회원가입·프로필 |
| **1 마스터** | islands, island_regions, island_leisure_courses, sport_categories, sports, sport_islands, sport_booking_methods, mission_categories, mission_quests, badge_definitions, island_stamp_meta, profile_characters, island_bti_questions, island_bti_results | FE 정적 카탈로그 (시드) |
| **2 유저상태** | user_island_visits, user_mission_progress, user_badges, user_island_bti_results | 로그인 후 "내 데이터" |
| **관광공사** | **tour_spots, tour_spot_sports** | TourAPI 섬별 관광/레저 정보 (필수요소) |

## 다음 단계 (아직 안 만듦)

- Express 서버 뼈대 + 회원가입/로그인 API
- FE 정적데이터 → DB 시드 스크립트
- TourAPI 수집 스크립트 (`tour_spots` 채우기)
- 커뮤니티/리더보드/알림 테이블 (Phase 4~6)
