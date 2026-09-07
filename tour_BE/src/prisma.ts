import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * mariadb 드라이버의 문자열 생성자는 "mariadb://" 스킴을 요구해서 관례적인
 * "mysql://" DATABASE_URL과 맞지 않는다. URL을 직접 파싱해 객체로 넘긴다.
 */
function parseMysqlConnectionOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    /**
     * MySQL 8의 기본 인증(caching_sha2_password)은 서버가 재시작돼 인증 캐시가
     * 비면 클라이언트가 RSA 공개키를 받아 비밀번호를 암호화해야 한다. 이 옵션이
     * 없으면 그때부터 ER_CANNOT_RETRIEVE_RSA_KEY 로 연결이 막힌다.
     * (평문 채널로 공개키를 받으므로 로컬 개발용. 원격 DB라면 TLS를 쓸 것)
     */
    allowPublicKeyRetrieval: true,
  };
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL이 .env에 없습니다.");
}

// Prisma 7은 driver adapter 없이는 연결되지 않는다.
const adapter = new PrismaMariaDb(parseMysqlConnectionOptions(databaseUrl));

/** 앱 전체에서 재사용하는 Prisma 클라이언트 (DB 연결 도구) */
export const prisma = new PrismaClient({ adapter });
