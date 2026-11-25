# learnTM.ge pre-launch readiness audit

Audit date: 25 November 2026, Asia/Tbilisi. Diagnostic only. Decision: **NO-GO for a public launch in the present state.** The article system's local completion does not establish production readiness. A launch date was not supplied; the action plan therefore uses dependency gates rather than invented dates.

The register contains **29 findings: 5 P0, 16 P1, 7 P2 and 1 P3**. The P0 gates are private-file packaging, simulated registration success, unverified privacy prerequisites, unproven durable erasure/restore operations and unverified production infrastructure. P1 work needs completion or an individually documented and tested safe workaround.

Implementation note, 25 November 2026: this document preserves the diagnostic baseline. Subsequently authorized local F01 packaging remediation and its verification are recorded in [the remediation report](prelaunch-packaging-remediation.md) and [updated action plan](prelaunch-action-plan.md). Historical exposure review and the other launch gates remain open; the launch decision remains **NO-GO**.

## Scope, evidence and limits

This audit reviewed application source, public routes, APIs, authentication, content delivery, Prisma schema and migrations, privacy operations, storage, deployment automation, package manifests/lockfile, existing local evidence and current local behavior. Only the requested reports were added to the working repository. No application, dependency, environment, content or database fixes were made; no migration, seed, retention cleanup, backup creation, deployment, email or Google Calendar operation was requested by this audit.

Evidence labels used below:

- **V — verified:** current source, read-only local inspection or a verification executed during this audit.
- **H — historical:** retained Phase 6 evidence inspected, but the operation was not repeated.
- **E — external:** requires owner/provider/staging evidence not accessible from this workspace.
- **U — untested:** not established by the available tests. Absence of a demonstrated exploit is not proof of safety.

The development server already running at `http://localhost:31997` was reused. Its existing instrumentation independently runs privacy maintenance; this audit did not invoke that maintenance or claim to freeze the live service. Read-only SQL probes returned aggregate counts and published URLs, without exporting personal records. Authenticated privacy lookups were deliberately avoided: even a lookup calls retention and writes an access audit row. Mutating privacy, storage, article lifecycle and publishing tests were not run against the working database.

At audit entry Git already showed deletion of the zero-byte stray file under `apps/web` whose malformed filename had prevented the preceding server startup. That deletion predates this audit and is not an audit fix. No attempt was made to restore it or overwrite the user's workspace.

Safe verification scripts/logs were placed in the OS temporary directory under the `tm-prelaunch-*` prefix. A separate sanitized source snapshot at `%TEMP%/learntm-prelaunch-audit-20261125` excludes `.env*`, `private`, existing `.next`, Git and `output`; its dependencies were installed offline with the existing frozen lockfile. Synthetic build configuration points to an unreachable database, rather than the working database. Build results must be interpreted with that isolation boundary. No standalone server was started against working data.

### Verification register

| Check | Result and boundary |
| --- | --- |
| Web TypeScript | `pnpm --filter @tm/web exec tsc --noEmit --incremental false`: passed |
| Shared TypeScript | `pnpm --filter @tm/shared exec tsc --noEmit --incremental false`: passed |
| Safe application unit tests | Document validation/rendering and Calendar read/write simulations: 42 passed; no live Google requests |
| Shared unit tests | `pnpm --filter @tm/shared test`: 12 passed |
| Historical recommendation utility tests | Six passed; these target archived catalog helpers, not the new database-backed public selector |
| Repository ESLint | 139 errors, zero warnings; six files; detailed classification below |
| Prisma validation | Passed |
| Prisma migration status | Seven migrations applied; database up to date |
| Read-only Prisma diff | One default-expression normalization difference, discussed below; generated SQL was not executed |
| Dependency audit | Registry returned 10 advisories: 2 critical, 2 high, 5 moderate, 1 low. Production-dependency filter returned 2 high and 1 low; reachability differs from dependency classification |
| Working database inventory | 1 active administrator, 4 published posts, 8 revisions, 0 aliases, 1 book, 7 book pages, 0 media records, 0 meetings, 0 registrations, 0 corporate inquiries. No private record contents included |
| Prior production build | H: passed in Phase 6 with 8 tracing warnings and metadataBase fallback; copied private files. Original isolated artifact was subsequently removed |
| Fresh isolated build / browser checks | See the final measurement addendum at the end of this report |
| Production accounts and infrastructure | E: not verified. Local Docker availability is not evidence of production provisioning |

Safe unit test count is 60, not the historical 62-test claim. The legal-document browser regression also passed, separately from that unit count. Database-backed lifecycle suites were inspected but not rerun because their disposable database was removed. The default root `test` command does not discover all web tests: `apps/web/package.json` has no general `test` script. CI currently runs shared tests and lint, not the complete web regression suite.

## Architecture and technical health

This is a pnpm workspace: Next.js 16.4.6 App Router / React 19, a TypeScript shared package, SQL Server through Prisma 6.19.3, and Azure Blob Storage through the server. Tiptap is used for editorial work. Published revisions, not draft pointers or archived catalogs, supply public articles. Versioned graph and visual registries map validated data to developer-owned implementations; they do not execute content-supplied JSX or module paths.

Most content routes are dynamic and depend on SQL availability. Runtime `instrumentation.ts` waits for retention/erasure maintenance before startup and schedules it every minute. This requires a long-running Node service, a reachable migrated database and a durable private filesystem; a static-only host is incompatible. A serverless deployment requires a separate design for scheduled work, durable deletion journaling and database connections.

Seven migrations exist, from `20261018000000_init` through `20261124000000_article_foundation`. The latter adds revision ownership pointers, revision/media references and slug aliases; application services protect publication and immutable canonical slugs. SQL Server constraints and parameterized queries are used for concurrency-sensitive operations. Database availability, invalid publication fail-closed behavior, and restoring old backups all affect public content availability.

### All 139 lint errors

| File under `apps/web/tests` | Errors | Root cause / actual impact |
| --- | ---: | --- |
| `book-content-protection.mjs` | 68 | `no-undef`: Node/browser globals inside Node scripts and browser evaluation callbacks |
| `corporate-page.mjs` | 9 | Same environment configuration gap |
| `meeting-panel.mjs` | 27 | Same environment configuration gap |
| `privacy-browser.mjs` | 17 | Same environment configuration gap |
| `terms-of-use.mjs` | 17 | Same environment configuration gap |
| `privacy-storage.ts` | 1 | Unused `readFile` import |

There are 138 `no-undef` findings and one unused import. Reported symbols include `process`, `console`, `Buffer`, `URL`, `document`, `window`, `getComputedStyle`, DOM event constructors and timers. These are actual platform globals in their intended execution contexts; inspection did not identify a misspelled application identifier among them. The unused import has no demonstrated production effect. **The errors are nevertheless operationally significant:** `.github/workflows/deploy-web.yml` executes `pnpm lint` before building, so the configured delivery pipeline fails. Scope the lint environments to the relevant test files/callback execution contexts; do not globally disable undefined-variable checking or bypass CI. Finding F02.

### Corporate endpoint failure

H: `private/article-foundation/phase6-2026-11-24/corporate-known-failure.log` records failure at `tests/corporate-inquiries.test.ts:37`, expecting `{ok:true}` and receiving the generic error response. Its accompanying `known-debt-verification.json` says it ran only on an isolated database and removed its fixtures.

V: the test still assumes the earlier email-only endpoint: no database storage, all submitted details in the email, Reply-To set to the visitor, provider errors returned synchronously as 502. Current `api/corporate-inquiries/route.ts` first persists a private SQL inquiry, then schedules a minimal notification using Next `after()`, returning success for durable receipt. The test does not mock SQL or establish a Next request lifecycle. Its valid submissions can write to a configured database before `after()` throws outside request scope and is converted to 503 by the broad catch. Consequently, it is unsafe to rerun casually against local `.env`, and its expected contract is obsolete. `apps/web/docs/corporate-inquiries.md` repeats the obsolete behavior, including claims that no database or privacy-policy route exists.

This is not proof that live requests lose records. It is a missing reliable regression test for a launch-critical path. Replace the harness with isolated storage and a real request context, or explicit persistence/notification mocks, and test stored receipt, provider failure, retry, duplicate requests, restriction, erasure and privacy gates. Browser-only intercepted success does not verify storage or email. Finding F03.

### Privacy normalization drift

Read-only `prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script` emits only drop/re-add of `meeting_registrations_retentionExpiresAt_df`. SQL stores `(dateadd(month,(12),sysutcdatetime()))`; Prisma declares `DATEADD(month, 12, SYSUTCDATETIME())`. These express the same 12-month default. `services/meetings.ts` explicitly computes expiry from the meeting date, and meeting rescheduling updates it. This specific drift does not demonstrate incorrect retention dates, data loss or an unapplied migration. It can mislead future `migrate dev` workflows into destructive reset suggestions. Normalize deliberately and verify a clean disposable schema comparison; never reset production to silence it. Finding F21.

## Production tracing and sensitive artifacts

### What is established

V/H: Phase 6 `build.log` contains eight warnings in `src/server/privacy-files.ts`, at dynamic `path.resolve`, `path.join`, `readdir` and `stat` access around lines 6 and 42–46. Individual patterns match 13,524 or 27,002 files and warnings explicitly state that dynamic filesystem access traces the whole project. Import paths reach this code through both privacy actions and `instrumentation.ts`. `next.config.ts` sets workspace-wide `outputFileTracingRoot`, `output:'standalone'`, and no tracing exclusions.

H: `docs/article-phase6.md` explicitly records that the local `private/` tree was copied into `.next/article-tests/standalone`. `cache-cleanup.json` records removal of `.next/article-tests`, confirmed absent at audit entry. `build-verification.json` says compilation passed, no production server was started and the working database was untouched.

**Exact historical file membership cannot be recovered from the available evidence.** The original artifact and its `.nft.json` manifests were removed; the retained build summary/log does not provide a per-file artifact inventory. A present-day directory listing cannot prove the contents of yesterday's artifact. It would be inaccurate to claim a complete historical list, or to assert that local `.env` was excluded, on that basis. The precise archived artifact, if retained elsewhere, must be quarantined and inspected before closing the incident. No external artifact store or deployment account was accessed. Absence of deployment is a local handover assertion, not an independently verified cloud audit trail.

### Current private-file inventory, without contents

V: a metadata-only enumeration found 2,117 files under `apps/web/private`, approximately 2.01 GB in aggregate:

| Directory | Files | Bytes | Sensitivity / packaging implication |
| --- | ---: | ---: | --- |
| `article-foundation/` | 2,102 | 1,981,769,395 | Native encrypted SQL backups, encrypted all-table snapshots, manifests, comparisons, admin/editor screenshots, historical logs and audit evidence |
| `backups/` | 11 | 29,538,714 | Managed encrypted backups; must remain outside release artifacts |
| `logs/` | 4 | 111,924 | Application operational logs; must remain private |
| `erasures/` | 0 files | 0 | Directory exists; production ledger must be independent and durable |

Across this tree the metadata inventory counted 976 JSON files, 1,118 PNGs, 14 encrypted files, one Prisma file, two `.log` files, one hash file, one text file and four JSONL files. Filenames matching raw `.bak` or plaintext `database-before.json` were not found by the targeted scan. This is not a content-level certification that every JSON, screenshot or log contains no personal data. Encrypted backups remain sensitive even without their key; manifests and screenshots may disclose administrative and operational details. Backups were not decrypted and report text contains no credentials or private record contents.

The inventory is **current source-side evidence**, not the exact historical artifact list. New log appends and evidence creation can change counts. No private files were deleted or relocated in this audit.

### Transfer and exposure paths

- `.gitignore` excludes `apps/web/private`; Git tracked neither that directory nor `apps/web/.env` in the current index. Git exclusion is not a file-tracing exclusion.
- `.dockerignore` excludes `.env*` and logs, but **does not exclude `private`, audit evidence, tests or `output`**. `Dockerfile` uses `COPY . .`; a local image build therefore transfers private backups/evidence into its build context and build stage, even if the final stage later omits some of them. Image builders and caches are additional recipients.
- CI copies the entire standalone tree to `deploy`, uploads it with `include-hidden-files:true`, and deploys that directory. A clean GitHub checkout normally lacks ignored local private files, reducing that particular path. It does not make a contaminated local artifact safe, nor protect credentials injected into the CI workspace from broad tracing.
- Private files copied outside `public` are not automatically public URLs. A GET to a private path and a GET to `.env` are separate exposure checks, not proof that deployment recipients cannot read package contents. Deployment artifact readers, runtime operators, backups, host compromise and future static-server misconfiguration are exposure paths.
- Next standalone packaging may intentionally copy environment files for runtime loading. Never assume all `.env` omission follows from Git/Docker ignore rules. Require an explicit output manifest/secret scan and a build workspace containing only synthetic build configuration.

Prevention requires defense in depth: keep private runtime state outside the source/build tree; explicitly exclude private/evidence/env/cache/test material from tracing and container contexts; narrow dynamic tracing without breaking runtime operations; clean CI checkout; fail artifact assembly on forbidden paths/signatures; scan the actual zipped/uploaded package as well as `.nft.json`; restrict artifact retention/access; and prove an independently mounted ledger works after relocation and restore. F01 is a P0 blocker. Suppressing the eight warnings alone is not remediation.

The local Next output documentation, `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md`, confirms that tracing follows filesystem access and standalone copies traced files. It documents route-scoped `outputFileTracingExcludes`; verify the final package even after configuring those exclusions.

## Security review

### Existing controls

| Area | Verified control | Boundary / remaining concern |
| --- | --- | --- |
| Authentication | HMAC-SHA256 signed session; timing-safe signature check; expiry; database check for active user on each access | Seven-day bearer session; no central session revocation, MFA or login throttling |
| Passwords | Explicit bootstrap, bcrypt cost 12, new bootstrap password minimum 10 characters; create-only seed | No account management/reset/rotation flow visible; existing password strength not tested |
| Authorization | Admin panel requires user; privacy/meeting operations require active `admin` role | Only one active admin exists locally; no live editor-role exercise in this audit |
| Private previews | `requireUser()` before querying revision; revision constrained to post; private/no-store/noindex headers | Underlying uploaded images are deliberately public; private preview does not make media private |
| Article publication | Valid published pointer, status/date/kind/body/layout checks; invalid content fails closed; draft not used for public reads | New publication/recovery paths need isolated regression coverage in CI |
| HTML/XSS | Rich HTML sanitized on save/render; tags/attributes/schemes/CSS allowlists; React escaping; Markdown without raw HTML execution | External HTTP/HTTPS images are permitted in legacy HTML; privacy and mixed-content review needed for future editorial input |
| SQL injection | Prisma and tagged raw parameters for user values; backup identifiers validated and generated | Raw backup SQL restricted to local host; no demonstrated request-controlled SQL injection found |
| SSRF | Mail/Google targets fixed; media downloads by stored blob name; no user URL-fetch API identified | This is source review, not a complete adversarial/network pentest |
| Public form APIs | Exact-origin check, content-type check, streamed body limits, Zod validation, honeypots, bounded email-based maps | Process-local limits can be bypassed with new addresses/restarts/instances; no global abuse control |
| Upload | Authenticated user, 8 MiB file check, magic bytes for JPEG/PNG/WebP/GIF; SVG rejected | Multipart body parsed before size check; no explicit upload Origin check, decode/dimension bound or upload throttle |
| Media GET | Public opaque-ID lookup; private Blob container; nosniff; immutable cache | No published-content authorization: every uploaded image is public by design; buffers entire blob |
| Headers | nosniff, DENY framing, referrer policy, permissions restrictions; production HSTS; partial CSP | CSP lacks default/script policy; TLS/proxy/header delivery still E |
| CORS | No permissive CORS headers configured; form routes enforce origin | CORS is not CSRF protection; multipart upload route needs its own check |
| Logs/errors | Form errors generic; Prisma SQL logging disabled; OAuth callback excluded from dev request logs; local operational log uses allowlisted numeric fields | Platform/proxy logs and failure pages not proven safe in production |

`api/admin/calendar-test/*` and its page are development-only, require enablement, exact localhost host and admin access; mutation routes check origin, one-time state and session binding. OAuth uses PKCE/nonce and narrow scopes; tokens remain in memory and are not persisted. Tests exercise these controls with simulated providers. These routes are not production meeting automation. No live OAuth, event creation or cleanup was performed. Runtime production denial still needs verification against the exact release package. F22.

The cookie's Secure flag depends on `x-forwarded-proto`, not solely on production mode. This can be correct behind App Service TLS termination only if the proxy overwrites untrusted forwarding headers and HTTP is redirected/rejected. Signed user-ID sessions remain valid until expiry after a password change unless account deactivation or global secret rotation is used. Logout removes only the current browser cookie. F05.

Media UUID validation is looser than a strict UUID validator. Uploads are documented public; editors must not use the media library for private documents or sensitive draft graphics. CSP hardening should follow a tested inventory of inline script, Next and third-party requirements; dropping an untested strict policy into launch would risk breaking the site. F06/F07/F23.

## Privacy and personal-data architecture

V: introductory registrations store first/last name, email, phone and meeting reference; corporate inquiries store name, organization, email, phone, contact preference and message. Privacy tables support retention, restriction, holds, staff audit and external deletion tasks. `services/meetings.ts` serializes seat allocation with SQL locks and enforces unique meeting/email; corporate deduplication uses HMAC over normalized content and a ten-minute bucket. Public meeting JSON deliberately omits names, addresses and joining instructions.

The implemented 12-month rules match the documented anchors: meeting date and last recorded business communication respectively, using Tbilisi calendar months. Audit logs and independent erasure entries have 90-day cycles; managed encrypted backups have a 30-day cycle. Holds require a reason and future date; restricted records do not receive notifications. Row locks serialize notification with restriction/deletion. Erasure first writes the filesystem ledger, then database erasure/audit records and deletion. Filesystem/transaction atomicity and multi-instance coordination require staging failure testing; ledger replay deliberately favors continued erasure.

Admin rights operations include exact-email search, export, field correction, restrict/unrestrict, hold/release, contact timestamp and erasure. They require admin role and fresh confirmation. They do not establish requester identity, guardian authority, legal basis, response deadlines or staff training. No dedicated public automated rights request portal is required by this technical design; a monitored mailbox plus a documented verified manual procedure can be the launch workflow, subject to qualified legal approval.

Privacy documentation explicitly acknowledges external requirements. The six launch flags are attestations, not infrastructure setup. `productionPrivacyBlocked()` requires all six plus HTTPS `SITE_URL`, Resend key, two senders and admin address. Both production form APIs fail with 503 otherwise. Development bypasses this gate; local success must not be used as proof that production forms will work.

Local `.env` presence-only inspection found no configured site URL or email-provider/sender/admin settings, and launch approval false. This says nothing about inaccessible App Service settings. No values are printed. See F08–F13.

### Privacy implementation / documentation comparison

| Promise / component | Implemented | Unresolved production evidence |
| --- | --- | --- |
| Durable receipt before success | Corporate SQL upsert and meeting transaction | Real request integration, migrations, production SQL permissions and failover |
| 12-month erasure | Runtime maintenance; admin cleanup | Always-on/scheduler, alerting on failures, multi-instance behavior |
| 90-day logging | Privacy audit rows + managed `learntm-*.jsonl` only | Access/security/platform/mailbox/provider logs; actual account retention |
| 30-day backups | AES-256-GCM local helper; local-only Docker SQL guard; checksum verification | Azure backup/snapshot/version retention, separate keys, full isolated restore |
| No resurrection after restore | Independent filesystem ledger replay before startup maintenance | Durable external mount, independent backup, atomic restoration runbook, ledger survival across releases/slots |
| Provider/mailbox deletion | Receipt IDs and manual completion tasks | Operator identity, deletion process, mailbox copies and provider retention; no automated remote erasure |
| Rights handling | Admin search/export/correction/restriction/erase/holds | Monitored contact mailbox, identity/authority verification and rehearsed request handling |
| Google Maps | About iframe loads automatically; policy discloses it | Qualified review of lawful basis, device/cookie access, transfers and whether prior consent is required |
| Email processing | Resend endpoint; minimal admin links; participant address/content sent to provider | Processor terms/regions/retention, authenticated sending domain, delivery/bounce monitoring |

The local privacy backup helper does not enforce retention on `private/article-foundation/**`, arbitrary log files or historical evidence. It only prunes controlled filename patterns in managed directories. Phase 6 handover asks for backup retention review by 24 December 2026. This tree needs an explicit retention owner and inventory; it cannot be represented as covered by the automated 30-day cleanup. F12.

Technical findings are not legal conclusions. Qualified review is needed for the actual controller/contact identity, Georgian policy accuracy against practices, collection necessity, minors/representatives, notices/consent where applicable, transfer safeguards, retention exceptions, access rights and incident procedures. No legal compliance certification is given. Approved policy/editorial text was not rewritten.

## Public functionality and manual meeting operation

The public route inventory includes all six “რატომ TM?” destinations: `/stress-and-anxiety`, `/health`, `/brain-function`, `/relationships`, `/peace`, `/benefits`. Preserve them all. Also reviewed: homepage, introductory article, `/how-to-learn`, articles and scientific components, books/detail/seven reader URLs, corporate/about/FAQ, introductory registration, privacy policy and terms. Live results appear in the measurement addendum.

### Incomplete feature decisions

| Feature | Current state / source | Minimum safe launch decision |
| --- | --- | --- |
| Meeting side panel | `temporary-test-meetings.ts` enables four previews; `MeetingPanel` passes them instead of fetching SQL | **P0:** remove simulated path from public use or disable registration entry with an honest fallback; do not launch preview success as a real registration |
| Standalone registration | Uses real `/api/meetings`; local SQL contains zero meetings | Publish confirmed future schedules with joining instructions, or show truthful no-meetings/manual contact state |
| Calendar/Meet automation | Local test module only; no teacher integration/invitations/reminders | Defer; manually schedule, invite and reconcile; no automatic-invitation claims |
| Stored registration notifications | `after()` attempt and durable pending timestamps; manual retry controls | Named operator polls meetings/privacy inbox on a documented schedule and retries; check participant/admin receipt with authorized staging accounts |
| Corporate form | SQL receipt before asynchronous email; production launch gate; old test/docs | Complete production mail/privacy setup and request-level verification, or temporarily disable submission with a monitored contact alternative |
| Books | Seven `PREVIEW_BOOKS` always appended to real catalog | Remove samples from public catalog or make their unavailable status unmistakable without dead read actions; preserve approved real book and reader |
| About teachers | Two teacher slots with null names/photos/city/phone | Obtain approved genuine details or temporarily suppress incomplete slots; verify public phone/mail and factual address |
| Ayurveda | No dedicated route or published Ayurveda post found in current route/DB inventory | Owner confirms intended scope. Do not invent/rewrite content; defer a new page and avoid links/promises to a missing one |
| Social / contact | Facebook group, WhatsApp and mail/tel links defined in footer | Owner verifies ownership, destination and monitoring; URL shape alone does not prove availability |

### Can registrations operate manually?

**Yes, conditionally.** SQL storage, capacity/duplicate protection, private admin views, pending notification timestamps, retry controls and manually entered joining instructions support a limited manual service. Calendar automation is not a prerequisite. However, the current preview side panel bypasses all storage, so the present public experience is not ready.

Before enabling real registrations: confirm teacher, timezone, future schedule, location/Meet link and capacity; publish only confirmed meetings; remove previews; verify a real request reaches durable storage before success; give an operator daily and pre-meeting reconciliation responsibility; establish a maximum contact/invitation delay; manually issue invitations/reminders through approved channels; document reschedule/cancel/no-show handling; monitor pending admin and participant notification counts and bounce/delivery failures; test restrictions and deletion in staging; never place participant lists or personal joining links in public JSON or logs. The confirmation must accurately describe what has happened. A browser success state proves storage acceptance only, not inbox delivery or a Calendar invitation.

There is no automatic retry scheduler for notification failures in privacy maintenance. Manual retry is an available workaround, not unattended reliable delivery. On meeting updates, retention changes but prior notification timestamps are not reset; a manual operator must explicitly communicate changed dates or joining instructions. F09.

## Hosting and deployment requirements

| Component | Repository evidence | Actual state |
| --- | --- | --- |
| Web runtime | Standalone Node server, Node 22 Docker base, Prisma/OpenSSL, `PORT`/`HOSTNAME` | Local host Next dev verified; Azure App Service declared, account/runtime/start command unverified |
| SQL | SQL Server provider; Azure SQL intent; seven migrations | Local SQL Server Developer edition only verified; production database/network/user/TLS/encryption missing evidence |
| Persistent media | Private Blob container; server proxies immutable image IDs | Local Azurite configured; production account/container/region/credentials/restore not verified |
| Identity for storage | `env.ts` says managed identity; `storage.ts` explicitly throws without connection string | Managed identity not implemented. Supply least-privilege connection string securely or implement identity later |
| Secrets | `.env` ignored; CI database and publish-profile secret references | No secret values inspected in report; real secret store/rotation/permissions unverified |
| Domain/TLS | `SITE_URL` gate; public branding learnTM.ge | Domain ownership, canonical www policy, DNS, certificates, redirect and HTTPS-only settings not verified |
| Email | Resend, two sender settings, admin address | Local settings absent; provider/domain verification, SPF/DKIM/DMARC, inbox/bounces not verified |
| Administrator | Explicit create-only bootstrap | One local admin; production bootstrap/access recovery/MFA not verified; never run editorial seeds as startup |
| Retention/ledger | Startup + minute timer; filesystem state default relative to cwd | Need always-on service and durable private directory outside deployed source, separate from restored SQL |
| Backups | Local Docker helper and historical isolated restore evidence | Cloud backup encryption/retention, media recovery, keys, RPO/RTO and actual restore remain external |
| Delivery | GitHub Actions build → migrate → deploy on main push | Pipeline blocked by lint; no staging slot, release smoke, gated promotion or rollback runbook demonstrated |
| Monitoring | Generic application failure messages | No production health endpoint/alerting/delivery dashboards or responsible on-call owner demonstrated |

Do not expose local Next dev, SQL port 1434 or Azurite port 10010. Local defaults use privileged SA, emulator credentials and certificate-trust overrides intentionally; they are not production provisioning. SQL Server Developer edition is a local development choice, not evidence of a production license. Production Azure SQL should use verified TLS certificates and least-privilege runtime credentials, with a separate migration principal.

The workflow has `environment: production`, but repository source cannot prove branch protections, required reviewers, secret scopes or deployment approvals exist. Pushes to `main` trigger delivery. It applies migrations before deploying the app and has no automatic rollback; cancelling a run can leave schema ahead of code. Rehearse forward/backward compatibility, retain a known-good immutable release, and use staging/slot validation before public promotion. Database rollback must never mean casually overwriting newer editorial or registration records. F14/F15.

## Essential SEO

V: `<html lang="ka">` is correct. Pages have title metadata and many have descriptions; article metadata uses published revisions and preserves legacy overrides. Canonical aliases use permanent redirects and never resolve unpublished articles. There are no alias rows locally, so an actual redirect with a new alias was not created for this read-only audit.

Root `layout.tsx` does not set metadataBase. Corporate metadata uses a relative canonical; new article metadata can use relative image URLs, and a development-only host branch sets metadataBase for localhost. Production therefore risks localhost/default social URLs. Setting `SITE_URL` alone currently does not wire the root metadataBase. No sitemap/robots route or static equivalent was found in source. No JSON-LD implementation was identified by source search; missing structured data is a post-launch enhancement, not by itself a launch blocker.

Prelaunch `next.config.ts` adds global `X-Robots-Tag: noindex, nofollow` unless `PRIVACY_LAUNCH_APPROVED` is true. **Headers are generated into the build configuration.** The CI build supplies no approval flag; setting the flag only at runtime is insufficient evidence that the serialized headers allow indexing. Inspect actual production response headers after an approved rebuild. Keep draft/admin routes noindex/private, and preserve the deliberate noindex on legal routes unless the owner chooses otherwise. Noindex is not access control.

Minimum launch SEO: one verified production origin; correct metadataBase/canonical/social absolute URLs; redirects to the canonical host; accurate existing titles/descriptions; sitemap containing only valid published routes; clear robots policy; remove accidental global noindex only after launch approval; keep private routes protected; test alias redirects and 404 status. No keyword rewriting, new medical claims or full SEO campaign is required for this initial gate. F16/F17.

## Performance, accessibility and responsive behavior

Source review finds next/image use for several hero images with sizes/priority, self-hosted build-time Next Google fonts with `display:swap`, focusable skip links on site pages, labeled corporate/registration controls, status/alert feedback, modal focus trapping/Escape/restore behavior, keyboard handling for menus, and accessible data fallback for interactive article charts. Static graph text/alternative descriptions and approved geometry are preserved.

Important boundaries: native `<img>` remains in rich/article/graph content; image existence and a present alt attribute do not prove that the alternative text conveys the scientific result. The reader renders the entire published book on every reader URL, which is acceptable for the current seven pages but scales in HTML/payload/work. Reader copy/selection/print protection can affect assistive use; conduct a human screen-reader review. Automated layout checks do not verify contrast, reading order, zoom behavior, keyboard-only completeness or touch ergonomics.

No production/staging field Core Web Vitals dataset is available. Development route compile times, cold Next requests and automated local timings are **not** production LCP/INP/CLS. Obtain mobile Lighthouse/lab traces and field monitoring after a private staging release, measure hero loading/layout stability, critical client JS and SQL/Blob latency, and use a representative slow device/network. Do not claim a passing CWV score from these local checks. Inspect exact build chunks for editor/Calendar code accidentally entering public bundles and for artifact bloat; source separation alone is not a bundle measurement. F18/F19/F24.

## Findings register

Complexity: S = typically under a day of engineering; M = several days; L = multiple components/provider work. These are rough implementation scales, not commitments. External waiting time is additional. Every item below has a unique ID and a required closure check.

### F01 — P0 — Private material entered the standalone artifact

- **Evidence/status:** V/H; tracing analysis and inventory above; `next.config.ts`, `server/privacy-files.ts`, `.dockerignore`, `Dockerfile`, deployment workflow and Phase 6 build/cleanup logs.
- **Risk/impact:** private backups/evidence/secrets may be transferred to builders, artifact recipients or runtime. No confirmed public URL breach established. Exact historical membership remains U.
- **Recommendation:** isolate runtime state; fix tracing/context boundaries; inspect/quarantine any retained contaminated releases and assess credential rotation based on actual membership/recipients; require denylist/secret checks of the final package.
- **Dependencies/complexity:** release owner + artifact access + private storage architecture; L.
- **Temporary safe workaround:** clean isolated build workspace containing no real private files/secrets, explicit final-package inspection and restricted artifacts; never reuse the prior bundle.
- **Required verification:** exact final artifact manifest contains no env/key/backup/ledger/log/evidence/test material; relocated standalone works; runtime private storage remains external; historical distribution investigated and recorded.

### F02 — P1 — Repository lint blocks the configured release pipeline

- **Evidence/status:** V; 139 errors in the six listed tests; workflow `pnpm lint` step.
- **Risk/impact:** normal deployment cannot complete; blanket suppression would hide future real undefined identifiers.
- **Recommendation:** scoped environment globals and remove unused import; keep the gate.
- **Dependencies/complexity:** none; S.
- **Workaround:** no need to bypass; repair is small. A fully documented alternative release process would still require equivalent verification.
- **Verification:** root lint returns zero with no broad disabling; browser tests still execute in correct contexts.

### F03 — P1 — Corporate regression test and operational guide describe the wrong system

- **Evidence/status:** V/H; `tests/corporate-inquiries.test.ts`, `docs/corporate-inquiries.md`, current route/services/notification code and retained failure log.
- **Risk/impact:** test may insert fixtures before failing; persistence/delivery regressions are not reliably detected; operators may believe there is no stored data.
- **Recommendation:** isolated request-level test/mocks and update the guide to durable receipt + pending notification semantics.
- **Dependencies/complexity:** isolated test SQL/request harness; M.
- **Workaround:** authorized staging end-to-end checks and a written manual procedure; never rerun this test against working data.
- **Verification:** success persists exactly once; delivery failure stays pending without false loss; no PII in admin email; retry/restriction/erasure and launch gates pass; fixtures isolated.

### F04 — P0 — Public meeting panel simulates successful registrations

- **Evidence/status:** V; `TEMPORARY_MEETING_PREVIEW_ENABLED=true`, `MeetingPanel`, `RegistrationForm` temporary branch; SQL has zero meetings.
- **Risk/impact:** users can submit contact details in the UI without any registration reaching staff; side panel and standalone route disagree.
- **Recommendation:** disable previews and supply confirmed schedules, or disable registration with a truthful manual-contact alternative.
- **Dependencies/complexity:** owner/teacher schedule decision; S–M.
- **Workaround:** honest contact-only/no-open-meeting experience; do not preserve simulated success in production.
- **Verification:** all entry points use the same real availability; no simulated success path; staging receipt is durable; no lost registrations.

### F05 — P1 — Administrator authentication needs an enforceable production boundary

- **Evidence/status:** V; `server/auth.ts`, login actions; no throttle/MFA/session store; Secure relies on forwarding header.
- **Risk/impact:** brute-force/credential stuffing; stolen seven-day sessions cannot be individually revoked; insecure proxy deployment could weaken cookie protection.
- **Recommendation:** edge or shared login throttling, MFA/access gateway, secure trusted proxy, documented recovery/revocation and strong unique admin password.
- **Dependencies/complexity:** chosen hosting/identity boundary; M.
- **Workaround:** restrict `/admin` and admin APIs/actions to an owner-controlled VPN/access gateway with MFA and trusted TLS, while allowing public content; verify action endpoints too.
- **Verification:** bounded failed login attempts across instances, unauthorized roles denied, HTTPS Secure/HttpOnly/SameSite cookie, deactivation/revocation/recovery exercised in staging.

### F06 — P1 — Upload CSRF and request resource limits are incomplete

- **Evidence/status:** V; `api/admin/media/route.ts` authenticates but lacks an explicit Origin check and calls `formData()` before the file-size limit.
- **Risk/impact:** same-site sibling-origin multipart submissions and oversized multipart traffic require defenses; memory/storage exhaustion. Ordinary cross-site POST is partially constrained by SameSite=Lax, not a complete guarantee.
- **Recommendation:** same-origin/CSRF check; trusted edge request-body/upload rate limits; bound decoded image dimensions and handle malformed data/errors.
- **Dependencies/complexity:** proxy limits + staging upload tests; M.
- **Workaround:** authenticated admin gateway and strict body/size/rate limits at the edge.
- **Verification:** cross-origin authenticated upload rejected, oversized requests rejected before buffering, corrupt/huge-dimension files handled safely; legitimate editor uploads preserved.

### F07 — P1 — All uploaded media is public, including draft-linked media

- **Evidence/status:** V; `api/media/[id]/route.ts`, `Media` schema, upload documentation.
- **Risk/impact:** private preview protects article bodies, not opaque image URLs; sensitive draft uploads may be shared/cached publicly for a year.
- **Recommendation:** document public-media-only editorial policy; add private storage/authorization if confidential media is required.
- **Dependencies/complexity:** editorial policy S; private-media feature M–L.
- **Workaround:** prohibit sensitive/private uploads and review existing media; local media table currently empty.
- **Verification:** staff understand boundary; final release has no confidential assets; if privacy is added, anonymous/draft/cache tests prove it.

### F08 — P0 — Production privacy/collection prerequisites are not evidenced

- **Evidence/status:** V/E; `privacyLaunchBlockers()`, production API gates, `docs/privacy-prelaunch.md`; local flags/settings incomplete.
- **Risk/impact:** forms fail closed with 503; blindly enabling flags would claim controls that have not been configured. External storage/processor/rights safeguards unverified.
- **Recommendation:** complete privacy checklist and qualified review; only then attest flags and enable collection.
- **Dependencies/complexity:** F10–F15, controller/qualified reviewer/provider accounts; L.
- **Workaround:** no-data-collection launch only if forms are honestly disabled, monitored contact is approved and hosting/Maps/logging issues resolved. Flags must not be falsified.
- **Verification:** all actual controls and documents match; production gate tests fail closed when a requirement is removed and succeed only with approved settings.

### F09 — P1 — Manual notification operations are necessary and not yet assigned

- **Evidence/status:** V/E; meeting/corporate notification code, `after()`, admin retry actions; no retry scheduler/bounce webhook; meeting edits retain notification timestamps.
- **Risk/impact:** stored records can remain unmonitored; mail acceptance is mistaken for delivery; reschedules may not be communicated.
- **Recommendation:** named staff, polling/reconciliation schedule, pending queue alerts, manual retry/invite/reschedule checklist and accurate confirmations.
- **Dependencies/complexity:** F04/F10, owner staffing; S–M.
- **Workaround:** documented manual operator with backup coverage and daily/pre-meeting reconciliation.
- **Verification:** simulate failed/delayed mail and reschedule; staff locate pending records, contact participant and reconcile without duplicates or PII exposure.

### F10 — P1 — Production email and policy contact mailbox need validation

- **Evidence/status:** V/E; notification-email helper and launch gate; local mail settings absent; `info@learntm.ge` displayed publicly.
- **Risk/impact:** undelivered inquiries/confirmations/rights requests and spoofable mail; forms blocked unless settings exist.
- **Recommendation:** verify Resend sender/domain, SPF/DKIM/DMARC, sender/admin addresses, monitored contact mailbox, delivery/bounce/retention/deletion process.
- **Dependencies/complexity:** domain/mail provider account access; M plus DNS propagation.
- **Workaround:** approved contact-only workflow; current gates require mail configuration if forms remain enabled.
- **Verification:** authorized staging participant/admin mail received, spam/bounce path handled, inbox ownership/coverage and deletion recorded. Do not use real visitor data as fixtures.

### F11 — P0 — Durable independent erasure storage and production recovery are unproven

- **Evidence/status:** V/E; relative `private` default, filesystem erasure ledger, startup replay, deployment replaces app directory; local helper refuses remote SQL.
- **Risk/impact:** ephemeral/multiple hosts or a restore can lose deletion ledger and resurrect erased records; cloud backup retention/keys/recovery unverified.
- **Recommendation:** durable private mount outside release tree; shared/serialized ledger strategy; independent retention/backup/key permissions; actual SQL + media + ledger restore rehearsal with RPO/RTO.
- **Dependencies/complexity:** hosting/storage/backup owner; L.
- **Workaround:** single controlled instance with proven durable mounted storage and documented independent ledger/restore procedure; not an ephemeral deploy folder.
- **Verification:** deploy/restart/slot/restore retain ledger; erased synthetic record never reappears; encryption/key recovery/media restoration work; production backups expire as approved.

### F12 — P1 — Historical backups/evidence fall outside managed retention

- **Evidence/status:** V/H; private metadata inventory; `prunePrivacyFiles()` manages only named backup/log patterns; Phase 6 retention review date.
- **Risk/impact:** roughly 2 GB of snapshots/screenshots/evidence can persist beyond documented cycles or enter packages.
- **Recommendation:** classify artifacts, owner-approved retention/expiry and access controls; keep required recovery material encrypted and separate; do not delete during audit.
- **Dependencies/complexity:** owner records/recovery decision; M.
- **Workaround:** restricted quarantine outside build/deploy paths with explicit expiry owner.
- **Verification:** inventory has retention basis/expiry and access owner; expired material handled through approved process; packaging scan excludes all evidence.

### F13 — P1 — Maps and legal/processor decisions remain open

- **Evidence/status:** V/E; About Google iframe, policy disclosure, privacy checklist.
- **Risk/impact:** third-party connection starts without a consent gate; disclosure alone does not establish lawful basis; rights/minor/controller procedures need human judgment.
- **Recommendation:** qualified review of real practices, processors/regions/transfers, collection notices, contact identity and Maps requirements.
- **Dependencies/complexity:** controller + qualified adviser/provider information; M, external timing unknown.
- **Workaround:** if approved, replace automatic embed with an ordinary external link/consent gate in a separately authorized change; do not assume a banner is required or sufficient.
- **Verification:** signed decision and matching behavior; no pre-consent external request where prior consent is required; rights procedure rehearsed.

### F14 — P0 — Production infrastructure and isolation have not been verified

- **Evidence/status:** V/E; Docker/CI configuration, `.env.example`, storage implementation.
- **Risk/impact:** missing SQL/media/HTTPS/secrets can prevent startup or content/media access; development privileges/defaults unsuitable for public service.
- **Recommendation:** provision/verify production Node runtime, Azure SQL/Blob, TLS/network/least privilege, region, durable storage, secrets, separate staging, domain and monitoring.
- **Dependencies/complexity:** owner cloud/domain accounts and budget; L.
- **Workaround:** none for an actual public service; private staging only. No paid resources provisioned here.
- **Verification:** exact release boots from a clean host, reads migrated content/media, survives restart, rejects HTTP/untrusted access and has no local defaults.

### F15 — P1 — Delivery lacks demonstrated gated promotion and rollback

- **Evidence/status:** V/E; main push workflow, build→migrate→deploy, no staging/smoke/rollback steps; environment protections unknown.
- **Risk/impact:** accidental release, schema/code mismatch or failed deployment can interrupt public service; cancel-in-progress can leave migrations ahead.
- **Recommendation:** verify protected approvals; stage immutable package, migration compatibility, smoke checks and monitored promotion; retain previous package and explicit rollback/restore decision tree.
- **Dependencies/complexity:** F01/F02/F14; M–L.
- **Workaround:** protected manual release with equivalent reviewed gates and rehearsal; never a blind main push.
- **Verification:** unauthorized change cannot deploy; failed staging never promotes; previous release restored without overwriting newer records; schema compatibility confirmed.

### F16 — P1 — Production URL metadata is not wired correctly

- **Evidence/status:** V; root layout lacks metadataBase; corporate relative canonical; article relative social images/development host fallback.
- **Risk/impact:** wrong localhost/default canonical/social URLs and inconsistent indexing/sharing.
- **Recommendation:** verified origin supplies root metadataBase, canonical policy and social URLs without changing editorial copy.
- **Dependencies/complexity:** owner canonical domain decision; S–M.
- **Workaround:** keep staging private/noindex; public launch should have correct origin metadata.
- **Verification:** actual production HTML on all public page types contains intended HTTPS canonical/social URLs and correct existing titles/descriptions; no localhost strings.

### F17 — P1 — Indexing release gate, sitemap and robots need explicit completion

- **Evidence/status:** V; build-time `headers()` conditional, CI build omits approval flag, no source sitemap/robots implementation.
- **Risk/impact:** approved launch may remain globally noindex; missing discovery controls and duplicate reader URLs complicate crawl behavior.
- **Recommendation:** deliberate approved build/indexing transition; sitemap of valid published routes, robots policy, canonical reader strategy; keep admin/drafts protected/noindex.
- **Dependencies/complexity:** F08/F16, owner indexing approval; S–M.
- **Workaround:** intentionally unindexed soft launch with documented owner acceptance and correct URLs, followed promptly by indexing release; not an accidental flag mismatch.
- **Verification:** HTTP headers and HTML on final deployment agree; sitemap URLs resolve, no drafts/admin included; removed/scheduled/alias behavior correct.

### F18 — P1 — Mandatory staging performance and accessibility checks remain

- **Evidence/status:** V/U/E; local/browser checks below; no production CWV or human assistive-technology evidence.
- **Risk/impact:** environment-specific broken layout, inaccessible critical forms or poor mobile load may remain undetected.
- **Recommendation:** staging mobile/desktop lab tests, keyboard/screen reader/zoom/contrast review of navigation, dialogs, forms, reader and scientific graphics; fix critical usability defects only.
- **Dependencies/complexity:** exact staged package + human review; M.
- **Workaround:** no blanket waiver for inaccessible core tasks; non-critical performance tuning may follow launch if measured and accepted.
- **Verification:** critical journeys usable at 360/390/768/1440, zoom and keyboard; no critical automated a11y violations; measurements labeled lab/field accurately.

### F19 — P2 — Catalog reads and full-book delivery have scaling costs

- **Evidence/status:** V; article catalog loads/validates published revisions per request; reader sends all pages per URL.
- **Risk/impact:** larger content/traffic increases SQL, parsing, HTML and hydration costs; current small inventory does not prove scale failure.
- **Recommendation:** measure staging, then add appropriate cache/pagination/reader loading while preserving publication privacy and URLs.
- **Dependencies/complexity:** performance baseline; M.
- **Workaround:** modest monitored launch with SQL capacity/headroom and current content size.
- **Verification:** representative traffic/content-size load test and bundle/response metrics; draft/caching isolation retained.

### F20 — P1 — Dependency advisories require reachability-based remediation

- **Evidence/status:** V; fresh lockfile audit, detailed table below.
- **Risk/impact:** CI/tooling code execution/DoS advisories and a production XML parser DoS; not ten proven unauthenticated website vulnerabilities.
- **Recommendation:** reviewed compatible patches/toolchain upgrades; inspect actual standalone module inventory and inbound reachability; retain lockfile and regression gates.
- **Dependencies/complexity:** F01/F03, supported tool versions; M.
- **Workaround:** exclude dev/CLI tooling from runtime, no untrusted test/mocker servers or config/input; document remaining low-risk parser exposure and fixed upgrade date. Critical tooling advisories cannot be dismissed solely because they are dev dependencies.
- **Verification:** fresh full/prod audit, clean install/build/test, final runtime manifest, no vulnerable reachable path; recorded exceptions justify scope and expiry.

### F21 — P2 — SQL retention-default normalization drift

- **Evidence/status:** V; read-only diff and normalized default above.
- **Risk/impact:** migration noise/reset risk, not a verified change in retention behavior.
- **Recommendation:** normalize representation through an isolated, reviewed migration/schema strategy.
- **Dependencies/complexity:** SQL/Prisma compatibility; S–M.
- **Workaround:** use reviewed `migrate deploy`; never reset; document the exact known diff.
- **Verification:** clean schema diff and new-database migration chain; explicit meeting-date/reschedule retention tests remain correct.

### F22 — P2 — Local Calendar test tooling remains in production source

- **Evidence/status:** V; development flag/host/admin gates; simulated tests pass.
- **Risk/impact:** unnecessary runtime/maintenance surface and accidental future weakening; no demonstrated production access in current code.
- **Recommendation:** preserve dev-only gates; exclude unnecessary test tooling from package where safe; keep complete automation as a separate post-launch project.
- **Dependencies/complexity:** release manifest and staging; S–M.
- **Workaround:** disabled flags + verified production 404s; no Google test credentials in production.
- **Verification:** every Calendar test page/API inaccessible in production even with enablement flag; no tokens/secrets in browser/logs/artifact.

### F23 — P2 — Security headers/media input can be hardened further

- **Evidence/status:** V; partial CSP, HTTP(S) external legacy images, permissive media-ID regex.
- **Risk/impact:** less browser defense in depth; malformed IDs may cause server errors; future third-party images can create privacy/mixed-content issues.
- **Recommendation:** stricter UUID parsing, controlled external image policy, tested CSP/reporting, error handling and edge caching/resource limits.
- **Dependencies/complexity:** compatibility inventory; M.
- **Workaround:** trusted editors, reviewed public assets, existing sanitizer/headers, staging error monitoring.
- **Verification:** malformed IDs return safe 404; malicious content stays sanitized; CSP does not break visuals/forms/Next; no uncontrolled external asset loads.

### F24 — P2 — Comprehensive web regression coverage is not in CI

- **Evidence/status:** V; shared-only test step, no general web test script, isolated suites depend on historical manifests/disposable restores.
- **Risk/impact:** successful CI would not prove publication/privacy/form/reader behavior or production bundle correctness.
- **Recommendation:** explicit non-mutating unit suite + freshly isolated DB integration suite + small public browser/packaging smoke in CI; do not restore historical test databases on production.
- **Dependencies/complexity:** F03/F15, disposable SQL/media; M–L.
- **Workaround:** documented pre-release manual execution of equivalent staging checks for initial release.
- **Verification:** gates detect a deliberate safe failure in each critical area and never target live data.

### F25 — P1 — Public samples and teacher placeholders need an owner decision

- **Evidence/status:** V; unconditional `PREVIEW_BOOKS` append; About null teacher slots; site contact comment says placeholder.
- **Risk/impact:** apparent catalog content may be unavailable; unfinished identity/contact presentation undermines trust and may misdirect inquiries.
- **Recommendation:** owner approves real contact/teacher information; suppress clearly unfinished samples while preserving real book/content/design baseline.
- **Dependencies/complexity:** owner-approved factual details; S–M.
- **Workaround:** temporarily omit unready sample cards/teacher slots with approval, retaining functioning contact and real catalog.
- **Verification:** no unavailable sample read actions; real reader still works; all public contacts owned/monitored and teacher details approved.

### F26 — P2 — Ayurveda is not currently an implemented public destination

- **Evidence/status:** V/E; route files and four published posts contain no dedicated Ayurveda destination; HTTP check below.
- **Risk/impact:** launch scope mismatch if owner expects that section; no evidence authorizes inventing approved content.
- **Recommendation:** confirm scope and intended approved source; schedule a separate page only if required.
- **Dependencies/complexity:** owner/editorial decision; implementation estimate U until source/scope agreed.
- **Workaround:** defer and avoid links to a missing destination; do not remove other approved pages.
- **Verification:** public navigation makes no false promise; any later approved page passes content/URL/layout checks.

### F27 — P3 — Structured data and broader SEO strategy are deferred

- **Evidence/status:** V; no JSON-LD implementation found; full SEO campaign out of current scope.
- **Risk/impact:** missed search enhancement opportunities, not a safety failure.
- **Recommendation:** post-launch entity/article/book schema, search-console ownership, content inventory, crawl review and performance-led SEO; validate claims/editorial approval.
- **Dependencies/complexity:** stable domain/published inventory; M.
- **Workaround:** launch with correct basic metadata/crawl behavior.
- **Verification:** schema validators, search reports, no private/draft data or unsupported claims in structured data.

### F28 — P1 — Public API abuse prevention is process-local and identity-rotatable

- **Evidence/status:** V; corporate map allows five attempts per normalized email per ten minutes; meeting map allows eight; both bounded at 10,000 keys. No trusted edge/shared limit is provisioned in repository evidence.
- **Risk/impact:** callers can rotate addresses, restart/scale boundaries reset limits, and database/notification work can be exhausted. Origin headers and honeypots are not bot identity verification.
- **Recommendation:** edge/shared rate limits with trusted client identification, bounded request/concurrency budgets, spam monitoring and escalation; preserve retry/idempotency semantics.
- **Dependencies/complexity:** production proxy/platform and F09 monitoring; M.
- **Workaround:** single controlled instance behind tested edge limits, modest registration scope and staffed monitoring; email-only maps alone are insufficient.
- **Verification:** controlled staging abuse checks across processes/identities hit configured budgets without losing legitimate retried submissions or exposing personal data.

### F29 — P2 — Privacy documentation's stored fingerprint is stale

- **Evidence/status:** V; `docs/privacy-prelaunch.md` records a policy fingerprint beginning `b1ab3999`; current `tests/terms-of-use.mjs` verifies the policy against a different fingerprint beginning `be1de859`, and that test passed during this audit.
- **Risk/impact:** future preservation checks may report false editorial drift or rely on the wrong approval record. This does not prove the current text was changed without approval.
- **Recommendation:** reconcile the authoritative approved version/history with the documentation and test baseline; update evidence references only after that review, without rewriting legal text.
- **Dependencies/complexity:** owner-approved policy provenance; S.
- **Workaround:** use the current passing preservation test plus explicit human approval, recording the documentation discrepancy.
- **Verification:** documentation, approval evidence and test fingerprint identify the same approved policy bytes.

## Dependency details and support status

Audit results are registry observations on the audit date; recheck immediately before release. There were no reported Next.js/React advisories in this scan, which is not a guarantee of no vulnerabilities.

| Package / installed | Advisory / severity | Path and actual context | Reported patched range |
| --- | --- | --- | --- |
| `tinypool` 1.1.1 | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3), critical; [GHSA-85c8-ppgw-ccpr](https://github.com/tinylibs/tinypool/security/advisories/GHSA-85c8-ppgw-ccpr), critical | Vitest worker options/prototype-pollution gadget; test tooling, not a public route; requires relevant attacker-controlled options/pollution preconditions | >=2.1.1 / >=2.1.2 respectively |
| `deepmerge-ts` 7.1.5 | [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx), high | Prisma CLI config dependency; recursive-object stack exhaustion; manifest lists Prisma as dev tooling but production-filter audit still reports transitive path | >=8.0.0 |
| `effect` 3.21.0 | [GHSA-7589-6fvf-x4pw](https://github.com/Effect-TS/effect/security/advisories/GHSA-7589-6fvf-x4pw), high | Prisma config dependency; TemplateLiteral schema regex ReDoS; no public request import identified | >=3.22.1 |
| `vitest` / `@vitest/mocker` 3.2.7 | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), moderate (two package advisories) | Shared-package test/mock server path traversal/file read; do not expose tooling servers | >=4.1.11 |
| `@vitest/mocker` 3.2.7 | [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), moderate | Unauthenticated mock registration/code injection in affected tooling context | >=4.1.12 |
| `postcss-selector-parser` 6.0.10 | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf), moderate | Tailwind typography build-time selector parsing; no user-submitted CSS path identified | >=6.1.5 |
| `minimatch` 10.2.6 | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), moderate | TypeScript ESLint tooling glob amplification | >=11.0.1 |
| `fast-xml-parser` 5.11.2 | [GHSA-474x-hrwr-fgx4](https://github.com/advisories/GHSA-474x-hrwr-fgx4), low | Azure Blob SDK/core-xml runtime dependency; malformed XML CPU consumption; no direct visitor XML upload/parser route found | >=5.12.0 |

Do not force major transitive versions with an untested override merely to make the audit green. Advisory count is not unique vulnerable package count and full/prod counts must not be added together.

Lockfile deprecation notices identify root ESLint 9.39.5 as unsupported and `node-domexception` 1.0.0 as replaced by the native platform implementation. A deprecation is distinct from a demonstrated public exploit; update the toolchain compatibly rather than suppressing checks. Node 22 is an LTS line according to the [official Node release page](https://nodejs.org/en/about/previous-releases), but the floating Docker tag does not prove a specific patched image or digest. Root `engines` allows any Node >=22, including non-LTS versions; pin/test production runtime explicitly. Next's [support policy](https://nextjs.org/support-policy) calls for Active/Maintenance LTS releases; revalidate the exact release/patch at deployment. Prisma 6 is behind the CLI's advertised new major, but an update notification alone does not establish end of support; obtain an explicit vendor support/upgrade decision. These maintenance actions belong to F20 and F24, with compatibility verification.

## Closure and measurement addendum

The paired [action plan](prelaunch-action-plan.md) defines the minimum launch scope, ordered gates, owner decisions and go/no-go checklist. The audit does not authorize any fix or deployment. Approval of a launch date does not close a technical finding without its required verification.

### Fresh build: passed, packaging still unsafe without remediation

The clean isolated snapshot completed `prisma generate` and **`next build` with exit 0**, using the existing frozen lockfile and synthetic settings. Compilation took approximately 2.5 minutes; the build's TypeScript phase passed and generated 33 static outputs. This proves compilation without a working-data connection; it does not prove production startup, live dynamic SQL/Blob behavior or portable Linux/Azure packaging.

The first snapshot attempt used dependency junctions pointing outside its tracing root and failed to resolve `next/package.json`. That was an audit isolation setup failure, not a repository compilation failure. Installing the same locked dependencies offline inside the snapshot corrected the setup; application source/configuration were unchanged.

The final sanitized build emitted **five** dynamic-filesystem warnings at `privacy-files.ts:6:21`, `42:20`, `44:30`, `46:22`, `46:63`. The earlier Phase 6 build emitted **eight**, including additional broad-pattern warnings in the larger original workspace. Thus the eight historical warnings are verified from retained logs; they should not be confused with the new five-warning count. Both identify the same unresolved dynamic tracing root cause. The final build also explicitly warned that metadataBase was missing and social-image resolution fell back to `http://localhost:3000`.

A metadata-only enumeration of the new standalone output counted **2,749 regular files / 204,613,686 bytes**, excluding symlink traversal and before adding deployment copies of public/static assets. It contained **71 paths under app docs/scripts/tests**, including archived article fixtures, backup/recovery/cleanup utilities and browser/unit tests. These are not required public product content and establish that broad packaging persists even with all real private files removed from the input. The forbidden-path scan found zero actual private/env/backup paths in this sanitized output, as expected because those inputs had been excluded; this is **not** proof the unchanged build would exclude them from an ordinary working checkout. No private records were copied into this new audit package.

Across the build, 39 static JavaScript files total **1,912,103 bytes** uncompressed. The largest is **625,417 bytes**, about **191,259 bytes gzip**. These are whole-build figures, including admin/editor chunks, **not** homepage transfer or evidence that editor code loads on a public route. A production network/route-chunk attribution check remains required under F18/F19/F24. The measured standalone size is not a production download size or CWV score.

The generated `routes-manifest.json` contains the global `X-Robots-Tag: noindex, nofollow` and production HSTS. This directly verifies F17's build-time-header concern; final approved deployment must be checked again after its intended indexing configuration.

### Fresh local public-page coverage

Every route below returned 200 at **1440, 768 and 390 pixels** (84 views). The browser scrolled each page to exercise lazy images. There was no detected document-width overflow, no rendered broken image, no image missing its alt attribute and no JavaScript `pageerror` event in these views. External requests were blocked in this browser context to avoid transmitting data to third parties; Google Maps/provider availability was therefore not tested. This was a Chromium/Chrome local development smoke, not exhaustive cross-browser, screenshot-diff, contrast or screen-reader certification.

| Public feature | Routes checked |
| --- | --- |
| Homepage | `/` |
| Every “რატომ TM?” page | `/benefits`, `/stress-and-anxiety`, `/health`, `/brain-function`, `/relationships`, `/peace` |
| How to learn / articles | `/how-to-learn`, `/blog` |
| Introductory evergreen article | `/blog/ra-aris-transtsendentuli-meditatsia` |
| Existing article/scientific layouts | `/blog/meditatsia-uketesi-dzilistvis`, `/blog/meditatsia-stresis-shesamtsireblad`, `/blog/gulis-janmrteloba-da-meditatsia` |
| Books | `/books`, `/books/simshvidis-gza` |
| Entire current reader URL inventory | `/books/simshvidis-gza/1` through `/books/simshvidis-gza/7` |
| Corporate / about / FAQ | `/organizaciebitvis`, `/about`, `/faq` |
| Meeting / legal fallbacks | `/introductory-meeting`, `/privacy-policy`, `/terms-of-use` |

All 23 distinct discovered internal page-link targets returned 200. That is a page-link sample, not verification of every external citation/social destination or in-page anchor. Current canonical metadata appeared only on the corporate page in this inventory; all 28 views had zero JSON-LD scripts. The seven reader URLs had no `h1`, a heading-structure review item under F18, not an automatic finding of unusability. The other 21 routes each had one `h1`. A mobile homepage screenshot was visually inspected and showed the existing layout rendering, without claiming a complete visual-baseline comparison.

Fourteen additional checks passed: desktop dropdown and mobile menu open/Escape behavior; privacy and terms dialogs at both widths with keyboard focus contained and Escape closure; meeting preview panel at both widths; native FAQ disclosure open/close; corporate invalid-email/error/retained-input/success states; meeting empty/error/open registration states; and final private-directory URL denial. All four valid form POSTs in this interaction probe were intercepted in the browser and never reached SQL/mail. An initial probe used incorrect selectors (a conditional aria-controls attribute, a native disclosure mistaken for a button, and an unscoped alert); those were corrected in the temporary test only. They were harness failures, not application fixes.

The existing `node tests/terms-of-use.mjs` regression also passed: exact nine-section Terms, current policy fingerprint, modal centering at 360/390/768/1440, keyboard opening, focus/scroll/Escape/backdrop/close, nested privacy dialog and focus restoration, direct URL and contact-link checks. This confirms the current legal-text test baseline; it does not establish legal sufficiency or reconcile the older documentation fingerprint (F29).

### Safe HTTP/security probes

| Probe | Result |
| --- | --- |
| `/robots.txt`, `/sitemap.xml`, `/ayurveda`, unknown route | 404 |
| `/api/meetings` | 200; real current data is empty; no-store |
| Anonymous `/admin`, `/admin/privacy`, `/admin/posts`, `/admin/meetings`, private article preview | 307 to `/admin/login`, no-store |
| Anonymous Calendar runtime test API | 401 in this enabled local development environment, private/no-store; production denial still requires release verification |
| `/.env`, `/private/backups` | 404; slash variant first redirects to the latter URL. This does not certify private artifact safety |
| Malformed short media ID | 404 |
| 36-hyphen media ID | **500**, confirming the permissive-ID validation/error-handling issue in F23; response content was not reproduced |
| Cross-origin POST to corporate / meeting APIs | 403 for each |
| Empty invalid input / malformed JSON to both public form APIs | 400 for each; no valid data submitted |

Local site responses included nosniff, frame protection, referrer/permissions policies, partial CSP and prelaunch noindex. No authenticated login, brute-force flood, real upload, live mail, real Google test or destructive privacy request was performed. An additional limited source-tree signature scan found no matching PEM private-key/AWS-access-key/GitHub-token/OpenAI-project-key patterns; it excluded env/private/build/dependency trees and did not inspect Git history. This narrow result is not a full secret-scanning certification and does not close F01.

The normal local homepage was checked again after verification and returned 200. Final Git status adds only the two requested reports relative to the audit-entry baseline; the pre-existing stray-file deletion remains. The audit stops here for owner review.
