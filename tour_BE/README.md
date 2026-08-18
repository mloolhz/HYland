# tour_BE — 인천 섬 레저누리 AI 추천 백엔드

인천 섬 레저 활동을 추천하는 API 서버입니다. 사용자 질문을 Google Gemini로 처리해 종목·코스·팁을 반환하고, 추천 이력을 MySQL에 저장합니다. 프론트(`tour_FE`, `localhost:5173`)와 연동됩니다.

---

## 기술 스택

- **런타임**: Node.js 18+
- **서버**: Express 5 + TypeScript
- **AI**: Google Gemini (`@google/generative-ai`), 모델 `gemini-flash-lite-latest`, Google Search grounding 활성화
- **DB**: MySQL + Prisma 7 (driver adapter `@prisma/adapter-mariadb` + `mariadb` 드라이버)
- **개발 실행**: `tsx` (핫 리로드)

---

## 처음 세팅 (팀원 필독)

레포를 clone한 뒤, 아래 순서대로 진행하면 로컬에서 서버가 뜹니다.

### 1. 의존성 설치

```bash
cd tour_BE
npm install
```

### 2. MySQL 준비

로컬에 MySQL(8.0+) 또는 MariaDB(10.2+)가 설치돼 있어야 합니다. (없으면 https://dev.mysql.com/downloads/mysql/ 에서 설치, 설치 시 정한 root 비밀번호를 꼭 기억하세요.)

설치 후, 이 프로젝트가 쓸 DB를 하나 만듭니다:

```bash
mysql -u root -p
```
비밀번호 입력 후:
```sql
CREATE DATABASE tour_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```
> DB 이름(`tour_db`)은 자유롭게 정해도 됩니다. 아래 `.env`의 `DATABASE_URL`과 일치시키기만 하면 됩니다. 한글 질문·답변을 저장하므로 `utf8mb4`로 만드는 게 중요합니다.

### 3. `.env` 파일 생성

`tour_BE/` 폴더 바로 아래에 `.env` 파일을 만들고 아래 내용을 채웁니다. **이 파일은 git에 올라가지 않으니 각자 만들어야 합니다.**

```
GEMINI_API_KEY=여기에_본인_Gemini_키
DATABASE_URL=mysql://root:본인_DB_비밀번호@localhost:3306/tour_db
PORT=4000
```

- `GEMINI_API_KEY` — Google AI Studio(https://aistudio.google.com/apikey)에서 각자 발급. **`AIza`로 시작하는 키 전체**를 따옴표 없이 붙여넣습니다.
- `DATABASE_URL` — 위에서 만든 DB 정보로. `mysql://유저명:비밀번호@호스트:포트/DB이름` 형식이며 기본 포트는 `3306`입니다.
- `PORT` — 선택. 없으면 자동으로 4000.

### 4. Prisma 마이그레이션 + 클라이언트 생성 (PostgreSQL → MySQL 전환 시 필독)

이 프로젝트는 PostgreSQL에서 MySQL로 DBMS를 변경했습니다. `prisma/migrations/` 아래 기존 마이그레이션은 PostgreSQL 전용 SQL(`migration_lock.toml`의 `provider = "postgresql"` 포함)이라 MySQL에서 재사용할 수 없습니다. **처음 한 번, 아래 순서로 새로 만들어야 합니다.**

```bash
# 1) 기존 postgres 마이그레이션 폴더를 통째로 삭제
rm -rf prisma/migrations

# 2) MySQL 기준으로 새 초기 마이그레이션 생성 + 적용
npx prisma migrate dev --name init_mysql

# 3) Prisma 클라이언트 생성
npx prisma generate
```

`migrate dev`가 DB에 `Recommendation` 테이블을 만들고, `generate`가 Prisma 클라이언트를 생성합니다. (DB 연결이 돼야 성공하므로 MySQL이 켜져 있어야 합니다.) 이미 마이그레이션을 새로 만든 팀원이라면 2번 대신 `npx prisma migrate dev`만 실행해 최신 마이그레이션을 받으면 됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

터미널에 `서버 실행 중: http://localhost:4000`이 뜨면 성공입니다.

### 6. 동작 확인

브라우저에서 `http://localhost:4000/health` 접속 → 아래가 나오면 정상:
```json
{ "status": "ok", "message": "tour_BE 서버 정상 동작 중" }
```

---

## 실행 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (핫 리로드) |
| `npm run build` | TypeScript → `dist/` 컴파일 |
| `npm start` | 빌드 결과물로 실행 (`npm run build` 먼저 필요) |

---

## 폴더 구조

```
tour_BE/
├── src/
│   ├── index.ts            # Express 진입점, CORS·JSON 미들웨어, 라우터 마운트
│   ├── routes/
│   │   └── recommend.ts    # AI 추천·스트리밍·인기질문 API, DB 저장
│   └── services/
│       └── gemini.ts       # Gemini 호출 (논스트리밍/스트리밍)
├── prisma/
│   ├── schema.prisma       # DB 스키마 (Recommendation 모델)
│   └── migrations/         # 마이그레이션 이력
├── prisma.config.ts        # Prisma CLI 설정 (DATABASE_URL)
├── .env                    # 로컬 환경변수 (git 제외, 각자 생성)
└── package.json
```

---

## API 엔드포인트

기본 URL: `http://localhost:4000`

### `GET /health`
헬스체크. 응답: `{ "status": "ok", "message": "..." }`

### `POST /api/recommend`
AI 추천 1회 응답 (논스트리밍).

요청 body:
```json
{ "question": "커플이 즐길 힐링 코스 추천해줘" }
```

응답:
```json
{
  "text": "대화체 설명",
  "recommendations": [{ "sportId": "walk", "islandName": "영흥도" }],
  "course": { "title": "...", "steps": [{ "time": "10:00", "activity": "...", "desc": "..." }] },
  "tips": ["..."],
  "followups": ["..."],
  "weather": { "date": "2026-08-20", "summary": "맑음, 최고 28도", "recommendation": "수상 레저 활동을 즐기기 좋은 날씨예요." }
}
```
- 레저와 무관한 질문도 회피하지 않고 `text`로 답변합니다(이 경우 `recommendations`는 빈 배열, `course`는 `null`).
- `persona.travelDate`가 있으면 Gemini가 Google Search로 해당 날짜의 실제 날씨를 검색해 `weather` 필드를 채웁니다. 검색에 실패하거나 날짜가 없으면 `weather` 필드 자체가 생략됩니다(폴백).
- 응답 후 백그라운드로 DB에 저장됩니다.

### `POST /api/recommend/stream`
스트리밍 응답 (SSE). 요청 body는 위와 동일.
- `Content-Type: text/event-stream`
- 이벤트: `chunk`(생성 중 조각) → `done`(완성 JSON) / 오류 시 `error`
- `done` 이후 백그라운드 DB 저장.

### `GET /api/popular-questions`
DB에 저장된 질문 중 빈도 상위 4개 반환.
```json
{ "questions": ["질문1", "질문2", "질문3", "질문4"] }
```

### `GET /api/bti-preferences`
섬BTI 유형별로 그 유형 사용자들이 가장 많이 추천받은 섬 TOP3를 반환합니다. `?code=AWCP`처럼 특정 유형만 조회할 수도 있습니다.
```json
{
  "preferences": [
    {
      "islandBti": "AWCP",
      "sampleCount": 12,
      "topIslands": [
        { "islandName": "대무의도", "count": 7 },
        { "islandName": "덕적도", "count": 4 }
      ]
    }
  ]
}
```
- `persona.islandBti`가 함께 저장된 추천 기록의 `response.recommendations[].islandName`을 유형별로 집계합니다.
- 조건 패널을 적용해 섬BTI가 함께 전달된 기록이 아직 없으면 해당 유형은 목록에서 빠집니다.

### `POST /api/top3/save`
조건 패널(TOP3) 결과를 Gemini 호출 없이 그대로 저장합니다. FE의 구조화 추천 엔진(로컬 계산) 결과를 저장해 섬BTI 선호도·예상 질문 집계에 씁니다.

요청 body:
```json
{
  "question": "당일치기 · 친구 · 힐링 · 바다,산책 조건으로 섬 추천해줘",
  "persona": { "companion": "friend", "travelMood": "healing", "islandBti": "AWCP" },
  "response": { "recommendations": [{ "islandName": "대무의도", "rank": 1, "finalScore": 92 }] },
  "sessionId": "브라우저 세션 UUID"
}
```
응답: `{ "ok": true }` (저장은 백그라운드, 실패해도 화면에는 영향 없음)

### `GET /api/suggested-questions`
비슷한 조건(동행·분위기)으로 TOP3를 받은 다른 세션들이 그 직후 이어서 물어본 질문을 빈도순으로 최대 4개 반환합니다. `?companion=friend&travelMood=healing`처럼 조건을 지정합니다. 조건 매칭 턴 바로 다음에 온 "일반 질문"(persona 없는 질문)만 집계 대상입니다.
```json
{ "questions": ["카약 예약은 어떻게 해?", "비 오면 어떻게 해?"] }
```

---

## DB 모델 (`Recommendation`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Int | PK, 자동 증가 |
| `question` | String | 사용자 질문 |
| `persona` | Json? | 조건(날짜·동행·분위기·관심활동) + `islandBti` 스냅샷 |
| `response` | Json | AI 응답 전체 |
| `islandBti` | String? | `persona.islandBti` 스냅샷 (섬BTI별 섬 선호도 집계용 인덱스) |
| `sessionId` | String? | 브라우저 세션(탭) 단위 식별자 — 예상 질문 집계용 |
| `createdAt` | DateTime | 저장 시각 |

`persona`·`response`는 MySQL 5.7+/MariaDB 10.2+의 네이티브 `JSON` 컬럼으로 저장되며, Prisma가 읽기/쓰기·`Prisma.JsonNull` 처리를 PostgreSQL 때와 동일하게 지원합니다(코드 변경 불필요).

DB 내용을 눈으로 보려면:
```bash
npx prisma studio
```

---

## CORS

프론트 주소 `http://localhost:5173`, `http://localhost:5174`를 허용합니다. 프론트가 다른 포트로 뜨면 `src/index.ts`의 `cors` 설정에 추가해야 합니다.

---

## 트러블슈팅 (실제로 자주 막히는 지점)

**`mysql` 명령을 못 찾음 (Windows)**
MySQL 설치했는데 `mysql`이 인식 안 되면 PATH 문제입니다. `C:\Program Files\MySQL\MySQL Server <버전>\bin`을 시스템 환경변수 Path에 추가하고 터미널을 새로 여세요.

**`P3005`/드리프트 오류 (Prisma migrate)**
PostgreSQL에서 MySQL로 옮기면서 기존 `prisma/migrations/`가 남아있으면 발생합니다. `rm -rf prisma/migrations` 후 `npx prisma migrate dev --name init_mysql`로 새로 만드세요.

**`API key not valid` (400)**
`.env`의 `GEMINI_API_KEY`가 잘못됐거나 일부만 복사된 경우. Google AI Studio에서 복사 아이콘으로 키 전체를 다시 복사해 따옴표·공백 없이 붙여넣으세요. `.env` 수정 후 서버 재시작 필수.

**`This model ... is no longer available` (404)**
Gemini 모델 이름이 안 맞을 때. `src/services/gemini.ts`의 모델명을 `gemini-flash-lite-latest` 등 현재 사용 가능한 이름으로. 사용 가능 모델은 https://aistudio.google.com 에서 확인.

**`A driver adapter is required` (Prisma)**
Prisma 7은 `new PrismaClient()`만으로는 연결이 안 됩니다. 이 프로젝트는 이미 `@prisma/adapter-mariadb`를 쓰도록 돼 있으니, `npm install`이 제대로 됐는지 확인하세요.

**`ER_NOT_SUPPORTED_AUTH_MODE` / 접속 오류**
MySQL 8 기본 인증 방식(`caching_sha2_password`)을 일부 클라이언트가 지원하지 못해 생깁니다. 필요하면 계정 인증 방식을 바꾸세요:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '본인_비밀번호';
```

**`Cannot find module '.prisma/client/...'`**
Prisma 클라이언트 미생성. `npx prisma generate` 실행하세요.

**429 (할당량 초과)**
Gemini 무료 tier는 일일/분당 요청 한도가 있습니다. 테스트를 많이 하면 걸립니다. 잠시 기다리거나(분당 한도) 다음 날 리셋(일일 한도)을 기다리세요. 팀이 같은 키를 공유하면 한도도 공유되니, 각자 키를 발급받는 걸 권장합니다.

**4000 포트 이미 사용 중**
이전 서버가 안 꺼졌을 수 있습니다. 터미널에서 `Ctrl+C`로 끄고 다시 `npm run dev`. 그래도 안 되면(Windows):
```bash
netstat -ano | findstr ":4000"
taskkill /PID <나온_PID> /F
```

---

## 주의사항

- **`.env`는 절대 커밋하지 마세요.** API 키·DB 비밀번호가 유출됩니다. (`.gitignore`에 이미 포함돼 있음)
- **API 키는 각자 발급**하세요. 공유하면 할당량도 공유됩니다.
- `dist/`, `node_modules/`, `generated/`도 git에서 제외됩니다. clone 후 `npm install`·`npm run build`로 로컬 생성.
- DB 없이도 AI 응답 자체는 되지만, **추천 저장·인기질문 API는 DB가 있어야** 동작합니다.
