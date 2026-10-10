FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@10.28.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY deployment/nginx/static.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gallery/browser /usr/share/nginx/html
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s --start-period=15s --retries=6 \
  CMD wget -q -O /dev/null http://127.0.0.1:4000/ || exit 1
