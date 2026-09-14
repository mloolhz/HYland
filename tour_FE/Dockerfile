FROM node:20-bookworm-slim AS build

WORKDIR /app

ARG VITE_API_BASE=
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY hyland-app-locations.inc /etc/nginx/hyland-app-locations.inc
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
