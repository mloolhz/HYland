FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY tour_BE/package.json tour_BE/package-lock.json ./
COPY tour_BE/prisma ./prisma
COPY tour_BE/prisma.config.ts ./

RUN npm ci

COPY tour_BE/src ./src
COPY tour_BE/public ./public
# prisma/seed.ts — @/* → ../tour_FE/src (tsconfig paths)
COPY tour_FE/src /tour_FE/src

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "start"]
