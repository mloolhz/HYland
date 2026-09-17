FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY tour_BE/package.json tour_BE/package-lock.json ./
COPY tour_BE/prisma ./prisma
COPY tour_BE/prisma.config.ts ./
COPY tour_BE/tsconfig.json ./

RUN npm ci

COPY tour_BE/src ./src
COPY tour_BE/public ./public
# db:seed:leisure — leisure_sports 145곳 입력
COPY tour_BE/reports/leisure-candidates/seed-input.json ./reports/leisure-candidates/seed-input.json
# prisma/seed.ts — @/* → ../tour_FE/src (tsconfig paths)
COPY tour_FE/src /tour_FE/src

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "start"]
