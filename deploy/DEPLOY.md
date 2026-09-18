# EC2 Docker 배포 (HYland)

프로젝트 루트(`docker-compose.yml` 있는 디렉터리, 예: `~/HYland`)에서 실행합니다.

## 코드 반영 후

```bash
git pull origin main
docker compose up -d --build api web
docker compose exec api npx prisma migrate deploy
```

## 레저 시설 연락처·홈페이지·사진

API는 DB의 `leisure_sports`를 사용합니다. **이미지 빌드만으로는 연락처가 갱신되지 않습니다.**  
`prisma/seed-data/leisure-seed-input.json` 변경을 배포 DB에 넣으려면 아래를 **배포 후 한 번** 실행하세요.

```bash
docker compose exec -T api npm run db:seed:leisure
```

- `-T`: SSH/CI에서 TTY 없이 실행할 때 사용 (로컬 셸에서는 `-T` 없이 `docker compose exec api npm run db:seed:leisure` 도 됨).
- 시드는 `leisure_sports` / `leisure_sport_sources` 등 레저 시설 테이블만 다시 채웁니다. 회원·커뮤니티 글 등 유저 데이터는 건드리지 않습니다.
- `build-seed-input.mjs` 출력을 `leisure-seed-input.json`에 **그대로 덮어쓰지 마세요** — 연락처·홈페이지가 비어 있는 상태로 덮이면 화면에 전화/홈페이지가 안 보입니다. (팀에서 enrich·병합한 JSON을 커밋해 두었습니다.)

## 확인

```bash
curl -sS https://icnsumleisurenuri.com/health
```
