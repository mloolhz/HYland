FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY src ./src
COPY public ./public

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "start"]
