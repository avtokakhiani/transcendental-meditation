# ტრანსცენდენტული მედიტაცია

Georgian-language site: landing page, blog, and books read online page by page, with an admin panel for editors.

pnpm monorepo, Next.js 16 (App Router) + Tailwind v4, Prisma on PostgreSQL (Neon in production, Docker
locally), Vercel Blob for uploaded images. Hosted on Vercel.

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

Requires Node 22+, pnpm 10, Docker Desktop.

```bash
pnpm install
cp .env.example apps/web/.env     # then set AUTH_SECRET: openssl rand -base64 32
pnpm db:up                        # Postgres on :5433
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

## Deploying to Vercel

The Vercel project (root directory `apps/web`) has Neon Postgres and a private Vercel Blob store
connected, which set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`. `AUTH_SECRET` is set by hand.

```bash
npx vercel deploy --prod                                   # from the repo root
npx vercel env pull apps/web/.env.production.local --environment production
cd apps/web && npx dotenv -e .env.production.local -- prisma migrate deploy   # after schema changes
```
