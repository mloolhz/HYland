# tour_BE — 인천 섬 레저누리 AI 추천 백엔드

인천 섬 레저 활동을 추천하는 API 서버입니다. 사용자 질문을 Google Gemini로 처리해 종목·코스·팁을 반환하고, 추천 이력을 PostgreSQL에 저장합니다. 프론트(`tour_FE`, `localhost:5173`)와 연동됩니다.

---

## 기술 스택

- **런타임**: Node.js 18+
- **서버**: Express 5 + TypeScript
- **AI**: Google Gemini (`@google/generative-ai`), 모델 `gemini-flash-lite-latest`
- **DB**: PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- **개발 실행**: `tsx` (핫 리로드)

---

## 처음 세팅 (팀원 필독)

레포를 clone한 뒤, 아래 순서대로 진행하면 로컬에서 서버가 뜹니다.

### 1. 의존성 설치

```bash
cd tour_BE
npm install
```

### 2. PostgreSQL 준비

로컬에 PostgreSQL이 설치돼 있어야 합니다. (없으면 https://www.postgresql.org/download 에서 설치, 설치 시 정한 비밀번호를 꼭 기억하세요.)

설치 후, 이 프로젝트가 쓸 DB를 하나 만듭니다:

```bash
psql -U postgres
```
비밀번호 입력 후:
```sql
CREATE DATABASE tour_db;
\q
```
> DB 이름(`tour_db`)은 자유롭게 정해도 됩니다. 아래 `.env`의 `DATABASE_URL`과 일치시키기만 하면 됩니다.

### 3. `.env` 파일 생성

`tour_BE/` 폴더 바로 아래에 `.env` 파일을 만들고 아래 내용을 채웁니다. **이 파일은 git에 올라가지 않으니 각자 만들어야 합니다.**

```
GEMINI_API_KEY=여기에_본인_Gemini_키
DATABASE_URL=postgresql://postgres:본인_DB_비밀번호@localhost:5432/tour_db?schema=public
PORT=4000
```

- `GEMINI_API_KEY` — Google AI Studio(https://aistudio.google.com/apikey)에서 각자 발급. **`AIza`로 시작하는 키 전체**를 따옴표 없이 붙여넣습니다.
- `DATABASE_URL` — 위에서 만든 DB 정보로. `postgres` 자리에 유저명, `본인_DB_비밀번호` 자리에 설치 시 정한 비밀번호, `tour_db` 자리에 DB 이름.
- `PORT` — 선택. 없으면 자동으로 4000.

### 4. Prisma 마이그레이션 + 클라이언트 생성

```bash
npx prisma migrate dev
npx prisma generate
```

`migrate dev`가 DB에 `Recommendation` 테이블을 만들고, `generate`가 Prisma 클라이언트를 생성합니다. (DB 연결이 돼야 성공하므로 PostgreSQL이 켜져 있어야 합니다.)

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
  "outOfScope": false,
  "text": "대화체 설명",
  "recommendations": [{ "sportId": "walk", "islandName": "영흥도" }],
  "course": { "title": "...", "steps": [{ "time": "10:00", "activity": "...", "desc": "..." }] },
  "tips": ["..."],
  "followups": ["..."]
}
```
- 레저와 무관한 질문이면 `outOfScope: true`로 안내만 반환합니다.
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

---

## DB 모델 (`Recommendation`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Int | PK, 자동 증가 |
| `question` | String | 사용자 질문 |
| `response` | Json | AI 응답 전체 |
| `createdAt` | DateTime | 저장 시각 |

DB 내용을 눈으로 보려면:
```bash
npx prisma studio
```

---

## CORS

프론트 주소 `http://localhost:5173`, `http://localhost:5174`를 허용합니다. 프론트가 다른 포트로 뜨면 `src/index.ts`의 `cors` 설정에 추가해야 합니다.

---

## 트러블슈팅 (실제로 자주 막히는 지점)

**`psql` 명령을 못 찾음 (Windows)**
PostgreSQL 설치했는데 `psql`이 인식 안 되면 PATH 문제입니다. `C:\Program Files\PostgreSQL\<버전>\bin`을 시스템 환경변수 Path에 추가하고 터미널을 새로 여세요.

**`API key not valid` (400)**
`.env`의 `GEMINI_API_KEY`가 잘못됐거나 일부만 복사된 경우. Google AI Studio에서 복사 아이콘으로 키 전체를 다시 복사해 따옴표·공백 없이 붙여넣으세요. `.env` 수정 후 서버 재시작 필수.

**`This model ... is no longer available` (404)**
Gemini 모델 이름이 안 맞을 때. `src/services/gemini.ts`의 모델명을 `gemini-flash-lite-latest` 등 현재 사용 가능한 이름으로. 사용 가능 모델은 https://aistudio.google.com 에서 확인.

**`A driver adapter is required` (Prisma)**
Prisma 7은 `new PrismaClient()`만으로는 연결이 안 됩니다. 이 프로젝트는 이미 `@prisma/adapter-pg`를 쓰도록 돼 있으니, `npm install`이 제대로 됐는지 확인하세요.

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
