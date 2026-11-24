# Article management, Phase 3

Implemented locally on 24 November 2026. This phase enables admin authoring,
immutable revisions and authenticated preview. It does not migrate the three
scientific articles or the TM introduction, change public consumers, or redesign
any existing public page. The Phase 1–2 schema is reused without another migration.

## Authoring workflow

Use `/admin/posts/new` or select an article in `/admin/posts`.
The existing admin layout, title/slug control, cover uploader, Tiptap toolbars and
media storage are reused. The article form adds:

- Full title, optional display heading and card title, article/card excerpts.
- Editorial byline, category, cover/alt text, center/top/bottom crop presets.
- SEO title/description and approved standard/classic layout presets.
- Ordered rich-text, image, research, registered-visual and citation sections.
- Source bibliography with source links and stable references.
- Save draft, saved preview, publish, unpublish, revision history and restore.

No author enters HTML, JSON, JSX or JavaScript. Structured serialization is an
internal hidden form value. Prose sections reuse Tiptap's headings, formatting,
lists, tables, links, images and panels. Article-only image figures provide
alignment, width, caption, attribution, source URL and bibliography associations.
Research sections combine Tiptap explanation with a graph on either side.
Images can be uploaded or selected from existing media. Source removal also
removes its citation/reference associations to avoid dangling references.

Existing HTML and Markdown stay in their legacy format until an editor explicitly
enables structured sections. Opening an article does not rewrite its body.
The existing TM introduction's body/layout remain read-only and its public
publish/unpublish/delete/restore operations are blocked in this phase. Metadata
drafts are supported; its preview reuses the original six React components.

The shared `RichTextEditor` gained only optional `onChange` and `submitContent`
props. Books keep the original defaults, hidden fields and HTML/Markdown formats.
Article sections suppress duplicate hidden prose payloads because their document
already contains the prose. No book editor, reader, global CSS or public article
component was modified.

## Revisions and compatibility

`src/server/services/article-revisions.ts` is the article mutation boundary.
Every action authenticates the active staff member before calling it. A mutation
locks its article row, compares the expected version and legacy-state token, then
appends an immutable numbered revision and updates pointers in one transaction.
The existing SQL constraints and immutability trigger remain active.

| Operation | Result |
| --- | --- |
| Save draft | New snapshot and draft pointer; live legacy fields, published pointer and legacy `updatedAt` remain unchanged |
| Publish | Validated snapshot, draft/published pointers and sanitized legacy projection committed atomically |
| Unpublish | Explicitly changes status; retains first publication date, snapshots and pointers |
| Restore | Copies the selected snapshot into a new draft; live publication is unchanged |
| Reconcile | Explicitly snapshots an out-of-band legacy change; preserves the pending draft and records a new compatibility baseline |
| Delete | Existing deletion semantics, with version/token checking; related snapshots/associations cascade and uploaded assets are retained |

The original publication date is never reset. Existing slugs are locked; new
slugs are checked against database uniqueness, aliases, the code-managed catalog
and the protected introduction URL. Alias redirects remain a later-phase concern.
The admin list displays the draft title and identifies unpublished changes.

Legacy and revision data cannot silently drift through the supported writer:

1. Draft saves do not write into the live legacy body or metadata.
2. Publishing updates the legacy copy and published pointer together.
3. Snapshots retain the expected legacy projection fingerprint. Admin loading
   detects an out-of-band body/title/excerpt/cover/format change and blocks normal
   saves until explicit reconciliation. Tokens also catch changes made after a
   form was opened, even if an external writer did not increment the version.
4. The old `savePost` service rejects writes to revision-managed articles.
   Direct database writes cannot be prevented by that service guard, but are
   detected on subsequent editor load/save. Reconciliation is visible and never
   overwrites a pending draft silently.

Draft and published pointers are separate. An optimistic conflict leaves the
controlled editor content in the browser and explains that the page must be
refreshed after the user's text is secured. Validation failures retain entered
metadata and body content and use Georgian field labels.

## Important transitional limits

Public `/blog`, homepage cards, recommendations and `/blog/[slug]` still use the
existing catalog/legacy readers and original components. None imports the new
structured renderer. A newly published database article can use the existing
database fallback detail route, but does not join catalog-fed listings yet.

To keep those readers operational, a normal publication writes a sanitized HTML
compatibility projection. Prose, images, graph images, captions and references
remain readable. Interactive comparisons project to an accessible static data
table. This is derived output, not another editable content system.

Display-heading/byline overrides, card/SEO overrides, crop presets and new layout
selection are retained in revisions for the future consumer cutover. Existing
public readers still apply their original title/byline/SEO/cover/layout rules.
The form explicitly explains this boundary. Rich structured rendering and
interactivity are available in authenticated preview now; preview is not a promise
that the legacy public detail page already uses that layout.

The three scientific article bodies, their existing SVG files, approved custom
layouts and hardcoded catalog entries remain untouched. No SQL copies of those
articles were created. The introduction's original database post and published
revision also remain unchanged in the working database.

## Private preview and rendering

`/admin/posts/[id]/preview` shows the saved draft; `?revision=<id>` selects a
historical snapshot belonging to that same article. It authenticates before
looking up article data and rejects invalid/cross-article revision selections.

The route is dynamic, non-indexable and non-cacheable. Scoped admin-post headers
configure `private, no-store, max-age=0`; Next.js development mode overrides this
with `no-store`, which was verified on the running page. Authentication is checked
on every request, including historical previews. Anonymous requests redirect to
login, and anonymous Server Action replay cannot mutate a revision.

`src/components/articles/document-renderer.tsx` is the structured renderer intended
for later public integration. It renders sanitized prose, semantic figures,
captions, attribution, research sections, citations and a reference list. New
styles are CSS-module scoped and used only on these new preview components.
Existing public styles and article geometry are unchanged.

Existing media URLs retain their current public, immutable asset-serving policy.
Private preview protects article/revision HTML; this phase does not convert the
shared media store into a private-file system.

## Component registry

The versioned registry currently contains two reusable implementations:

| ID/version | Editor configuration | Rendering/fallback |
| --- | --- | --- |
| `research.svg@1` | Choose a developer-approved SVG and enter alt text, summary, caption and sources | Existing immutable asset rendered as an image, with readable description |
| `research.comparison@1` | Title, unit and up to 12 labeled numeric rows, summary, caption and sources | Responsive interactive comparison and an accessible data table |

No scientific values or demo claims are supplied by the registry. Editors enter
comparison values themselves. Tests use synthetic values only in an isolated
database and delete them afterwards.

Server-side validation checks IDs, versions, strict component-specific props,
document depth/size, unique node IDs, reference resolution and asset references.
Uploaded raster IDs must exist in SQL; referenced static images must exist under
the approved public image directory. SVG upload remains disabled. Prose HTML is
sanitized before storage and again through the renderer boundary. Component
data never chooses an import path or executes JSX, scripts, MDX or callbacks.

Unavailable component versions/invalid props fall back locally to their summary
without removing surrounding article content. Interactive implementation code
runs only after hydration, inside an instance-specific React error boundary.
Server rendering always includes a readable table, so an interactive-code failure
cannot take down server rendering of the article.

For another Codex-developed visualization: add a stable versioned definition and
strict props schema, explicit renderer import/adapter, friendly configuration
controls, asset-reference validation if needed, and an accessible fallback. Keep
old versions available until affected revisions are deliberately migrated. This
is a code change once per new specialized component; ordinary reuse and article
publication require no code changes.

## Verification and artifacts

Evidence directory (ignored and local):

`apps/web/private/article-foundation/phase3-2026-11-24/`

- `backup.json`, `database.bak.enc`, `database-before.json.enc`: pre-Phase-3
  verified native SQL backup and exact encrypted record inventory. Encryption
  uses the existing local backup key; no credentials were added to tracked files.
- `admin/editor-{1440,768,390}.png`, `admin/preview-{1440,768,390}.png`: populated
  authoring and private-preview screenshots, created only against the isolated DB.
- `admin/main-editor-template.png`, `main-smoke.json`: read-only verification that
  the ordinary localhost server serves the updated form and protected introduction.
- `admin/report.json`: real UI authoring, uploads, captions, citations, component
  selection/interactivity, validation retention, concurrent tabs, draft isolation,
  publish/unpublish/republish, restore, preview authorization and action replay.
- `phase3-records.json`: every working database record equals its pre-Phase-3
  value; isolated article/media fixtures are removed and the original book page
  is restored exactly after its editor compatibility test.
- `visual-verification.json`: 99 public screenshots and 84 exact content,
  metadata, links and image/SVG geometry inventories against the approved original
  baseline. The existing 10/255 channel tolerance and 50 raster-outlier limit are
  unchanged. One tablet screenshot was recaptured after a transient 62-pixel
  raster mismatch; the original full-run report is retained.
- `reviewed-source-changes.json`: exact hashes for seven authorized admin/writer
  files. The other 303 originally captured application source/asset files remain
  byte-for-byte unchanged. All public route/component/style/asset files are intact.
- `lint.json`: repository-wide lint results. New/changed files pass lint; the
  same 139 pre-existing errors in six unrelated test files are left untouched.

TypeScript, Prisma validation/status and focused unit/integration suites pass.
The article suites cover immutable snapshots, optimistic concurrency, date
preservation, reconciliation, invalid/unavailable components, missing media,
failed-creation rollback, source validation and renderer fallback.

The original book-reader protection, legal modal, corporate page, registration
panel and local OAuth browser checks pass. Meeting/privacy storage checks use
their own disposable databases. OAuth tests perform no external authorization or
Calendar request. No real meeting, registration, enquiry or email is created.
There is no standalone Ayurveda route in this checkout; all existing public
routes and assets remain covered as recorded in the approved baseline.

The isolated Next.js server runs on host port 31998 using a separate development
output directory and the restored database. The ordinary site stays on port
31997. Test database records and uploaded test blobs are cleaned up; the isolated
server and restore database are removed after final verification. SQL schema
remains at seven migrations, and the known privacy default-normalization
difference is not changed.

## Running the checks

From `apps/web`, with the ordinary host server started by the root `start-dev.ps1`:

```powershell
node scripts/article-foundation/start-phase3-test.mjs
# In a second terminal, against the disposable restored DB/server:
pnpm.cmd exec tsx --test tests/article-revisions.test.ts tests/article-renderer.test.ts tests/article-document.test.ts
node tests/article-authoring-browser.mjs
node tests/book-editor-article-compatibility.mjs

$env:FOUNDATION_RUN = 'phase3-2026-11-24'
node scripts/article-foundation/main-phase3-smoke.mjs
node scripts/article-foundation/verify-phase3-records.mjs
pnpm.cmd exec tsx scripts/article-foundation/capture.mjs after
node scripts/article-foundation/compare.mjs
```

After final cleanup, restore the disposable database before repeating its tests;
do not run them against the website database. Restore the encrypted backup to the
recorded isolated target using the guarded rehearsal reset helper from Phase 2.
Do not overwrite the working database. Review/remove the one-off encrypted backup
and task artifacts by the 30-day date in `backup.json`; preserve the local key
separately. The normal managed backup/retention implementation was not modified.

## Rollback and next boundary

No database rollback is required to disable Phase 3: its working records and
schema are unchanged. Stop article authoring, revert only the reviewed Phase-3
admin/writer/config/dependency changes, and preserve the approved Phase-1–2
schema, migrations and evidence. Do not use a repository-wide hard reset or
remove another phase's uncommitted files. Keep new contracts/renderers dormant
until a reviewed writer is active. If future real articles have been authored,
retain their immutable revisions and reconcile them before any rollback; never
overwrite newer editorial data from the old backup automatically.

Future public cutover must reconcile remaining legacy content, integrate the
structured renderer and metadata/card fields, migrate the code-managed articles
and introduction under separate approval, and rerun the entire website baseline.
No part of that work is implemented automatically in Phase 3.
