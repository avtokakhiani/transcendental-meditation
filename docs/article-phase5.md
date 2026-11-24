# Unified public article delivery — Phase 5

Historical Phase 5 report. Phase 6 retires the runtime legacy flag described
below and archives the former branches. See `article-phase6.md` for current
recovery and verification instructions; `ARTICLE_PUBLIC_DELIVERY` no longer
selects a public source after Phase 6.

Local implementation only. Phase 6, permanent removal of compatibility code,
editorial rewriting, SEO optimization and production deployment are outside this
phase.

## Public delivery

`src/server/services/published-articles.ts` is the framework-independent public
read boundary. It selects only the published revision relation, validates body
version, layout, registry references, ownership and publication eligibility, and
fails closed on invalid publications. It never substitutes draft or legacy
editorial fields. Request-scoped React memoization lives separately in
`src/server/public-articles.ts`; metadata mapping is in `article-metadata.ts`.

All public consumers use that boundary:

- `/blog`: chronological database articles, published card copy, byline, category,
  reading time and image; existing row markup and styling retained.
- Homepage: latest three eligible database articles using the same card data.
- `/blog/[slug]`: the published structured document and versioned layout, using
  the same renderer as authenticated preview.
- Recommendations: the same eligible catalog, category affinity followed by
  publication date and deterministic slug ordering; no duplicates or current
  article. Evergreen/unknown pages keep their original no-recommendation behavior.
- Metadata: only published SEO/title/excerpt/cover values. Migrated articles keep
  their original social-tag presence and existing canonical-tag behavior; new
  articles receive article Open Graph fields. Existing metadata is not optimized.

The TM introduction remains evergreen, excluded from chronological cards, and
available at its original URL with all six sections. All seven specialized graphs,
original assets, versioned geometry, text, card copy and original dates remain.
Published updates never reset the first publication timestamp. The card identity
remains the canonical slug, preserving existing DOM identifiers and references.

The original catalogs, public layout components, legacy services and renderers
remain available. Their precedence is removed from active unified delivery.
`components/articles/legacy-delivery.tsx` preserves the former route orchestration
for explicit rollback. No normal article publication requires a code edit.

## Admin integration and safety

Draft saving and restoration create private snapshots without changing published
content. Publishing commits a validated immutable snapshot and pointers atomically
under the existing row lock, version and legacy token checks. Normal posts retain
a derived HTML compatibility projection; migrated bespoke articles preserve their
archival legacy fields while publishing their structured revision.

The transitional “approve revision” action is now “publish.” The admin describes
the active public behavior. Unpublishing ordinary articles removes them from the
detail route, lists, homepage and recommendations. The essential introduction is
protected against deletion and unpublishing at the service boundary and in admin.
Its text can be edited and published through its dedicated layout.

Additional slug aliases can be added through the authenticated form. They resolve
only to valid published canonical articles and return permanent redirects. A draft
or unpublished target returns 404 through either address. Canonical slugs remain
locked. Alias operations check both namespaces, have optimistic concurrency
protection, and do not silently discard unsaved form changes.

Previews remain authenticated, dynamic, noindex and non-cacheable. Cross-article
revision selections are refused. Prose is sanitized, component IDs/versions/props
and media references remain validated, and arbitrary JS/JSX/MDX/SVG uploads remain
unavailable. All public consumers are dynamic so stale drafts/publication state
cannot persist in a cross-request cache.

## Backup, reconciliation and rollback

Evidence directory:

`apps/web/private/article-foundation/phase5-2026-11-24/`

`backup.json`, `database.bak.enc`, and `database-before.json.enc` contain the
verified pre-cutover native SQL backup and encrypted exact record inventory.
Verification includes COPY_ONLY CHECKSUM, RESTORE VERIFYONLY, an isolated restore,
DBCC CHECKDB, and every-table equality. The existing local backup key is required;
plaintext staging copies are removed. Retain the key separately and observe the
30-day review date in the manifest.

Preflight validates all four published revisions, original publication dates,
three chronological entries and one evergreen page. It checks legacy fingerprints
and pending drafts and compares all working records with the verified snapshot.
No working database content migration or schema change is needed for cutover.

Rollback is an explicit local server configuration, not a database overwrite:

```powershell
# Stop the current host dev process first; leave SQL and media running.
$env:ARTICLE_PUBLIC_DELIVERY = 'legacy'
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1

# Return to unified delivery after stopping that host process:
$env:ARTICLE_PUBLIC_DELIVERY = 'unified'
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

These commands are run from the repository root. The flag is inherited by the
host Next.js process; unset means unified. Only `legacy` and `unified` are accepted.
Do not rebuild Docker web or seed anything. Stop authoring during rollback.
The fallback retains the old catalog and layouts, so later edits to bespoke
articles remain safely in revisions but do not appear through the old code-owned
layout. Review and reconcile such edits before any data recovery.
Legacy chronological lists also use the retained original catalog, so articles
created after cutover will not be listed there during rollback. Their database
records remain intact. The tested rollback covers the four existing articles at
the unchanged cutover state; it is a temporary recovery mode, not a second
authoring system.

The encrypted backup is a separate recovery option; restore it to an isolated database and
verify it before any deliberate switch, never over newer editorial records.

The rollback comparison uses the isolated server at port 31998 with legacy mode
and compares homepage, blog and all four article URLs at all three widths against
the approved original baseline. The ordinary localhost server is returned to
unified mode after tests. Database equality is checked before test DB cleanup.

## Verification and remaining boundaries

The publishing browser test authors a synthetic article entirely through admin,
including formatted prose, actual image/cover uploads, research, citations and two
registered visuals. It checks draft privacy, authenticated preview, public detail,
blog/home/recommendation inclusion, metadata, replacement-draft isolation, updated
publication, restoration, unpublishing, aliases and original-date preservation.
All fixture rows and blobs are confined to the restored database and removed.

Focused tests cover invalid/mismatched revisions, future dates, invalid registry
versions, legacy reconciliation, optimistic conflicts and essential-page guards.
Public baseline checks include every existing route and every “Why TM?” page at
desktop, tablet and mobile widths, plus navigation/registration/legal/FAQ states.
The original raster thresholds remain unchanged. Existing article/layout
components and scientific assets are retained; the public card wrappers change
their data source while keeping their markup and styles.

New normal articles use the approved Phase 3 standard/classic presets. Migrated
articles retain fixed section structure and typography; editors change their
content through the preservation fields. Existing SVG scientific data/geometry
remain developer-owned. Historical raw HTML remains archival; it cannot replace
a required dedicated structured layout through restoration.

Separate pre-launch follow-ups, deliberately unchanged:

- Repository lint was rerun: exactly 139 existing errors in six unchanged tests
  (book protection 68, corporate browser 9, meeting panel 27, privacy browser 17,
  privacy storage 1, legal documents 17). Focused Phase 5 lint has zero errors.
- The corporate endpoint unit test was rerun and still fails its success-response
  assertion at `tests/corporate-inquiries.test.ts:37`; it expects the older
  mail-only lifecycle. The endpoint and test were deliberately not changed.
- SQL Server privacy-retention default expression-normalization drift.
- The existing ignored `.next/article-tests` development cache.

No book editor/protection, meeting registration, Google Calendar, privacy, legal
text, unrelated page styling or other functionality is changed in this phase.

## Completed local verification — 24 November 2026

Evidence is retained in the ignored local directory
`apps/web/private/article-foundation/phase5-2026-11-24/`. The original approved
baseline was copied for comparison; it was never regenerated or relaxed.

| Check | Result |
| --- | --- |
| Working database preflight and final comparison | All tables exactly match the verified pre-cutover snapshot; four published posts, eight revisions, three chronological articles and one evergreen introduction; no pending drafts or legacy divergence |
| Full public regression | 28 routes × 1440/768/390 widths = 84 exact DOM, editorial, links, media, metadata and geometry inventories; 99 screenshots including 15 navigation, registration, FAQ and legal states |
| Pixel comparison | Passed unchanged 10/255 channel tolerance and maximum 50 outlier pixels; 21 images have raw raster differences, with at most 32 pixels over tolerance; no editorial, layout, metadata or geometry differences |
| Original source and assets | 297 original files unchanged; 13 reviewed source differences include eight previously approved changes and five public consumer changes |
| Legacy rollback | 18 screenshots and 18 exact inventories across homepage, blog and all four articles; tested on isolated port 31998, then stopped |
| Admin-to-public browser workflow | Passed creation, real uploads, rich content, research, two registered visuals, citations, private draft/preview, first publication, replacement draft isolation, updated publication, restore, unpublish/republish, aliases, concurrency and anonymous action protection |
| Automated suites | 47 article/renderer/revision/recommendation/Calendar tests, one comprehensive public-delivery integration test and 12 shared tests passed: 60 total |
| TypeScript and focused lint | Root workspace TypeScript passed, including a final run against host dev-generated route types; all 24 changed/new code files have zero lint errors or warnings |
| Prisma | Schema valid; seven migrations applied, database up to date; no Phase 5 schema migration |
| Unrelated browser regressions | Book protection/accessibility/printing, legal text/modals, corporate navigation/forms, meeting panels and local Calendar authorization/CSRF checks passed |
| Book editor | Existing isolated compatibility check passed; original book record restored exactly |
| Running localhost admin smoke | All four migrated editors and authenticated non-cacheable previews served successfully; no records changed by this check |
| Cleanup | Synthetic article revisions, aliases, uploaded blobs and media rows removed; restored test database dropped only after exact-record and verification gates passed; working records rechecked afterward |

The obsolete corporate unit test was rerun separately and failed as documented
above. It unexpectedly persisted one `route-qa@example.invalid` fixture through
the current endpoint. The final all-table snapshot gate detected it. Only that
specific, fully verified test record was removed; every working table then
matched the backup exactly. Evidence is in `legacy-unit-fixture-cleanup.json`.
Any future rerun of that unrelated test must use a disposable database. The test
and endpoint were not changed during this phase.

Calendar browser checks did not contact Google or authorize an external account.
A live non-admin role check was unavailable because the working database has only
the existing admin account; role guards are covered by automated tests. SMTP and
real meeting submissions were not exercised; browser submissions were intercepted.
Privacy records were preserved rather than running destructive privacy tests.

The verified backup is `database.bak.enc` with its manifest in `backup.json`,
created at `2026-11-24T16:37:20.269Z`. The native backup SHA-256 is
`cdb2b23b929e3098fec7954d11c2f5ff444f205eaaa0d1987f2a53bbcb07f81f`.
It passed SQL checksum/VERIFYONLY, actual isolated restore, DBCC CHECKDB and
exact comparison of every table. AES-256-GCM encryption was round-trip verified;
plaintext staging copies were removed. Keep the existing ignored backup key.
Review retention by 24 December 2026. `cleanup.json` records removal of the
disposable restore, not the working database or encrypted backup.

Screenshots are retained under `after/` for all existing public pages,
`workflow/` for the isolated authoring/preview/public workflow at all three
widths, and `previews/` for the final localhost admin list and introduction editor.
The synthetic workflow article is evidence only and no longer exists in either
database. The stopped isolated server and retained ignored test cache are not
part of the running site.

Additional operational limits: public delivery now requires SQL availability and
has no automatic legacy fallback, preventing unpublished content from reappearing.
The current validated catalog is read per request; large-scale pagination and
performance tuning remain future work. Dedicated migrated layouts retain their
approved section structure; structural redesign and new bespoke visual development
remain code-owned. Canonical slugs are immutable; supported aliases redirect.

The host Next.js development server remains at `http://localhost:31997` in unified
mode with hot reload. No production environment was accessed, compatibility code
was not removed, and Phase 6 was not started.
