# 커뮤니티 특징 태그

기존 상단 필터 → 선택한 섬/활동 → 후기 목록·우측 사이드바 구조를 유지했다.
전체/후기 탭에서 섬 하나를 선택하면 목록 위에 상위 5개 특징이 나타난다.
섬 미선택·복수 선택, 로딩, 오류, 후기 없음, 태그 없는 기존 후기 상태도 구분한다.
기존 커뮤니티 색상 변수, 8px 카드 모서리, pill 스타일과 폰트를 재사용했다.

## 수정·추가 파일

| 파일 (프로젝트 루트 기준) | 변경 내용 |
| --- | --- |
| `tour_FE/src/constants/review-tags.ts` | 25개 태그, 5개 카테고리, 영문 ID 타입, 표시·정규화·1~5개 검증 함수. FE/BE가 같은 정의를 사용한다. |
| `tour_FE/src/types/community.ts` | 기존 Post에 선택적 `tags: ReviewTagId[]` 추가. |
| `tour_FE/src/lib/review-tags.ts` | 섬 전체 후기 기준 집계와 상위 5개 계산. |
| `tour_FE/src/components/community/ReviewTagSummary.tsx` | 특징 요약, 비율, 활성 필터·해제, 빈 상태. |
| `tour_FE/src/components/community/ReviewTags.tsx` | 보조 chip과 카테고리별 선택기. 44px 터치 영역, 선택 개수, 최대 선택 안내. |
| `tour_FE/src/pages/Community.tsx` | 목록 직전 요약 배치, URL 태그 필터, 페이지 초기화·범위 보정. |
| `tour_FE/src/lib/posts.ts` | 기존 검색·섬·활동·유형 필터에 특징 조건 추가. |
| `tour_FE/src/components/community/PostRow.tsx` | 후기 제목 아래 보조 chip 표시. |
| `tour_FE/src/pages/PostDetail.tsx` | 본문 아래 chip과 이전·다음 후기 탐색에 태그 조건 반영. |
| `tour_FE/src/components/community/Lightbox.tsx` | 갤러리 상세 본문 아래 후기 chip 표시. |
| `tour_FE/src/pages/WritePost.tsx` | 후기 유형에 선택기 추가, 등록 전 검증, 태그 ID 전송. |
| `tour_FE/src/api/community/index.ts` | 생성 요청 타입 확장, API 응답 태그 정규화. |
| `tour_FE/src/lib/post-store.ts` | API의 페이지당 50개 제한을 고려해 전체 페이지 수집. |
| `tour_FE/src/styles/community.css` | 요약·chip·선택기 스타일과 접근성·줄바꿈 처리. |
| `tour_BE/src/community.ts` | 후기 생성 시 태그 검증·저장, 목록·상세·내 글·좋아요 목록 응답에 포함. |
| `tour_BE/prisma/schema.prisma` | Post에 nullable JSON `tags` 컬럼 추가. |
| `tour_BE/prisma/migrations/20260908000000_add_review_tags/migration.sql` | 기존 후기 내용을 보존하는 컬럼 추가 마이그레이션. |
| `tour_BE/prisma/seed-demo-posts.ts` | 기존 데모 후기에 내용과 맞는 태그 추가. 기존 미선택 후기 사례도 유지. |
| `tour_FE/scripts/test-review-tags.mjs` | 태그 검증·비율·중복 제거·필터 조합 회귀 테스트. |
| `tour_FE/REVIEW_TAGS.md` | 구현·연결·검증 안내. |

## 필터와 비율

- 분모: 선택한 섬의 전체 `review` 수. 공지는 제외하고, 태그 없는 기존 후기는 포함한다.
- 분자: 해당 ID를 선택한 후기 수. 후기 하나에 중복 ID가 있어도 한 번만 센다.
- 비율: `Math.round(분자 / 분모 * 100)`. 여러 태그를 선택하므로 합계는 100%를 넘을 수 있다.
- 선택 수 내림차순으로 5개를 표시한다. 동률이면 상수 정의 순서로 표시한다.
- `?tag=beautiful_sunset&tag=quiet`처럼 여러 특징을 URL에 저장한다. 선택한 특징을 모두 포함한 후기를 표시한다. 재클릭·개별 해제로 하나씩 해제하거나 전체 해제할 수 있다. 기존 단일 태그 URL도 지원한다.
- 태그와 기존 조건은 AND로 적용하고 정렬·페이지 분할은 이후 수행한다. 검색이나 태그 필터는 집계 분모에 영향을 주지 않는다.
- 섬 변경 또는 인증샷/Q&A 전환 시 태그를 해제한다. 상세 화면에서 목록 복귀·이전/다음 탐색에도 조건을 유지한다.

## 백엔드 연결 및 적용

이미 실제 API를 사용하는 프로젝트이므로 POST `/community/posts`의 `tags` 검증·저장과 GET 응답까지 연결했다.
실제 DB 적용 전 `tour_BE`에서 대상 `DATABASE_URL`을 설정하고 `npx prisma migrate deploy`, `npm run db:generate`를 실행해야 한다.
이 작업 환경에는 DB 설정이 없어 마이그레이션과 DB 저장 검증은 실행하지 않았다.
새 후기는 태그 1~5개가 필수다. 이전 버전 클라이언트는 태그 없이 후기를 생성할 수 없으므로 FE/BE를 함께 배포해야 한다.

현재는 기존 클라이언트 필터 구조를 유지하기 위해 전체 페이지를 수집한다.
데이터가 커지면 서버에 섬별 `totalReviews`, 태그별 `reviewCount` 집계 API와 태그 필터·페이지네이션을 추가하고,
`post-store.ts`의 전체 수집 및 `ReviewTagSummary.tsx`의 로컬 집계를 그 API 응답으로 교체하면 된다.
AI 추천에는 사용자가 직접 선택한 `tags`를 입력으로 활용할 수 있으며, 자동 본문 분석·감성 데이터와 별도로 저장한다.
태그 상수는 기존 서버의 FE 데이터 참조 방식과 동일하게 공유하므로 배포에 두 디렉터리가 필요하다.

## 검증

- FE: `npm run build`
- 집계·필터 회귀: Node 24에서 `node --test scripts/test-review-tags.mjs` (4개 테스트, 다중 선택·해제·URL 호환 포함)
- BE: `npx tsc --noEmit`, `npx prisma validate`
- 브라우저: 임시 메모리 API로 후기 60개 전체 집계, 필터·검색 조합, 모바일 390px, 최소 선택 차단, 5개 제한·해제·교체, 생성 요청과 상세 표시 확인.
- 임시 API는 실제 DB에 연결하지 않는다. 데모 시드 실행은 기존 데모 글을 삭제 후 생성하므로 자동 실행하지 않았다.
