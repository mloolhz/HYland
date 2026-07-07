# HYland · ISLAND QUEST (Frontend)

인천 섬 레저스포츠 활성화 가이드 플랫폼 — FE

## 실행 방법

```bash
npm install
npm run dev
```

`npm run dev` 실행 시 **브라우저가 자동으로 열리고** 랜딩 페이지가 표시됩니다.  
(기본 주소: http://localhost:5173)

## 기술 스택

- **Vite** + **React** + **TypeScript**

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 (브라우저 자동 열림) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |

## 프로젝트 구조

```
tour_FE/
├── index.html               # Vite HTML 진입점
├── vite.config.ts
├── public/passport.png
└── src/
    ├── main.tsx             # 앱 진입점
    ├── index.css            # 랜딩 페이지 스타일
    ├── components/landing/  # 섹션별 React 컴포넌트
    └── lib/landing-data.ts  # mock 데이터
```
