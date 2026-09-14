#!/usr/bin/env bash
# EC2(Amazon Linux 2023) — Let's Encrypt 최초 발급 (web 컨테이너 잠시 중지, standalone)
#
#   chmod +x deploy/init-letsencrypt.sh
#   CERTBOT_EMAIL=you@example.com ./deploy/init-letsencrypt.sh
#
set -euo pipefail

DOMAIN="${HYLAND_DOMAIN:-icnsumleisurenuri.com}"
EMAIL="${CERTBOT_EMAIL:?CERTBOT_EMAIL 환경 변수를 설정하세요 (예: CERTBOT_EMAIL=me@hyu.ac.kr)}"
COMPOSE_DIR="${COMPOSE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"

cd "$COMPOSE_DIR"

if ! command -v certbot >/dev/null 2>&1; then
  echo "certbot 설치 중..."
  sudo dnf install -y certbot
fi

echo "web 컨테이너 중지 (80 포트를 certbot standalone 이 사용)"
docker compose stop web || true

sudo certbot certonly --standalone \
  --non-interactive --agree-tos --no-eff-email \
  -m "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "web 재빌드·기동 (443 + 인증서 마운트)"
docker compose up -d --build web

echo "완료: https://${DOMAIN} 확인"
echo "갱신: sudo certbot renew --dry-run"
