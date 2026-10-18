# Local container image for the web app. Production on Azure uses the standalone bundle
# built by .github/workflows/deploy-web.yml; this mirrors that bundle so both run the same server.js.

FROM node:22-bookworm-slim AS base
# Prisma's query engine links against OpenSSL.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /repo

# ---- deps: cached until a manifest or the lockfile changes ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ---- build: also the image the migrate service runs, since it has the Prisma CLI ----
FROM deps AS build
COPY . .
RUN pnpm --filter @tm/web exec prisma generate
# Build-time placeholders only; real values come from docker-compose at runtime.
RUN cd apps/web \
  && DATABASE_URL="sqlserver://placeholder;database=build;user=build;password=build" \
     AUTH_SECRET="build-time-placeholder-value-at-least-32-chars" \
     AZURE_STORAGE_ACCOUNT="placeholder" \
     pnpm exec next build
# Next externalizes @prisma/client under .next/node_modules; keep the generated .prisma beside it.
RUN set -e; \
  out=apps/web/.next/standalone/apps/web/.next/node_modules; \
  client=$(realpath apps/web/node_modules/@prisma/client); \
  mkdir -p "$out/@prisma"; \
  rm -rf "$out/@prisma/client" "$out/.prisma"; \
  cp -LR "$client" "$out/@prisma/client"; \
  cp -LR "$(dirname "$(dirname "$client")")/.prisma" "$out/.prisma"

# ---- runtime: only the standalone server ----
FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
