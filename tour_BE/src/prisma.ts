import { PrismaClient } from "@prisma/client";

/** 앱 전체에서 재사용하는 Prisma 클라이언트 (DB 연결 도구) */
export const prisma = new PrismaClient();
