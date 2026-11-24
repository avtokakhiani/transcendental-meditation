# Unified articles: compatibility baseline and additive foundation

Implemented locally on 24 November 2026. This document covers phases 1–2 only.
The subsequent admin/revision workflow and current compatibility boundary are
documented in [Phase 3](article-phase3.md).
Public delivery, the editor, server actions, existing content, components, CSS,
navigation, books, meetings, privacy and OAuth implementations remain in place.

**Website-wide visual and functional preservation is a release gate for every
subsequent phase.** A new article renderer must not standardize existing pages.
Report shared-component risks before changing a component used outside articles.

## Baseline and evidence

Baseline source commit: `97d7f9fdaafec82d44b6cdcb9f46783e42a4cf5b`.
The initial working tree was clean. Artifacts are local and ignored:

`apps/web/private/article-foundation/2026-11-24/`

| Artifact | Contents |
| --- | --- |
| `inventory.json` | 28 public URLs; catalog metadata and card overrides; SHA-256 hashes of all 310 original source/asset files |
| `before/*.json`, `after/*.json` | Page titles, actual canonical tags (including absence), meta tags, headings, text, links, media URLs, image dimensions/crops/positions, SVG geometry and overflow |
| `before/*.png`, `after/*.png` | Full-page baselines at 1440, 768 and 390 pixels; 84 page captures and 15 shared interaction-state captures per side |
| `visual-verification.json` | Final raster comparison plus exact content/metadata/geometry/source checks |
| `backup.json` | Native/decrypted and encrypted checksums, source database, restore target, verification methods, 30-day review date |
| `database.bak.enc` | Pre-migration native SQL Server backup, encrypted with the existing private backup key |
| `database-before.json.enc` | Encrypted exact original records for every database table |
| `rehearsal-passed.json`, `database-verification.json` | Isolated migration/constraint/service checks and local record preservation |
| `schema-check.json`, `admin-smoke.json`, `lint.json` | Schema comparison, existing admin read checks and full lint findings |

All public route files were enumerated. Dynamic routes were expanded from the
published database posts/books/pages and the existing scientific article catalog.
The seven book-reader URLs are included individually. All six “რატომ TM?” pages
are covered: stress/anxiety, health, brain function, relationships, peace, benefits.
There is no standalone Ayurveda route in this checkout; existing Ayurveda-related
content/assets are preserved within the captured pages and source inventory.
No new routes were invented to fill that gap.

Shared interaction captures cover navigation, registration panel, Terms modal,
Privacy modal and expanded FAQ at each viewport. Browser tests block external
services; the About page's Google Maps implementation is unchanged, but this is
not a verification of Google's external map rendering or service availability.

The original comparison reports are retained, including exact-pixel failures.
Chromium produced low-amplitude photo/gradient raster variation and a few isolated
full-page raster artifacts across browser sessions. The final gate uses a 10/255
per-channel tolerance and at most 50 pixels above it per screenshot, **together
with exact DOM/content/metadata/image/SVG geometry and source/asset comparisons**.
The expanded FAQ capture matches the original pointer states (desktop unhovered,
tablet/mobile hovered). No application CSS is injected to make differences pass;
only the Next.js development indicator is hidden from screenshots. Original
baselines are never regenerated to accept an implementation change.

Initial database inventory: one published post (the TM introduction), one
published book with seven published pages, one staff user, 21 privacy audit rows,
and no media records, meetings, registrations, enquiries or erasures.
The three scientific articles are still code-managed and were not imported.

## Additive schema

Migration: `apps/web/prisma/migrations/20261124000000_article_foundation/migration.sql`.

| Model | Foundation fields and constraints |
| --- | --- |
| `Post` | Existing columns unchanged; `kind` (`article`/`evergreen`), `version`, optional draft/published revision IDs and companion owner IDs |
| `PostRevision` | Immutable numbered snapshot; source fingerprint/timestamp; title/display heading/card title; article/card excerpts; editorial byline/category; cover/alt/social image; SEO fields; layout key; legacy body or versioned JSON document; presentation data; optional derived text/reading time; creator/time |
| `PostSlugAlias` | Unique old slug, owning post, creation timestamp; no aliases created or consumed yet |
| `PostRevisionMedia` | Composite revision/media key; referenced media deletion restricted; associations cascade with revision deletion |

Revision pointers use composite foreign keys to `(postId, id)` plus owner checks.
Separate companion owner columns avoid a Prisma SQL Server issue where putting
the primary key itself into an optional composite relation suppresses generated
UUIDs on ordinary legacy `Post.create` calls. A revision cannot belong to another
post, and partially populated pointers are rejected.

Post-to-revision/alias deletion cascades preserve the current admin delete
behavior. Revision-to-media associations cascade; the underlying uploaded media
is retained. Other foreign-key paths use `NO ACTION` to avoid SQL Server multiple
cascade paths. A database trigger rejects revision updates: append a new snapshot.
Deleting an article still deletes its snapshots, as the existing delete action
requires; this phase does not introduce archival or soft deletion.

Documents and presentation data use `NVARCHAR(MAX)`, not Prisma `Json`. SQL checks
enforce valid JSON, supported body format/version pairing, positive revision and
reading-time values, nonnegative concurrency versions, and content kinds.
Application contracts validate the internal document version and content shape.
There is one authoritative body per snapshot: legacy Markdown/HTML, or a structured
document with an empty legacy body. Existing global `ContentFormat` and book
contracts were not changed.

## Backfill and compatibility boundary

The existing post was snapshotted once and classified `evergreen`. Both revision
pointers reference its snapshot because it is published. The operation was run
repeatedly to verify idempotency. Its ID, slug, title, excerpt, cover, body, format,
author, status, publication date, creation date and `updatedAt` are unchanged.
The concurrency version remains zero.

`sourceHash` identifies the full legacy row state. The backfill uses a transaction
and raw SQL for foundation-only pointer/classification updates, deliberately
avoiding Prisma's automatic modification of legacy `updatedAt`.

The introduction snapshot records its existing SEO description, visible heading,
layout key `tm-introduction-v1`, image/layout evidence and rendered-text hash.
Its stored HTML remains byte-for-byte legacy source; it is **not** represented as
the six visible React-authored sections. `customBodyStillInCode: true` records that
distinction. No live renderer reads this snapshot yet.

Normal future snapshots can preserve independent editorial bylines, full titles,
visible headings, short card copy, excerpts and SEO fields. The scientific
articles' current values remain in the baseline manifest and existing code;
they have not been copied into SQL in this phase.

Legacy readers and admin writers remain authoritative. Saving through the old
admin does not automatically append revisions or increment the new concurrency
version. These snapshots must be reconciled against `sourceHash`/`sourceUpdatedAt`
before any future consumer cutover. Do not assume pointers stay current during
this compatibility period. Alias/canonical slug namespace checks and redirect
resolution also belong to the future transactional writer; there are no aliases
to collide with current admin behavior today.

## Document and registry contracts

New, currently unconsumed modules live in `apps/web/src/lib/articles/`:

- `document.ts`: version 1 prose, figure, research, citation and component blocks;
  unique IDs, resolved citations, safe links, static/media asset references and
  document size/depth/node limits.
- `component-registry.ts`: explicit component ID/version allowlist, strict
  component-specific props schemas, editor labels and accessibility contracts.
  The real registry is intentionally empty. Tests use a synthetic definition
  without adding application content or a rendered component.
- `revision-contract.ts`: mutually exclusive legacy/structured bodies and alias
  input validation, isolated from shared book/editor contracts.

Stored component references contain IDs, versions and JSON props, never module
paths, JSX, JavaScript, callbacks or raw SVG. A future renderer must map the IDs
to explicit reviewed imports. An editor node view alone is not a public renderer.
Registry code is trusted application code, not a sandbox; new implementations
still require review, deployment, accessibility fallbacks and compatibility tests.

Static SVG graphs remain developer-owned assets. General SVG upload is not
enabled. Figure captions and source references are structured data. Legacy prose
inside a document remains inert data and must pass through the current sanitized
HTML/Markdown rendering boundary at future cutover; document validation alone
does not sanitize arbitrary HTML.

## Backup verification and rollback

The native backup was created using `COPY_ONLY, CHECKSUM`, passed `RESTORE
VERIFYONLY WITH CHECKSUM`, and was restored into the separate local database
`article_foundation_restore_1795511296637`. `DBCC CHECKDB` and an exact comparison
of every original table/record passed before migration. The encrypted copy was
then decrypted, restored again, migrated and exercised successfully.
The disposable rehearsal database was removed after verification; the encrypted
backup and verification evidence remain. It can be recreated with
`node scripts/article-foundation/migrate.mjs rehearsal --reset-rehearsal`.

Native/decrypted backup SHA-256:

`404ab3eee9a206deded0720e178f886f68cde067c1060b8e33dc12dca600a878`

Encryption uses AES-256-GCM and the existing `PRIVACY_BACKUP_KEY` from the ignored
`apps/web/.env`, with the existing `LTMB1` envelope. No key or credential is stored
in documentation, scripts or commits. Plaintext backup and record-export staging
copies were removed from the host and container after verification. Retain the
key separately from the encrypted backup. Review/remove these one-off artifacts
by 24 December 2026, consistent with the current 30-day backup window; these
task-specific artifacts are not automatically covered by the daily backup pruner.

Preferred rollback for this phase:

1. Stop phase work and keep the existing public/admin readers active. No consumer
   cutover happened, so leaving the additive schema in place is safe.
2. If reverting application source, revert only the reviewed foundation diff and
   regenerate Prisma with Next.js briefly stopped. Restart via `start-dev.ps1`.
   Do not reset unrelated work or restore the database merely to remove unused
   columns/tables.
3. If a database restore is actually needed, decrypt the verified backup into a
   temporary private staging file and restore it into a **separate local target**.
   Run `RESTORE VERIFYONLY`, `DBCC CHECKDB`, original-record comparisons and
   migration-status checks before selecting it in the ignored local `.env`.
4. Reconcile any changes made since the backup before switching. Replay the
   independent privacy erasure ledger and retention checks before serving a
   restored database. Never overwrite the active database or discard newer data
   as an automatic rollback step.
5. Restart the host development server and rerun the complete public baseline,
   admin, book protection and unrelated subsystem checks. Remove plaintext
   staging files in a `finally` cleanup.

The rehearsal reset helper refuses the website database and validates the exact
`article_foundation_restore_<timestamp>` target. `--reset-rehearsal` is destructive
only to that disposable restore, not the application database. No down migration
or live restore is run automatically.

## Commands

Run from `apps/web`. `FOUNDATION_RUN` can select a new evidence directory; its
default is the frozen `2026-11-24` run. Backup and original-baseline commands
refuse to overwrite their original manifests. All helpers reject remote database
connections and require the local Docker SQL Server port.

```powershell
# A new run, before implementation/migration:
$env:FOUNDATION_RUN = 'choose-a-new-run-name'
node scripts/article-foundation/backup.mjs
pnpm.cmd exec tsx scripts/article-foundation/capture.mjs before

# Rehearse migration and idempotent backfill on the isolated restored database:
node scripts/article-foundation/migrate.mjs rehearsal
pnpm.cmd exec tsx scripts/article-foundation/verify.mjs --rehearsal

# Local migration refuses to proceed without baseline + successful rehearsal:
node scripts/article-foundation/migrate.mjs local
pnpm.cmd exec tsx scripts/article-foundation/verify.mjs

# Restart using the root start-dev.ps1, then collect and compare:
pnpm.cmd exec tsx scripts/article-foundation/capture.mjs after
node scripts/article-foundation/compare.mjs
node scripts/article-foundation/check-schema.mjs
```

The frozen backfill intentionally requires the existing introduction's baseline
file. It does not guess its approved custom metadata or migrate code articles.
Constraint/service fixtures run only on the isolated restore and roll back.
Meeting/privacy storage tests create and remove their own local test databases.
Admin smoke testing uses the existing account without logging in or saving a
post. Reading `/admin/privacy` legitimately appends its existing access-audit
record; verification explicitly accounts for that record while preserving every
original audit record.

## Validation and remaining limits

- Prisma schema validation and migration status pass. Fresh-database migrations
  are also exercised by the meeting/privacy integration suites.
- Foundation schema diff is clear. The pre-existing privacy retention default
  introspects with SQL Server's normalized spelling; `check-schema.mjs` records
  that difference rather than changing an unrelated privacy table.
- TypeScript passes. New files pass lint. Full-repository lint has 139 pre-existing
  errors across six unchanged test files; the detailed report is private.
- Structured-content/registry tests, existing shared tests and OAuth/recommendation
  unit tests pass. Existing reader protection, legal modal, related-article,
  corporate-page and meeting-panel browser checks pass. The meeting-panel test
  had one transient hydration-timing timeout under concurrent browser load and
  passed unchanged on repeat.
- Existing admin pages/form values and Tiptap hydration pass read-only checks.
  Legacy post service create/draft/publish/edit/unpublish/republish/delete and
  publication-date preservation pass on the isolated restore. Referenced media
  cannot be deleted; post deletion retains media and removes only its revisions,
  aliases and association rows.
- No external authorization, Calendar request, real enquiry/registration or
  email delivery was performed. These checks do not certify external services.
- Local data is not a production inventory. Production rollout requires its own
  backup, collision inventory, migration rehearsal and website-wide baseline.

Next proposed phase: extend admin authoring/preview and implement the structured
document renderer behind the compatibility boundary. Before switching consumers,
reconcile legacy edits and migrate custom article bodies/layout data under
separate review. Neither that phase nor the scientific article migration is
authorized by this implementation step.
