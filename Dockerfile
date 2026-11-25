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
# Explicit build inputs in addition to .dockerignore. Never send mutable private
# data, local environment files or historical audit/recovery evidence to a builder.
COPY tsconfig.base.json ./
COPY apps/web/tsconfig.json apps/web/next.config.ts apps/web/postcss.config.mjs apps/web/prisma.config.ts apps/web/build-inputs.mjs apps/web/
COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public
COPY apps/web/content apps/web/content
COPY apps/web/prisma apps/web/prisma
COPY packages/shared/tsconfig.json packages/shared/
COPY packages/shared/src packages/shared/src
COPY scripts/release/prepare-build.mjs scripts/release/prepare-build.mjs
RUN node -e "import('./scripts/release/prepare-build.mjs').then(m => m.seedBuildCanaries('/repo/apps/web'))"
# Git does not preserve an empty public directory, but the runtime COPY needs it.
RUN mkdir -p apps/web/public && pnpm --filter @tm/web exec prisma generate
# Build-time placeholders only; real values come from docker-compose at runtime.
RUN cd apps/web \
  && DATABASE_URL="sqlserver://placeholder;database=build;user=build;password=build" \
     AUTH_SECRET="build-time-placeholder-value-at-least-32-chars" \
     AZURE_STORAGE_ACCOUNT="placeholder" \
     pnpm exec next build --webpack

FROM build AS package
COPY scripts/release/assemble-artifact.mjs scripts/release/verify-artifact.mjs scripts/release/runtime-dependencies.mjs scripts/release/
RUN node scripts/release/assemble-artifact.mjs /repo/apps/web /release \
  && node scripts/release/verify-artifact.mjs --directory /release
COPY scripts/release/verify-native-runtime.mjs scripts/release/verify-native-runtime.mjs
RUN --network=none node scripts/release/verify-native-runtime.mjs /release

# ---- runtime: only the standalone server ----
FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=package --chown=node:node /release ./
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
