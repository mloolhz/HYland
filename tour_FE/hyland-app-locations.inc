# HYland 앱/API location — conf.d/*.conf 자동 include 대상이 아님 (.inc)

root /usr/share/nginx/html;
index index.html;
client_max_body_size 8m;

# 압축 — 없으면 JS(약 900KB)·CSS(약 340KB)가 그대로 내려가 첫 화면이 느렸다.
# API JSON 도 프록시 응답이라 gzip_proxied 로 같이 줄인다.
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_proxied any;
gzip_types text/plain text/css text/javascript application/javascript application/json
           application/manifest+json image/svg+xml font/otf font/ttf application/vnd.ms-fontobject;

# index.html 은 매번 확인 — 새로 배포하면 바뀐 번들 이름을 바로 받아야 한다
location = /index.html {
    add_header Cache-Control "no-cache";
}

location / {
    try_files $uri $uri/ /index.html;
}

# Vite 번들 — 파일 이름에 해시가 붙어 내용이 바뀌면 이름도 바뀐다
location ^~ /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}

location ^~ /fonts/ {
    add_header Cache-Control "public, max-age=2592000";
    try_files $uri =404;
}

location ~ ^/sports/.+\.(jpg|jpeg|png|webp|gif|svg|ico)$ {
    add_header Cache-Control "public, max-age=604800";
    try_files $uri =404;
}

# public 폴더의 이미지(/landing-1.webp, /ai/kayak.jpg 등)
location ~* ^/(ai/)?[^/]+\.(jpg|jpeg|png|webp|gif|svg|ico)$ {
    add_header Cache-Control "public, max-age=604800";
    try_files $uri =404;
}

location ~ ^/(islands|sports|missions|leaderboard|community)(/|$) {
    if ($hyland_spa_nav = 1) {
        rewrite ^ /index.html last;
    }
    proxy_pass http://api:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# API 하위 경로(/reports/count, /auth/login 등)까지 프록시. reports 가 빠지면 신고 API 가 SPA HTML 로 떨어진다.
location ~ ^/(auth|bti|visits|profile|weather|leisure-sports|submissions|notifications|reports|api|health)(/.*|$) {
    proxy_pass http://api:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /uploads/ {
    proxy_pass http://api:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
