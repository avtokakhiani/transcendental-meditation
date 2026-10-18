# ტრანსცენდენტული მედიტაცია

Georgian-language site: landing page, blog, and books read online page by page, with an admin panel for editors.

Same architecture as `realtor-crm`: pnpm monorepo, Next.js 16 (App Router) + Tailwind v4, Prisma on SQL Server
(Azure SQL in production, Docker locally), Azure Blob Storage for uploaded images (Azurite locally).

```
apps/web                Next.js app
  prisma/               schema, migrations, seed (sample Georgian content)
  src/app/(site)        public pages: /, /blog, /blog/[slug], /books, /books/[slug]
  src/app/(reader)      immersive reader: /books/[slug]/[page]
  src/app/admin         admin panel: /admin/login, posts, books + pages, media
  src/app/api           /api/media/[id] (public images), /api/admin/media (upload)
  src/server            env-agnostic services (no Next imports), auth, db, blob storage
packages/shared         slugify (Georgian → Latin), date/excerpt helpers, zod input schemas
```

## Local development

### Run everything with Docker (including Windows)

Start Docker Desktop using Linux containers, then run from the repository root:

```sh
docker compose up -d --build
```

Open http://localhost:31997. The first start downloads the images, builds the app,
applies database migrations, and seeds five Georgian blog posts, a sample book,
and the admin account. Sign in at http://localhost:31997/admin with username
`admin` and password `ChangeMe_12345` (the local default). Node and pnpm are
provided by the containers; installing them on the host is optional.

```sh
docker compose ps -a            # container status; migrate should exit with code 0
docker compose logs -f web migrate
docker compose stop            # stop, keeping containers and data
docker compose start           # start the existing containers again
```

Database and uploaded files persist in Docker volumes. The startup seed runs on
`docker compose up` and can overwrite sample content; use `stop`/`start` for
routine restarts after editing content. Extra data from another laptop needs a
database and storage export from that laptop; Git includes only the sample seed.

### Run the development server on the host

Requires Node 22+, pnpm 10, Docker Desktop (with Rosetta enabled on Apple Silicon).

On Windows, after installing dependencies and configuring `apps/web/.env`, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

This starts SQL Server and Azurite in Docker, stops the Docker web server to free
port 31997, and runs Next.js locally with automatic updates when source files change.
Open http://localhost:31997. Keep the terminal open; press Ctrl+C to stop Next.js.
Existing database content and media are preserved; the script does not run the seed.

```bash
pnpm install
cp .env.example apps/web/.env     # then set AUTH_SECRET: openssl rand -base64 32
pnpm db:up                        # SQL Server on :1434, Azurite on :10010
pnpm --filter @tm/web prisma:deploy
pnpm db:seed                      # admin user + sample posts and a book
pnpm dev                          # http://localhost:31997
```

Admin panel: http://localhost:31997/admin, user `admin`, password = `SEED_ADMIN_PASSWORD` from `.env`.

Schema changes: edit `apps/web/prisma/schema.prisma`, then `pnpm db:migrate` (creates a migration).

## Content

- Posts and book pages are Markdown. Raw HTML is escaped on render, so editor content cannot inject scripts.
- Images are uploaded from the editor (button, paste or drag-and-drop) and embedded as `/api/media/<id>`.
- A book is a list of numbered pages; pages with a title form the table of contents. The reader remembers
  font size, theme (light / sepia / dark) and the last page read, in the visitor's browser.

## Deploying to Azure

`.github/workflows/deploy-web.yml` builds a standalone bundle, runs `prisma migrate deploy`, and deploys to App Service.

1. Create an Azure SQL Database, a Storage Account, and a Linux Node 22 App Service (startup command: `node apps/web/server.js`).
2. App Service settings: `DATABASE_URL`, `AUTH_SECRET`, `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_CONTAINER=media`,
   `AZURE_STORAGE_CONNECTION_STRING`.
3. GitHub `production` environment secrets: `DATABASE_URL`, `AZURE_WEBAPP_PUBLISH_PROFILE`. Set `APP_NAME` in the workflow.
4. Seed the first admin once against production: `DATABASE_URL=... SEED_ADMIN_PASSWORD=... pnpm db:seed`
   (this also inserts the sample content — delete it in the admin panel afterwards).
