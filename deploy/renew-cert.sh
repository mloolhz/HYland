#!/usr/bin/env bash
# certbot 갱신 (최초 발급이 standalone 이면 갱신도 잠깐 web 중지). cron: 0 4 * * * ~/HYland/deploy/renew-cert.sh
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"

cd "$COMPOSE_DIR"

sudo certbot renew --quiet \
  --pre-hook "docker compose -f ${COMPOSE_DIR}/docker-compose.yml stop web" \
  --post-hook "docker compose -f ${COMPOSE_DIR}/docker-compose.yml up -d web"
