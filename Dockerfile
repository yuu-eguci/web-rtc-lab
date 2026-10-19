# lint とテスト用。 docker compose run --rm check で使う。
FROM node:24-bookworm-slim AS check
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npx playwright install --with-deps chromium
COPY . .
CMD ["sh", "-c", "npm run lint && npm test && npm run test:e2e"]

# ページを配信する。 docker compose up web で使う。
FROM nginx:1.30-alpine AS web
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
