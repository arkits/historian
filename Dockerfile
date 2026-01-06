FROM oven/bun:1-alpine AS base

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS builder
RUN apk add --no-cache libc6-compat build-base
WORKDIR /app

COPY --from=installer /app/node_modules /app/node_modules
COPY . .

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src/index.ts /app/src/index.ts
COPY --from=builder /app/drizzle /app/drizzle

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
