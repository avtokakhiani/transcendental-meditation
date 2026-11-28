# ტრანსცენდენტული მედიტაცია

Georgian-language site: landing page, blog, and books read online page by page, with an admin panel for editors.

pnpm monorepo, Next.js 16 (App Router) + Tailwind v4, Prisma on PostgreSQL (Neon in production, Docker
locally), Vercel Blob for uploaded images. Hosted on Vercel.

```
apps/web                Next.js app
  prisma/               schema, migrations, create-only administrator bootstrap
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
and applies database migrations. Startup never seeds accounts or editorial content.
On an empty database, explicitly create the initial administrator using a password
supplied through your environment (do not put the password in the command):

```sh
docker compose run --rm -e SEED_ADMIN_PASSWORD migrate pnpm exec prisma db seed
```

Sign in with username `admin` and your chosen password. An existing `admin` account
is left completely unchanged. Node and pnpm are provided by the containers;
installing them on the host is optional for this Docker workflow.

```sh
docker compose ps -a            # container status; migrate should exit with code 0
docker compose logs -f web migrate
docker compose stop            # stop, keeping containers and data
docker compose start           # start the existing containers again
```

Database and uploaded files persist in Docker volumes. Docker startup and schema
migrations do not populate or overwrite editorial content. Extra data from another
laptop needs a database and storage export from that laptop; Git does not contain
the database's published posts or books. A database reset requires restoring real
content from backup; running the seed cannot restore it.

### Run the development server on the host

Requires Node 22+, pnpm 10, Docker Desktop.

On Windows, after installing dependencies and configuring `apps/web/.env`, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

This starts Postgres in Docker, stops the Docker web server to free
port 31997, and runs Next.js locally with automatic updates when source files change.
Open http://localhost:31997. Keep the terminal open; press Ctrl+C to stop Next.js.
Existing database content and media are preserved; the script does not run the seed.

```bash
pnpm install
cp .env.example apps/web/.env     # then set AUTH_SECRET: openssl rand -base64 32
pnpm db:up                        # Postgres on :5433
pnpm --filter @tm/web prisma:deploy
pnpm db:seed                      # explicit initial admin creation only; existing accounts/content unchanged
pnpm dev                          # http://localhost:31997
```

Admin panel: http://localhost:31997/admin, user `admin`, password = `SEED_ADMIN_PASSWORD` from `.env`.

The seed never creates posts, books, or book pages and never updates existing records.
The introductory TM page still requires its published database post, so restore that
record from a trusted backup when initializing a replacement database. Keep exports
under the ignored `apps/web/private/backups/` directory, outside public assets.
Run `pnpm --filter @tm/web test:seed` to check migrations, empty-database bootstrap,
and repeated seed execution against a separate temporary SQL database.

Schema changes: edit `apps/web/prisma/schema.prisma`, then `pnpm db:migrate` (creates a migration).

## Content

- Posts and book pages are Markdown. Raw HTML is escaped on render, so editor content cannot inject scripts.
- Images are uploaded from the editor (button, paste or drag-and-drop) and embedded as `/api/media/<id>`.
- A book is a list of numbered pages; pages with a title form the table of contents. The reader remembers
  font size, theme (light / sepia / dark) and the last page read, in the visitor's browser.

## Introductory meetings

Manage real meeting schedules and private registrations at `/admin/meetings` after signing in.
Enter dates in Tbilisi time; the database stores UTC instants. Meetings start as private drafts.
Set a format, an in-person location when applicable, an optional capacity and registration deadline,
then choose the open status to publish. Close registration without deleting participant records.
No meeting dates are seeded. An empty schedule displays a Georgian empty state.

Public introductory-meeting links open one shared panel. On `/organizaciebitvis`, existing links
and the corporate inquiry form retain their behavior. `/introductory-meeting` remains a working
standalone version of the same registration interface, including without link interception.

Registration is stored in the database before email delivery. Configure `RESEND_API_KEY`,
`MEETINGS_FROM_EMAIL` (or the existing `CORPORATE_FROM_EMAIL`) and `ADMIN_EMAIL` in local ignored
environment settings or hosting configuration. Use a sender verified with Resend. Never commit
credentials. With email unavailable, registrations still succeed; staff can see pending delivery
and retry unsent messages from the meeting's participant list. Delivery markers and Resend
idempotency keys protect retries; Resend's idempotency window applies. Participant instructions
and online joining links are private and included only in confirmation email.

Apply migrations with `pnpm --filter @tm/web prisma:deploy` and regenerate Prisma before restarting
the host development server after a schema change. No database seed is required.
Run `pnpm --filter @tm/web test:meetings` with the local website running. Storage tests create and
remove a separate temporary SQL database (requiring local database-creation privileges); browser
tests use intercepted fixtures and do not publish schedules, save registrations, or send email.

## Deploying to Vercel

The Vercel project (root directory `apps/web`) has Neon Postgres and a private Vercel Blob store
connected, which set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`. `AUTH_SECRET` is set by hand.

```bash
npx vercel deploy --prod                                   # from the repo root
npx vercel env pull apps/web/.env.production.local --environment production
cd apps/web && npx dotenv -e .env.production.local -- prisma migrate deploy   # after schema changes
```
