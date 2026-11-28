# Article migration — Phase 4

Implemented only on localhost, 24 November 2026. Public consumers have not been
switched. The hardcoded catalog, original article components, public metadata
functions, navigation, scientific assets, and compatibility renderers remain.
No schema migration was necessary; the seven Phase 1–3 migrations are reused.

## Migrated content

| Canonical slug | Classification | Structured layout | Graphs |
| --- | --- | --- | --- |
| `meditatsia-stresis-shesamtsireblad` | article | `stress-v1` | 2 |
| `gulis-janmrteloba-da-meditatsia` | article | `heart-v1` | 2 |
| `meditatsia-uketesi-dzilistvis` | article | `sleep-v1` | 1 |
| `ra-aris-transtsendentuli-meditatsia` | evergreen | `tm-introduction-v1`, six ordered sections | 2 |

There are four canonical posts and eight revisions in the working database.
Each scientific article has its complete original rendered HTML in an archival
revision and its complete structured body in a second revision. The introduction
retains its original stored HTML and original foundation revision byte-for-byte;
its new revision contains all six displayed sections, including the introduction,
what TM is not, its differences, restful alertness, Maharishi, and Tony Nader.

Full titles, displayed headings, card titles and excerpts, catalog excerpts,
editorial bylines, categories, publication timestamps, reading times, images and
alt text, original SEO inputs, and actual rendered metadata are retained. Canonical
links are recorded as they existed, including their absence where none existed.
No SEO optimization, editorial rewriting, invented dates or bylines was applied.
Sources and captions stay in their original inline positions. Text inside existing
SVG artwork remains in the unchanged developer-owned assets.

## Preservation architecture

`scripts/article-foundation/generate-phase4-presets.mjs` deterministically extracts
the nine original JSX components into versioned, preview-only layout adapters.
The public files are read only. Adapters import the original CSS modules and
shared layout primitives, retaining tags, spacing, responsive rules, image props,
chart framing, widths and heights. Editorial strings become fields in the revision
document; they are not read back from the catalog at render time.

The document's `preserved` blocks contain a preset ID, data-only editorial fields,
and versioned graph references. Strict schemas require every field and graph,
reject unknown properties and unsafe URLs, and enforce complete approved section
sequences. SQL media references also cover images used in these fields. Server
validation verifies referenced media and static image files exist.

Seven specialized graph adapters are registered under `preserved.*` IDs at version
1. They retain the original ArticleChart/figure markup and SVG assets. Editors can
edit graph descriptions, image references, accessible labels and source/caption
text without altering graph geometry. The regular component picker also supports
these registrations. Database values never select imports, run JSX, upload SVG,
or execute scripts.

The only shared public component change is an optional `previewPathname` prop on
SiteHeader. The authenticated preview supplies its canonical article path so the
introduction keeps the original transparent header and exact vertical position.
Public callers pass no override and retain the original behavior. The risk was
reported before making this opt-in change and is covered by the public baseline.
The book editor, book protection, meeting/registration code, Calendar integration,
privacy code, public styles and scientific assets were not changed.

## Editing and revision behavior

All four articles are available in `/admin/posts`. The existing form and revision
workflow are retained. Migrated content uses Georgian text fields organized into
its original layout sections; text fragments retain their original inline emphasis
and placement. Images and links are editable as validated references. Editors do
not enter HTML, JSON, JSX, CSS or JavaScript.

Draft saves leave public fields and the approved revision untouched. Restoration
creates a new draft. Optimistic concurrency checks and legacy fingerprints remain
active. Migrated layout identity, section ordering and required graphs cannot be
discarded accidentally. Original raw HTML is archival history; restoring it as an
unstructured body is refused rather than destroying the dedicated layout.

For these migrated articles, the action is labeled “approve revision.” Approval
updates the database revision pointers atomically while retaining every legacy
public field, timestamp and status. Removal, unpublishing and out-of-band legacy
reconciliation are blocked during this transition. Unexpected legacy edits are
detected and block further ordinary writes; they require explicit review.

`/admin/posts/[id]/preview` redirects structured migrated revisions to
`/admin/article-preview/[id]?revision=...`. That route authenticates before looking
up content, checks revision ownership, is dynamic, noindex and non-cacheable, and
uses the original site chrome and recommendations around the new renderer.
Anonymous access redirects to login. Existing media serving policy is unchanged.

## Migration safety and evidence

Local evidence is in the ignored directory:

`apps/web/private/article-foundation/phase4-2026-11-24/`

- `backup.json`, `database.bak.enc`, `database-before.json.enc`: verified encrypted
  pre-migration SQL backup and exact inventory. Verification includes COPY_ONLY
  CHECKSUM, RESTORE VERIFYONLY, isolated restore, DBCC CHECKDB, and every-table
  record comparison. The existing local backup encryption key is required.
- `migration-manifest.json`, `dry-run.json`: four complete bodies, source hashes,
  metadata inventories, original HTML and expected existing-post tokens. Prepared
  before writes; no collisions, pending drafts or legacy divergence were found.
- `migration.json`: precise working import ledger, including the introduction's
  original row and the resulting revision IDs/versions.
- `idempotency.json`: reapplying the same manifest made no changes.
- `rollback-rehearsal.json`: the isolated import was reversed and every table
  matched the encrypted original inventory exactly.
- `collision-verification.json`: a later editorial revision caused the importer
  to refuse atomically, leaving every record unchanged.
- `previews/report.json`: all four original/public versus structured/private
  comparisons at 1440, 768 and 390 pixels; all four articles edited and restored
  through the real admin form; preview authorization tested.
- `record-verification.json`: exactly three new canonical posts and seven new
  revisions, original introduction legacy fields unchanged, unrelated tables
  unchanged, no test revisions in the working database.

The importer checks original source fingerprints, validates documents, locks slug
ranges, checks aliases and canonical collisions, and verifies expected existing
versions/tokens before writing. All four imports commit in one transaction.
It never runs seeds or recreates deleted demo posts. Existing or later editorial
content is never overwritten silently. Reuse the approved manifest for repeat
runs; planning against already-imported editorial content intentionally requires
review rather than treating it as a blank database.

## Rollback

The tested rollback is a guarded inverse of this exact import. Stop authoring,
retain the import ledger and verified backup, and inspect current versions first.
From `apps/web`, use `FOUNDATION_RUN=phase4-2026-11-24` in the local environment.

```powershell
$env:FOUNDATION_RUN = 'phase4-2026-11-24'
# Tested on the disposable restored database, before later test edits:
pnpm.cmd exec tsx scripts/article-foundation/phase4-migrate.mjs rollback --isolated
node scripts/article-foundation/verify-phase4-records.mjs --rollback

# Explicit working rollback, only after reviewing the ledger and stopping authoring:
# pnpm.cmd exec tsx scripts/article-foundation/phase4-migrate.mjs rollback --working-rollback
```

The working rollback is available but has not been executed. It refuses newer
versions, changed legacy fields or changed draft/published pointers. It deletes
only the three posts created by this import and resets the existing introduction
to its recorded original row, removing only its migration revision. All actions
are transactional. If later editing has occurred, stop and reconcile that content;
do not bypass guards or restore an old database over newer editorial work.

The encrypted native backup provides a separate recovery path: use the existing
guarded restore rehearsal tools to restore to an isolated target and verify it
before any deliberate local database switch. Keep the current database intact
until recovery is verified. Do not delete/reseed Docker volumes or uploaded media.
Disable the new admin adapters only after resolving revision compatibility; retain
Phases 1–3 and their migrations. No public component rollback is otherwise needed.

## Remaining boundaries

Public routes, `/blog`, homepage latest cards, recommendations and public SEO
continue to use their original readers. Approved database edits therefore remain
visible only in authenticated preview until a separately approved cutover.
The original catalog and layout components remain intentionally as transitional
public delivery code. They must not become a second editable source.

Migrated layouts support editing within the original approved structure. Arbitrary
section rearrangement, typography changes, graph geometry changes, and new inline
formatting are intentionally excluded from this preservation migration. A new
specialized layout/component version requires reviewed developer work. Normal
articles retain the Phase 3 rich editor. Existing SVG scientific artwork remains
developer-owned; its underlying scientific data/labels are not a free-form editor.

Phase 5/public consumer cutover has not begun.

## Verification results

The final evidence includes `visual-verification.json` and `after/report.json`
for the original public baseline, plus `previews/report.json` for migrated layouts.
All 99 public screenshots and 84 exact content/metadata/link/geometry inventories
passed. The other 302 originally captured source/asset files are unchanged; eight
reviewed changes cover the seven prior admin/writer files and the optional header
preview-path prop. Three reader screenshots retained from the interrupted pass
were recaptured after restarting the dev server; the original failed comparison
is retained as `visual-verification-initial.json`. Their final comparisons pass
without changing a baseline or tolerance.
The public inventory covers 28 routes at three widths, including every “Why TM?”
page, all seven reader-page URLs, all articles and legal routes. Shared navigation,
registration panels, legal modals and expanded FAQ states are also captured.
The original raster tolerance remains 10/255 per channel and at most 50 outlier
pixels; no baseline or tolerance was changed to make a result pass.

The migrated previews passed all 12 exact content, heading, link, image, typography
and geometry comparisons, and all 12 raster comparisons. The largest preview
raster outlier count was 5 pixels. There are no detected editorial or layout
differences. Screenshots at all three widths are retained under `previews/`.

Other completed checks:

- All four migrated bodies were edited, saved, previewed and restored through the
  real admin UI on the isolated database. Required sections/graphs survived.
- Optimistic conflicts, legacy fingerprint checks, revision approval without
  public changes, dates/bylines, unsafe values, missing fields and layout loss
  were tested. Repeated imports are no-ops; later editorial edits are refused
  atomically. The guarded inverse restored every original database record.
- 46 article-document/renderer/recommendation/OAuth Node tests, two migration
  tests and the isolated revision lifecycle test passed. The 12 shared tests pass.
- Workspace TypeScript, focused lint, Prisma validation and migration status
  pass. The schema remains at seven migrations. The existing privacy retention
  default expression-normalization difference remains untouched.
- Original browser checks pass for book content protection, book editor loading
  and HTML saving, Terms/Privacy modals, corporate-page behavior, meeting panels,
  and local Calendar OAuth authentication/CSRF/callback/clear controls. Browser
  fixtures intercept form responses; no real enquiry, meeting or registration is
  submitted. OAuth performs no Google authorization or Calendar request.
- The ordinary localhost server serves all four new editors and authenticated
  full-width previews. Its read-only verification leaves every record unchanged.
  A stale dev-server SQL connection caused a timeout/500 during an initial pass;
  restarting with `start-dev.ps1` resolved it without data or source changes.

Repository-wide lint still reports 139 pre-existing errors in six unchanged test
files. The unchanged `corporate-inquiries.test.ts` also fails: it expects the old
synchronous mail-only endpoint while the existing route persists enquiries and
uses Next's deferred notification lifecycle. Its browser checks pass; the obsolete
unit test and unrelated application code were not changed. A live non-admin OAuth
role check has no existing account available; permission checks remain covered by
the isolated/unit suites. No account was created solely for that live check.

The temporary restore database and all its test revisions are removed. Uploaded
test media were removed, and original book records were restored exactly.
Synthetic authoring screenshots and superseded diagnostic inventories were
deleted; `authoring-workflow.json` retains the passing test result. Automatic
approval review blocked recursive deletion of the ignored `.next/article-tests`
build cache. That cache remains; its server is stopped and it contains no working
database records. Verified backup, migration manifests, approved baseline and
real-article screenshots remain intentionally as recovery and review evidence.

Useful screenshots:

- `previews/admin-article-list-localhost.png`: actual updated localhost list.
- `previews/introduction-editor-localhost.png`: six-section introduction editor.
- `previews/<canonical-slug>-{1440,768,390}-preview.png`: all four migrated previews.

| Migrated preview | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Stress reduction | [1440](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-stresis-shesamtsireblad-1440-preview.png) | [768](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-stresis-shesamtsireblad-768-preview.png) | [390](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-stresis-shesamtsireblad-390-preview.png) |
| Heart health | [1440](../apps/web/private/article-foundation/phase4-2026-11-24/previews/gulis-janmrteloba-da-meditatsia-1440-preview.png) | [768](../apps/web/private/article-foundation/phase4-2026-11-24/previews/gulis-janmrteloba-da-meditatsia-768-preview.png) | [390](../apps/web/private/article-foundation/phase4-2026-11-24/previews/gulis-janmrteloba-da-meditatsia-390-preview.png) |
| Sleep improvement | [1440](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-uketesi-dzilistvis-1440-preview.png) | [768](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-uketesi-dzilistvis-768-preview.png) | [390](../apps/web/private/article-foundation/phase4-2026-11-24/previews/meditatsia-uketesi-dzilistvis-390-preview.png) |
| TM introduction | [1440](../apps/web/private/article-foundation/phase4-2026-11-24/previews/ra-aris-transtsendentuli-meditatsia-1440-preview.png) | [768](../apps/web/private/article-foundation/phase4-2026-11-24/previews/ra-aris-transtsendentuli-meditatsia-768-preview.png) | [390](../apps/web/private/article-foundation/phase4-2026-11-24/previews/ra-aris-transtsendentuli-meditatsia-390-preview.png) |

[Actual localhost admin list](../apps/web/private/article-foundation/phase4-2026-11-24/previews/admin-article-list-localhost.png)
