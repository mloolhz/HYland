/**
 * 데모 계정 시드 (users, user_profiles)
 *
 * 지금까지 계정은 각자 로컬 DB 에서 직접 회원가입해야만 생겼다. 그래서 코드를
 * 받아도 시연에 쓸 계정이 없고, 관리자 권한이 필요한 검수 화면은 아예 열지도
 * 못했다. 세 계정을 시드로 박아 `npm run db:seed:accounts` 한 번이면
 * 같은 상태에서 시작할 수 있게 한다.
 *
 * 재실행 안전(upsert). 이미 있는 계정이면 비밀번호·권한만 맞추고 글·배지·방문
 * 기록은 건드리지 않는다. 레벨은 방문한 섬 수로 읽을 때 계산하므로(src/level.ts)
 * 여기서 따로 넣지 않는다.
 *
 * ⚠ 데모용이라 비밀번호가 코드에 그대로 있다. 실제 서비스로 올릴 때는 이 파일과
 *   package.json 의 db:seed:accounts 를 반드시 지워야 한다.
 */
import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma";

type DemoAccount = {
  username: string;
  password: string;
  nickname: string;
  role: "USER" | "ADMIN";
  note: string;
};

const ACCOUNTS: DemoAccount[] = [
  {
    username: "demo-jichan",
    password: "Demo1234!",
    nickname: "지찬데모",
    role: "ADMIN",
    note: "인증샷 검수·커뮤니티 정리 권한",
  },
  {
    username: "ipado",
    password: "Ipado1234!",
    nickname: "이파도",
    role: "USER",
    note: "일반 사용자",
  },
  {
    username: "deungdae",
    password: "Deungdae1234!",
    nickname: "박등대",
    role: "USER",
    note: "일반 사용자 (댓글·좋아요 상대역)",
  },
];

async function main() {
  for (const acc of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acc.password, 10);

    const user = await prisma.user.upsert({
      where: { username: acc.username },
      // 이미 있으면 로그인에 필요한 것만 맞춘다 (활동 기록은 그대로)
      update: { passwordHash, role: acc.role },
      create: { username: acc.username, passwordHash, role: acc.role },
    });

    // 닉네임이 이미 있으면 유지 — 본인이 바꿔 둔 것을 되돌리지 않는다
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, nickname: acc.nickname },
    });

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    console.log(`  ${acc.username} / ${acc.password}  (${acc.nickname}, ${acc.role}) — ${acc.note}`);
  }
}

main()
  .then(() => console.log(`\n데모 계정 ${ACCOUNTS.length}개 준비 완료.`))
  .catch((err) => {
    console.error("데모 계정 시드 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
