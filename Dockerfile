# lint、型チェック、テスト用です。 docker compose run --rm --build check で使います。
FROM node:24-bookworm-slim AS check
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npx playwright install --with-deps chromium
COPY . .
CMD ["sh", "-c", "npm run typecheck && npm run lint && npm test && npm run test:e2e"]

# ページを配信します。 docker compose up --build web で使います。
FROM nginx:1.30-alpine AS web
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
