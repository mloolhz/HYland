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
