# tour_BE — HYland 백엔드

인천 섬 레저누리 백엔드. 스택: **Node + TypeScript + Express + Prisma 7 + MySQL**

회원/섬/종목 카탈로그 API와 AI 추천(Gemini) API가 한 서버에 함께 올라갑니다. 프론트(`tour_FE`, `localhost:5173`)와 연동됩니다.

---

## 기술 스택

- **런타임**: Node.js 20+ (ESM, `"type": "module"`)
- **서버**: Express 5 + TypeScript, 개발 실행은 `tsx` (핫 리로드)
- **DB**: MySQL + **Prisma 7** — driver adapter `@prisma/adapter-mariadb` + `mariadb` 드라이버
- **인증**: bcryptjs + jsonwebtoken
- **AI**: Google Gemini (`@google/generative-ai`), 모델 `gemini-flash-lite-latest`, Google Search grounding 활성화

> **Prisma 7 주의**: `new PrismaClient()`만으로는 연결되지 않습니다. 반드시 driver adapter를 넘겨야 하며, 이 프로젝트는 `src/prisma.ts`에서 한 번만 구성해 앱 전체가 공유합니다. 또 datasource의 `url`은 스키마가 아니라 `prisma.config.ts`에 둡니다.

---

## 처음 세팅

### 1. 의존성 설치

```bash
cd tour_BE
npm install
```

### 2. MySQL 준비

MySQL(8.0+) 또는 MariaDB(10.2+)에 DB를 하나 만듭니다. 한글을 저장하므로 `utf8mb4`가 중요합니다.

```sql
CREATE DATABASE hyland CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. `.env` 생성

```bash
cp .env.example .env
```

`.env`를 본인 환경에 맞게 채웁니다. **이 파일은 git에 올라가지 않습니다.**

```
DATABASE_URL="mysql://root:본인_비밀번호@localhost:3306/hyland"
JWT_SECRET="아무-긴-랜덤-문자열"
GEMINI_API_KEY=여기에_본인_Gemini_키
TOUR_API_KEY=""
PORT=4000
```

- `DATABASE_URL` — `mysql://유저:비밀번호@호스트:포트/DB이름` 형식, 기본 포트 3306
- `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/apikey)에서 각자 발급. `AIza`로 시작하는 키 전체를 따옴표 없이. **키는 각자 발급하세요** — 공유하면 할당량도 공유됩니다.
- `TOUR_API_KEY` — 공공데이터포털 TourAPI 4.0 서비스키 (관광공사 데이터 수집용, 선택)

### 4. 마이그레이션 + 클라이언트 생성

```bash
npx prisma migrate dev
npx prisma generate
```

`prisma/migrations/`에는 세 개의 이력이 순서대로 있습니다.

| 마이그레이션 | 내용 |
|---|---|
| `20260814121610_init` | 회원·카탈로그·관광공사 등 25개 테이블 |
| `20260820003013_init` | AI 추천 이력 `Recommendation` 테이블 |
| `20260823000000_add_question_source` | `Recommendation.questionSource` 컬럼 추가 |

> **이미 한쪽만 적용해 둔 로컬 DB가 있다면** 마이그레이션 순서가 어긋나 드리프트 오류(P3005 등)가 납니다. 로컬 개발 데이터는 버려도 되므로 `npx prisma migrate reset`으로 초기화한 뒤 다시 적용하는 게 가장 빠릅니다.

### 5. 시드 (카탈로그 정적 데이터)

```bash
npm run db:seed
```

### 6. 데모 계정 시드

계정은 DB 에만 있고 git 에는 없습니다. 코드를 받은 사람도 같은 계정으로
시연할 수 있도록 세 계정을 시드로 넣어 둡니다.

```bash
npm run db:seed:accounts
```

| 아이디 | 비밀번호 | 닉네임 | 권한 |
|--------|----------|--------|------|
| `demo-jichan` | `Demo1234!` | 지찬데모 | **ADMIN** — 인증샷 검수, 남의 글·댓글 삭제 |
| `ipado` | `Ipado1234!` | 이파도 | USER |
| `deungdae` | `Deungdae1234!` | 박등대 | USER |

재실행해도 안전합니다. 이미 있는 계정이면 비밀번호·권한만 맞추고 글·배지·방문
기록은 그대로 둡니다.

> ⚠ 데모용이라 비밀번호가 코드에 그대로 있습니다. 실제 서비스로 올릴 때는
> `prisma/seed-accounts.ts` 와 `db:seed:accounts` 스크립트를 반드시 지우세요.

### 7. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:4000/health` 접속 시 `{ "ok": true, "service": "tour_BE" }`가 나오면 정상입니다.

---

## 실행 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (핫 리로드) |
| `npm start` | 서버 실행 |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:studio` | Prisma Studio (DB를 눈으로 확인) |
| `npm run db:seed` | 정적 카탈로그 시드 |
| `npm run db:seed:leisure` | 레저 시설 145곳 시드 |
| `npm run db:seed:badges` | 배지 정의 시드 |
| `npm run db:seed:accounts` | 데모 계정 3개 시드 |
| `npm run tour:inspect` | 관광공사 레포츠 데이터 조회 |

---

## 폴더 구조

```
tour_BE/
├── src/
│   ├── index.ts            # Express 진입점, 라우터 마운트, 섬/종목 API
│   ├── prisma.ts           # 공용 Prisma 클라이언트 (driver adapter 구성)
│   ├── auth.ts             # 회원가입/로그인/내정보/휴대폰인증
│   ├── routes/
│   │   └── recommend.ts    # AI 추천·스트리밍·날씨·집계 API
│   └── services/
│       └── gemini.ts       # Gemini 호출 (논스트리밍/스트리밍)
├── prisma/
│   ├── schema.prisma       # DB 스키마 (26개 모델)
│   ├── migrations/         # 마이그레이션 이력
│   └── seed.ts             # 정적 카탈로그 시드
├── prisma.config.ts        # Prisma CLI 설정 (DATABASE_URL)
├── public/                 # 인증 테스트 콘솔
└── .env                    # 로컬 환경변수 (git 제외, 각자 생성)
```

---

## 스키마 구조

| Phase | 테이블 | 설명 |
|---|---|---|
| **0 회원** | users, oauth_accounts, phone_verifications, user_profiles, user_settings | 로그인·회원가입·프로필 |
| **1 마스터** | islands, island_regions, island_leisure_courses, sport_categories, sports, sport_islands, sport_booking_methods, mission_categories, mission_quests, badge_definitions, island_stamp_meta, profile_characters, island_bti_questions, island_bti_results | FE 정적 카탈로그 (시드) |
| **2 유저상태** | user_island_visits, user_mission_progress, user_badges, user_island_bti_results | 로그인 후 "내 데이터" |
| **관광공사** | tour_spots, tour_spot_sports | TourAPI 섬별 관광/레저 정보 |
| **AI 추천** | Recommendation | 추천 이력 (인기질문·섬BTI 선호도·예상 질문 집계 원천) |

> `Recommendation`만 테이블명이 camelCase인데, 기존 마이그레이션이 그 이름으로 이미 생성돼 있어 맞춘 것입니다. 팀 컨벤션(snake_case)으로 통일하려면 별도 rename 마이그레이션이 필요합니다.

`Recommendation.questionSource`는 질문이 어디서 왔는지 구분합니다 — `"user"`(직접 입력) / `"chip"`(인기질문·AI followup 칩 클릭). 칩 클릭까지 인기질문에 집계하면 AI가 만든 문구가 인기질문이 되고 그게 다시 첫 화면에 노출돼 스스로를 강화하기 때문에, `GET /api/popular-questions`는 `chip`을 제외합니다. 이 필드가 없던 시절의 기록은 `NULL`이라 분류할 수 없어 집계에 그대로 남지만, 카운트가 더 늘지 않으므로 시간이 지나면 실제 사용자 질문에 밀려납니다.

---

## API 엔드포인트

기본 URL: `http://localhost:4000`

### 공통

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/health` | 헬스체크 → `{ ok: true, service: "tour_BE" }` |

### 인증 (`/auth`)

회원가입·로그인·내정보·휴대폰 인증. 브라우저에서 `http://localhost:4000` 접속 시 테스트 콘솔이 뜹니다.

### 카탈로그

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/islands` | 섬 목록 (권역·레저코스 포함) |
| `GET` | `/islands/:id` | 섬 상세 (종목·관광지 포함) |
| `GET` | `/sports` | 레저 종목 목록 (`?category=water\|land\|exp\|heal`) |
| `GET` | `/sports/:id` | 레저 종목 상세 |

### AI 추천 (`/api`)

#### `POST /api/recommend`
AI 추천 1회 응답 (논스트리밍).

요청 body: `{ "question": "커플이 즐길 힐링 코스 추천해줘", "history": [], "persona": {}, "sessionId": "..." }`

응답:
```json
{
  "text": "대화체 설명",
  "recommendations": [{ "sportId": "walk", "islandName": "영흥도" }],
  "course": { "title": "...", "steps": [{ "time": "10:00", "activity": "...", "desc": "..." }] },
  "tips": ["..."],
  "followups": ["..."],
  "weather": { "date": "2026-08-20", "summary": "맑음, 최고 28도", "recommendation": "수상 레저를 즐기기 좋아요." }
}
```
- 레저와 무관한 질문도 회피하지 않고 `text`로 답변합니다(이 경우 `recommendations`는 빈 배열, `course`는 `null`).
- `persona.travelDate`가 있으면 Gemini가 Google Search로 그 날짜의 실제 날씨를 검색해 `weather`를 채웁니다. 실패하거나 날짜가 없으면 필드 자체가 생략됩니다(폴백).
- 응답 후 백그라운드로 DB에 저장됩니다.

#### `POST /api/recommend/stream`
SSE 스트리밍 응답. body는 위와 동일. 이벤트: `chunk` → `done`, 오류 시 `error`.

#### `POST /api/weather`
답변 본문 없이 날짜 기준 날씨만 조회. body: `{ "travelDate": "2026-08-25", "travelEndDate": "..." }`
실패해도 500이 아니라 `{ "weather": null }`로 응답합니다(FE가 조용히 생략).

#### `POST /api/top3/save`
조건 패널(TOP3) 결과를 Gemini 호출 없이 그대로 저장합니다. FE 로컬 추천 엔진 결과를 섬BTI 선호도·예상 질문 집계에 쓰기 위한 것입니다. 응답: `{ "ok": true }`

#### `GET /api/popular-questions`
저장된 질문 중 빈도 상위 4개. → `{ "questions": ["질문1", ...] }`

#### `GET /api/bti-preferences`
섬BTI 유형별로 가장 많이 추천된 섬 TOP3. `?code=AWCP`로 특정 유형만 조회 가능.
```json
{ "preferences": [{ "islandBti": "AWCP", "sampleCount": 12, "topIslands": [{ "islandName": "대무의도", "count": 7 }] }] }
```

#### `GET /api/suggested-questions`
비슷한 조건(`?companion=friend&travelMood=healing`)으로 TOP3를 받은 다른 세션들이 그 직후 이어서 물어본 질문을 빈도순 최대 4개. → `{ "questions": ["카약 예약은 어떻게 해?"] }`

---

## 트러블슈팅

**`A driver adapter is required` (Prisma)**
Prisma 7은 `new PrismaClient()`만으로 연결되지 않습니다. `src/prisma.ts`의 공용 클라이언트를 import해서 쓰세요. 새 PrismaClient를 직접 만들지 마세요.

**`The datasource property 'url' is no longer supported`**
Prisma 7에서는 `schema.prisma`의 datasource에 `url`을 쓸 수 없습니다. `prisma.config.ts`에서 지정합니다.

**`P3005` / 드리프트 오류 (Prisma migrate)**
로컬 DB에 한쪽 마이그레이션만 적용돼 있을 때 납니다. `npx prisma migrate reset` 후 다시 적용하세요.

**`mysql` 명령을 못 찾음 (Windows)**
`C:\Program Files\MySQL\MySQL Server <버전>\bin`을 시스템 환경변수 Path에 추가하고 터미널을 새로 여세요.

**`ER_NOT_SUPPORTED_AUTH_MODE` / 접속 오류**
MySQL 8 기본 인증 방식(`caching_sha2_password`) 문제입니다.
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '본인_비밀번호';
```

**`API key not valid` (400)**
`.env`의 `GEMINI_API_KEY`가 잘못됐거나 일부만 복사된 경우. 키 전체를 따옴표·공백 없이 붙여넣고 서버를 재시작하세요.

**429 (할당량 초과)**
Gemini 무료 tier는 일일/분당 요청 한도가 있습니다. 테스트를 많이 하면 걸립니다. 잠시 기다리거나(분당) 다음 날 리셋(일일)을 기다리세요.

**4000 포트 이미 사용 중**
```bash
netstat -ano | findstr ":4000"
taskkill /PID <나온_PID> /F
```

---

## 주의사항

- **`.env`는 절대 커밋하지 마세요.** API 키·DB 비밀번호가 유출됩니다.
- `node_modules/`, `dist/`, `generated/`는 git에서 제외됩니다. clone 후 `npm install`로 로컬 생성.
- DB 없이도 Gemini 응답 자체는 되지만, **추천 저장·인기질문·섬BTI 선호도·예상 질문 API는 DB가 있어야** 동작합니다.
