# HYland 앱/API location — conf.d/*.conf 자동 include 대상이 아님 (.inc)

root /usr/share/nginx/html;
index index.html;
client_max_body_size 8m;

location / {
    try_files $uri $uri/ /index.html;
}

location ~ ^/sports/.+\.(jpg|jpeg|png|webp|gif|svg|ico)$ {
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

# leisure-sports 뒤에 (/|$) 없으면 /leisure-sports-hero.png 같은 정적 파일이 API 로 프록시됨
location ~ ^/(auth|bti|visits|profile|weather|leisure-sports|submissions|notifications|api|health)(/|$) {
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
