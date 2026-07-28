# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S chnnl && adduser -S chnnl -G chnnl
COPY --from=builder /app/public ./public
COPY --from=builder --chown=chnnl:chnnl /app/.next/standalone ./
COPY --from=builder --chown=chnnl:chnnl /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER chnnl
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
