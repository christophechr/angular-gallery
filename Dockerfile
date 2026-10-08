FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@10.28.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/gallery ./dist/gallery
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s --start-period=15s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:4000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/gallery/server/server.mjs"]
