# syntax=docker/dockerfile:1

# Ferroscope is a Turborepo with one Next.js app. The image builds the app with
# standalone output enabled, then ships only the traced server and its static
# assets. No build tooling survives into the runtime layer.

FROM oven/bun:1.3.14 AS base
WORKDIR /app

# ---- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/seed/package.json packages/seed/
COPY packages/ui/package.json packages/ui/
COPY packages/sdk/package.json packages/sdk/
COPY packages/config/package.json packages/config/
RUN bun install --frozen-lockfile

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
ENV FERROSCOPE_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN cd apps/web && bun run build

# ---- runtime ----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone traces the monorepo, so server.js lands at apps/web/server.js.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
