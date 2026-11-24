# Unified article management — Phase 6 handover

This phase refines the existing Georgian admin, removes competing runtime article
sources, and verifies preservation. Work is local only. No production deployment,
meeting-registration integration, schema migration or editorial rewrite is included.

## Final authoring behavior

The existing two-column editor is retained. Navigation and page headings now say
“სტატიები” and “ახალი სტატია”; article image terminology uses “მთავარი სურათი”,
“სურათის ალტერნატიული ტექსტი” and “სურათის მოჭრის პარამეტრი”. SVG selection says
“გრაფიკის არჩევა”. Registered definitions distinguish graphs from other visuals,
so generic components are not universally described as graphs.

Concise Georgian help explains main/display/card titles, article/card excerpts and
SEO values. Empty optional overrides retain the established validated fallbacks.
Georgian titles generate Latin slugs through the existing shared transliteration;
manual new-article input survives title changes. Saved canonical URLs remain
immutable, with authenticated aliases for additional addresses.

The save/publish/saved-preview controls use the existing button design in an
article-only fixed lower bar, accessible at the top, middle and bottom of long
articles. Metadata, revision history, aliases and publication state remain in the
existing sidebar. There is no public visual redesign.
Implicit Enter in a normal form input saves a draft rather than invoking
unpublication; the browser check verified that the published pointer stayed intact.

Selected SVG, preserved research and interactive components have inline previews.
Interactive previews use the registered client implementation and accessible data
fallback; preserved graph previews render through an authenticated read-only
Server Action. Draft props are not put into URL parameters. Invalid inputs and
preview failures display a local explanation without discarding the article.
Technical IDs/versions are in expandable information rather than choice labels.

The registry also declares developer-owned `imageAssets` extractors. Assets in
free or nested specialized graph components now receive the same existence checks
and revision/media references as normal figures and preserved layouts. Tests
reject missing media IDs and missing static graph files without creating orphan
revisions. This closes a gap where only the shape of those references was checked.

Figures expose alignment, percentage width, intrinsic pixel dimensions, caption,
alternative text, attribution and source link. Research has left/right placement;
free component blocks additionally support bounded 10–100% width and alignment.
These optional document-v1 additions preserve every old document verbatim.
Images preserve their natural proportions; percentage width controls displayed
size. Existing migrated graphs retain their approved fixed geometry and section
sequence. No arbitrary CSS, SVG upload, script, JSX or executable MDX is accepted.

The shared cover field gains only an optional label, retaining its book-editor
default. The shared rich-text editor, title/slug implementation, book protection,
privacy behavior, Calendar, corporate endpoint and meetings code are unchanged.

## Removed runtime dependencies

| Former mechanism | Final state |
| --- | --- |
| Hardcoded article catalog | Archived as `scripts/article-foundation/archive/article-catalog.ts`; used only by historical migration/baseline tests |
| Card copy overrides | Archived as a migration fixture; no public imports |
| Catalog recommendation selector | Archived for historical tests; public selection uses validated published revisions |
| Legacy detail route branch | Former orchestration retained as `.tsx.txt`; no runtime dispatch to old content |
| `ARTICLE_PUBLIC_DELIVERY` flag | Retired; setting it no longer changes the source |
| Transitional approve-without-publication behavior | Removed; publish always atomically publishes the validated revision |
| Legacy post public reads and writes | Removed from the live service; historical helpers archived for foundation/reconciliation tests |
| Deleted-demo slug layout map and old post renderer | Archived as an isolated historical layout fixture; no active public route uses them |
| Catalog-derived presentation type | Extracted to a data-free type contract, preserving approved layout components |

The approved original scientific components, SVG assets, styles and versioned
structured presets remain. Original HTML and all revision history remain in the
database. HTML/Markdown compatibility, legacy fingerprint conflict detection,
explicit reconciliation safeguards, aliases and essential-introduction protection
remain necessary and are retained. Historical migration/recovery tools are not
public content sources. See the archive README for their scope.

`phase6-preflight.mjs` audits every application source module for retired runtime
dependencies. Only the database-managed validated published revision supplies
public content, cards and metadata. Invalid or unpublished content fails closed;
there is no automatic archive fallback.

## Backup and recovery

Before cleanup, a fresh SQL Server COPY_ONLY/CHECKSUM backup was created in
`apps/web/private/article-foundation/phase6-2026-11-24/`. The encrypted native file
is `database.bak.enc`, its manifest is `backup.json`, and the exact all-table
snapshot is `database-before.json.enc`. AES-256-GCM uses the existing ignored
backup key; plaintext host/container staging files are removed. Review retention
by 24 December 2026; preserve the key with the backup.

Verification included VERIFYONLY, actual isolated restore, DBCC CHECKDB and every
table comparison. Recovery was rehearsed again from the encrypted backup with
`rehearse-phase6-recovery.mjs`: explicit isolated physical-file paths, checksum,
DBCC, restored-table equality and proof that the working database was untouched.
It refuses any target other than the manifest-named disposable database.

To repeat a rehearsal, including after the disposable restore has been removed:

```powershell
# From apps/web; stop the isolated server on 31998 first.
$env:FOUNDATION_RUN = 'phase6-2026-11-24'
pnpm.cmd exec tsx scripts/article-foundation/rehearse-phase6-recovery.mjs
```

The final cleanup intentionally removes that disposable database. The rehearsal
can recreate exactly the same manifest-named isolated target with explicit file
paths; afterward rerun `verify-phase6.mjs --cleanup` to remove it. It requires the
working database to be available and unchanged for its protective comparison;
it is an isolated recovery rehearsal, not an automatic disaster cutover.
Never overwrite newer working editorial data as routine rollback. For application
rollback use a reviewed release/source snapshot; the source archive is historical
evidence rather than a manufactured complete Phase 5 checkout. The user's Phase 5
workspace was uncommitted when this phase began and has not been reset or committed.

## Verification evidence and limits

Evidence is local and ignored under `private/article-foundation/phase6-2026-11-24/`.
`workflow/` contains admin-only creation, formatted headings/lists/links/tables,
uploads and image properties, research/components and sources, draft privacy,
preview, publish, replacement draft, update, restoration, unpublish/republish,
aliases, optimistic conflicts and anonymous-action replay checks. Controls were
checked at the top/middle/bottom at 1440, 768 and 390 pixels.

`migrated-previews/report.json` records 12 exact public/private content/geometry
comparisons and raster checks at all three widths, with all four migrated articles
edited/restored through the real admin. All seven preserved inline graphs rendered.
The maximum raster outlier count in these comparisons was six, below the unchanged
limit of 50. The private preview remains authenticated, noindex and non-cacheable.
`visual-preview-security.json` proves authenticated rendering, anonymous login
redirect and cross-origin rejection for the new inline preview action.

The automated suites passed 62 distinct tests: article documents/rendering,
revisions/concurrency, public delivery, aliases, essential-page guards, Calendar,
recommendations and shared utilities/transliteration. DB-mutating suites run
sequentially on a clean disposable restore. An early overlapping rehearsal was
discarded; the restore was reset and the final suites passed sequentially. No
working records were used as test fixtures.

The production build passed locally with separate `.next/article-tests` output and
the disposable database; it generated all pages and standalone output without
starting a production server. It emitted eight tracing warnings from unchanged
`privacy-files.ts` and a metadataBase fallback warning. The broad trace actually
copied the local `private/` tree into the generated standalone artifact. This
artifact was never deployed; the isolated output is covered by cleanup below.
Before any future deployment, review packaging exclusions/privacy tracing and
site metadataBase. These unrelated changes were deliberately not folded into the
article cleanup or used to change approved public SEO.

Remaining product boundaries: canonical slugs are immutable; aliases are supported.
Migrated layouts remain structurally fixed while their fields are editable.
Specialized implementations and geometry remain developer-managed. Restoring
archived raw HTML cannot replace a mandatory dedicated layout. The validated
catalog is read per request; large-scale pagination/performance work is separate.
Public delivery requires SQL availability.

Separate pre-launch follow-ups retained:

- Exactly 139 repository lint errors in the same six unrelated test files.
- Existing corporate unit-test success assertion failure. It was reproduced only
  against the disposable database; its exact QA fixture was removed and both
  snapshots were verified unchanged. The corporate browser behavior is tested
  separately with intercepted submissions, without SMTP.
- SQL Server privacy-retention default normalization drift; no schema changes.
- Historical cache/cleanup state and current cache cleanup are recorded below.
- The build tracing/metadataBase warnings described above; no production readiness
  claim is made for the standalone package.

Calendar browser checks do not authorize Google or call Calendar. A live non-admin
role check is unavailable because the working database has only the existing admin;
automated role tests remain. Destructive privacy tests and live email/meeting
submissions are not run against the working database.

The Georgian editorial guide is [article-management-guide.md](article-management-guide.md).
It covers everyday authoring, revisions/publication and safe registration of new
SVG/React/interactive implementations. Normal publication needs no code changes.

## Final verification and cleanup

| Check | Final result |
| --- | --- |
| Root TypeScript | Passed again after removal of the isolated build/cache output |
| Focused lint | 59 affected/supporting code files, zero errors and warnings |
| Automated tests | 62 distinct tests passed; the separately reproduced pre-existing corporate unit failure remains open |
| Prisma | Schema valid; seven migrations applied, database up to date; no Phase 6 schema migration |
| Production compilation | Passed locally against the disposable restore; warnings documented above |
| Authoring workflow | Passed real-browser draft, preview, publication, images, components, citations, history, aliases, concurrency and authorization checks |
| Migrated content | All four articles editable/restorable without layout or graph loss; 12 preview/public comparisons at 1440/768/390 passed |
| Website preservation | 28 public routes at three widths: 84 exact content/link/media/metadata/geometry inventories; 99 screenshot comparisons including shared UI states passed |
| Visual precision | 23 screenshots have raw raster differences; maximum 32 pixels over the existing channel tolerance of 10, below the unchanged limit of 50; no content or geometry difference |
| Original source/assets | 285 baseline files unchanged; 25 explicitly reviewed changes/removals, including archived runtime sources and type-only imports |
| Unrelated functionality | Book editor/reader protection, navigation, legal documents, corporate and meeting panels, and local Calendar security checks passed within the non-live limits above |
| Working database | Every table exactly matches the encrypted pre-phase snapshot; four original posts and eight revisions, no synthetic records or pending test drafts |
| Backup restoration | Encrypted native backup restored into a newly recreated isolated target; CHECKSUM/DBCC and all-table equality passed; working database untouched |
| Temporary databases | Manifest-only restore database dropped after verification; final SQL inventory contains only `transcendental_meditation` beyond system databases |
| Temporary files/media | Isolated synthetic uploads/records removed; `.next/article-tests`, two generated corporate screenshots and the generated protected-reader print PDF removed |
| Normal local server | Host Next development server operational at `http://localhost:31997`; homepage/blog return 200, unauthenticated admin redirects to login, unknown URL returns 404 |

Cleanup used the guarded native filesystem helper and manifest-targeted SQL DROP;
no security restriction was bypassed. The normal `.next/dev` output, original
uploads, original content/assets, encrypted backups and requested verification
evidence/screenshots remain. There is no outstanding restriction blocking removal
of the identified Phase 6 disposable artifacts. Historical retained evidence and
backups are intentionally kept, rather than treated as disposable cache.

Machine-readable final evidence: `preflight.json`, `record-verification.json`,
`recovery-verification.json`, `cleanup.json`, `cache-cleanup.json`,
`build-verification.json`, `focused-lint.json`, `visual-verification.json`,
`functional-regression.json` and `localhost-smoke.json` in the Phase 6 evidence
directory. The final records-only preflight was run after disposable DB removal.

Final screenshots of the actual working articles, with no demo records retained:

- `previews/final-editor-1440.png`: desktop admin editor.
- `previews/final-editor-390.png`: mobile admin editor.
- `previews/final-article-preview.png`: authenticated representative article preview.

Phase 6 is complete locally. No production deployment or meeting-registration
integration was started. Pre-launch debt listed above remains explicitly open.
