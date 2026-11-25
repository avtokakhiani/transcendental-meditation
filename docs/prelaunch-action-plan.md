# learnTM.ge minimum safe launch action plan

Prepared 25 November 2026, Asia/Tbilisi. Read with [the complete audit](prelaunch-readiness-audit.md), especially its evidence labels and final measurements.

## 1. Current assessment

**NO-GO in the present state.** The website and article system work locally, but production security, packaging, privacy operations, infrastructure and collection workflows have open gates. Compilation and a locally functioning page do not close those gates.

Original audit baseline: both TypeScript projects passed; 60 safe unit tests passed (six target historical recommendation helpers); all seven local migrations were applied; a clean isolated production build passed; all 28 existing public routes returned 200 across desktop/tablet/mobile, and 14 additional interaction checks plus the legal-document browser regression passed. Published article delivery was separate from drafts. There were 139 lint errors blocking the configured release workflow. The corporate unit test was stale and unsafe to run against working data. Prior build evidence confirmed private-directory inclusion; the original contaminated artifact was removed and its exact historical membership was no longer recoverable from local manifests. The audit's sanitized bundle still included 71 unnecessary app documentation/test/script paths and emitted five tracing warnings; the prior build emitted eight. See the implementation update below for current F01 evidence.

No launch date was provided. The owner must supply the predetermined date and timezone, staffing coverage and fallback decision. Work below is ordered by dependency, not assigned fictional calendar dates. If mandatory verification cannot finish before that date, move the launch or adopt an explicitly approved reduced scope that satisfies the same safety gates.

The audit originally authorized documentation only. The subsequent implementation request authorizes local remediation of F01, verified backups and testing, followed by a stop before the next independent blocker. It does not authorize deployment, purchases, DNS changes, content rewriting or working-data cleanup.

### F01 implementation update — 25 November 2026

**Local packaging controls implemented and verified; historical-exposure review remains open.** See [the remediation record](prelaunch-packaging-remediation.md) for exact build/archive checks, backup/restore evidence, runtime and preservation checks, reproduction steps and limitations. The measurements above describe the original audit baseline, not the remediated package.

Private filesystem traversal no longer pulls the workspace into tracing. Production requires private storage outside the release. Build inputs are allowlisted; production builds refuse runtime `.env` files; Docker context and final runtime boundaries are enforced independently. Directory and actual archive gates reject private/configuration/recovery/tooling material and known secret values. The relocated package retains public assets, article administration, shared dependencies and native Prisma support.

Owner/account access is still required to assess historical artifact distribution and any necessary credential rotation. Durable production private storage, migration/access controls and recovery remain F11/F14; no production attestation is implied. The site remains **NO-GO**. F04 and all other independent blockers are untouched; implementation stops here as requested.

## 2. Launch blockers

| Audit ID | Blocker | Required exit evidence |
| --- | --- | --- |
| F01 | Local private-file packaging causes remediated; historical exposure review remains open | Local final-package/archive, native runtime and preservation checks passed; owner review of historical artifact distribution and any required rotation still needed |
| F04 | Meeting side panel simulates success without storing registrations | No public simulated success; all entry points use real confirmed availability, or honest contact/no-meeting fallback |
| F08 | Privacy/collection prerequisites unverified; production gates incomplete | Actual controls and qualified review recorded before attestations; forms enabled only after approval |
| F11 | Production backup/restore and durable independent erasure ledger unproven | Restart/deploy/restore rehearsal proves no resurrection; keys/media/SQL recoverable; approved retention enforced |
| F14 | Production runtime, SQL/Blob, HTTPS, secrets and isolation unverified | Exact release works on production-compatible private staging; least privilege, durability, monitoring and owner control established |

P1 items must also close before launch **unless their specific safe workaround is documented, exercised and accepted by the owner**. They cover lint/delivery, corporate verification, admin protection, upload safeguards/public-media policy, notification operations/mail, evidence retention, Maps/legal review, promotion/rollback, basic SEO/indexing, critical usability verification, dependency risk, public placeholders and public API abuse controls. Do not waive them with a generic “pre-existing” label.

## 3. Minimum safe launch scope

Preserve all approved public texts, visual layouts, images, scientific graphics, URLs, responsive behavior and functionality, including every “რატომ TM?” page. Retain:

- Homepage; introductory article; all six benefits/research destinations; how-to-learn; existing approved articles and visuals.
- The real published book, detail page and reader; corporate/about/FAQ; header/footer/navigation; privacy and terms.
- Private, authenticated article/book administration and previews, with a protected production admin boundary.
- Real introductory meeting registrations and corporate inquiries only if their privacy, storage, mail and operator gates pass.

Remove simulated meeting success and temporary book samples from the **public launch scope** through a separately approved change; preserve approved real content and established design. Obtain genuine teacher/contact information or approve temporary omission of incomplete slots. Do not create an Ayurveda page without the owner's intended approved content; it is absent from the implemented route inventory.

Two viable launch operating modes:

| Mode | Requirements |
| --- | --- |
| Limited manual registration service | Confirmed schedules; durable real SQL receipt; privacy controls approved; verified mail; named staff monitoring/reconciliation/retry; manually issued invitations/reminders; truthful confirmation |
| Information/contact-only release | Registration/inquiry submission disabled honestly with approved monitored contact alternative; no simulated success; no unnecessary collection. Hosting, packaging, HTTPS, admin, logging, Maps and applicable legal/privacy gates still apply |

The second mode is not achieved by leaving visible forms that fail with 503. Production gates currently require mail/privacy settings for either form API. A reduced mode therefore needs an intentional approved product change and verification.

## 4. Ordered mandatory implementation and verification

### Gate A — Freeze scope and define accountability

Owner + technical lead confirm launch date, canonical host (`learntm.ge` versus a www redirect), launch mode, final public inventory, contact ownership, teacher schedules, privacy operator and deputy. Record approvers for legal/privacy, security, operations and final release. Set acceptance criteria before changes begin. Preserve the existing visual baseline and do not bundle unrelated redesign/editorial work.

**Exit:** agreed scope/date/owners; a documented fallback if any later gate misses the deadline. Complexity S plus owner decisions.

### Gate B — Contain packaging and preserve recovery evidence (F01, F12)

**Local status:** items 3–4 implemented and verified, including a bare-build env-file guard, synthetic contamination regressions, Docker context checks, native runtime checks and exact-archive verification. Item 2 has an enforced production path boundary and verified external local backups/test state; production storage ownership, ACLs and migration remain owner decisions. Items 1 and 5 require the historical artifact/account review; no cloud access, credential rotation or production changes were performed. See [F01 evidence](prelaunch-packaging-remediation.md). Do not mark Gate B or the overall launch checklist complete until that review is recorded.

1. Quarantine any existing contaminated package; do not deploy or republish it. Locate any retained historical CI/upload artifact and inspect its exact manifest privately. The removed local bundle cannot be reconstructed with certainty from a current listing.
2. Establish separate private runtime/evidence/backup storage outside source/build/deploy paths. Inventory retention owners and access permissions without printing contents.
3. Correct tracing boundaries and Docker context exclusions. Keep needed public assets/shared packages/Prisma engines working.
4. Add a final-package gate rejecting private directories, credentials, `.env`, backups, deletion ledgers, audit evidence, local logs and unnecessary tools. Inspect the actual upload/archive, not only source ignore files.
5. Review recipients/access history and rotate any credential actually included or otherwise exposed; document uncertain historical scope without claiming a proven breach.

**Exit:** clean reproducible package, bounded tracing and a recorded historical-exposure assessment. Complexity L; finish before producing a release candidate.

### Gate C — Restore trustworthy delivery checks (F02, F03, F20, F24)

Fix the 139 lint errors through scoped environment declarations and the unused import. Replace the obsolete corporate harness with isolated persistence/notification/request-context verification and correct its operational guide. Patch/review dependency advisories, including test tooling; confirm supported Node/Next/tool versions and pin a tested runtime/image. Do not use blanket rule disabling or untested major overrides.

Run TypeScript, shared and safe web unit tests, full lint, an isolated SQL integration suite and a clean production build. DB suites must use a newly provisioned disposable database and media namespace; never a working `.env` database. Explicitly include web tests in the release procedure, since root `test` does not cover them all.

**Exit:** reproducible passing checks, current dependency audit with any narrow exception documented/expiring, corporate fixture isolation proven. Complexity M–L.

### Gate D — Prepare private staging and runtime operations (F11, F14, F15)

Provision only after explicit authorization and owner account/budget decisions. Use a production-compatible long-running Node environment, migrated SQL Server/Azure SQL, private Blob Storage, a durable external ledger directory and a secret store. Separate staging/production data and credentials. Runtime SQL privileges must differ from migration privileges; use real certificate verification, not local trust overrides.

Storage currently requires a connection string; the comment promising managed identity is not an implemented integration. Choose secure configuration or separately implement identity. Verify Node/OpenSSL/Prisma runtime packaging, startup command, port binding, always-on behavior and private filesystem permissions.

Define health checks and alerts for startup/SQL/Blob errors, failed retention, pending notifications, backup failure, availability and unexpected error spikes. Configure platform/proxy/mail log retention. Back up SQL **and media**, protect keys separately and rehearse a full isolated restore with the current independent erasure ledger retained. Record RPO/RTO and runbooks.

Verify branch/environment protections. Rehearse staged release, migration compatibility, promotion and application rollback with a known-good immutable artifact. Do not use routine database restore as application rollback or overwrite later registrations/editorial changes.

**Exit:** private staging survives restart/deploy/restore and release rollback, has working alerts and preserves erased-record state. Complexity L plus provider time.

### Gate E — Close security and privacy operating decisions (F05–F08, F12–F13, F28)

Protect admin/login/actions with effective shared throttling and MFA/access gateway or equivalent tested boundary. Verify HTTPS-only routing, trusted forwarding headers, Secure/HttpOnly/SameSite cookies, account recovery and revocation. Add upload CSRF/body/rate controls or demonstrate the stated gateway workaround; establish public-media-only editorial handling. Add shared/edge public API abuse limits rather than relying solely on caller-chosen email.

The controller and qualified reviewer approve real policy/practice alignment, processors/regions/transfers, Maps loading, minors/authority checks, collection necessity, rights handling, holds, incidents and retention exceptions. Establish a monitored contact mailbox and rehearsed identity/access/correction/export/restriction/erasure procedure. Assign external-provider/mailbox deletion and historical-evidence retention owners.

Configure backup ≤30-day and operational-log ≤90-day practices as documented, including provider snapshots/versions and actual platform logs. Where a documented lawful exception is needed, approve it explicitly. Set privacy attestation flags only after evidence exists; the flags configure no external control by themselves.

**Exit:** controls demonstrated and operational/legal decisions signed; no unsupported blanket compliance statement. Complexity M–L plus human review.

### Gate F — Make collection truthful and operational (F04, F09, F10, F25)

Disable public previews. Confirm real future meetings, teacher/timezone/location, capacity, registration close time and joining instructions. Verify side-panel and standalone behavior agree. Configure verified senders, Resend credentials, admin mailbox and domain authentication. Exercise an authorized staging registration/inquiry through durable receipt, delayed/failed notification, manual retry and actual inbox receipt. Include duplicate/capacity/closed/full/invalid/spam states. Do not use real visitors as fixtures.

Assign a primary and backup operator. Before launch they must demonstrate:

1. Daily and pre-meeting review of stored registrations and corporate inquiries, independently of notification emails.
2. Reconciliation of pending participant/admin notifications and bounces, with a defined response deadline.
3. Manual invitation and reminder delivery through approved channels; no claim that Calendar did it automatically.
4. Explicit communication of reschedules/cancellations/changed links, because notification timestamps are not automatically reset on meeting edits.
5. Private handling of participant information and retention/rights/external-deletion tasks.

Approve factual contacts/teacher slots and remove or clearly exclude sample books without changing the real reader. If these gates cannot pass, implement the information/contact-only mode agreed at Gate A.

**Exit:** no lost/pretend registrations, no unmonitored inbox, confirmations match actual behavior; operator and deputy sign off. Complexity M.

### Gate G — Finish essential SEO and critical usability (F16–F18)

Wire the verified HTTPS origin to root metadataBase/canonical/social metadata; preserve approved copy. Add/test sitemap and robots behavior. Decide reader canonical policy. Keep staging noindex/private and admin/drafts protected. At approved public promotion inspect the **built and served** global noindex rule: runtime flag changes alone do not establish that generated build headers changed.

Test exact release at desktop/tablet/mobile, including 360px and zoom, keyboard-only navigation, screen reader forms/dialogs/reader, contrast and meaningful graph alternatives. Run staging production performance traces and inspect public-route JS/network requests. Fix failures that block use or safe launch; defer cosmetic and speculative optimization. Confirm social/contact ownership externally.

**Exit:** critical journeys pass on staged release, production URLs/indexing correct, no broken internal links/media/404 handling, measured performance recorded honestly. Complexity M.

### Gate H — Final controlled release decision

Technical lead supplies a checklist/evidence package for the **exact immutable release**, including its hash, artifact scan, tests, migration compatibility, rollback and operator coverage. Owner reviews remaining P1 workarounds individually. Confirm DNS/TLS/mail changes and approved release window. Deployment and external changes require separate explicit authorization; no deployment was performed by the audit.

Immediately after any later authorized promotion, check public homepage/all route types, real availability/disabled-form mode, TLS/headers/cookies, privacy gates, images, canonical/social URLs, robots/sitemap, mail queues and monitoring from outside the host. Roll back the application if critical checks fail while preserving new data and the independent erasure ledger.

**Exit:** signed GO decision, successful external smoke, staffed monitoring window; otherwise NO-GO.

## 5. Owner services, configuration and decisions

| Needed from owner | Concrete decision/evidence |
| --- | --- |
| Launch date and operating mode | Date/time/timezone, manual collection versus information-only fallback, primary/deputy staffing |
| Domain/DNS authority | Ownership, canonical host/www redirect, DNS control, HTTPS certificate/renewal, mail records |
| Hosting/cloud account | Approved budget/provider/region, App Service or equivalent, production/staging separation, account administrators and MFA |
| Database/storage | Azure SQL and Blob ownership/network rules, runtime/migration principals, backup/media recovery, durable private ledger mount |
| Secrets | Managed store and rotation/access owner; database/Blob/auth/mail values supplied securely, never in documents/commits |
| Mail/provider accounts | Resend account, verified sender domain, SPF/DKIM/DMARC, two sender identities, monitored admin and policy contact inboxes |
| Privacy/qualified review | Controller identity, processor agreements/locations/transfers, Maps decision, rights/minor/incident/retention procedures and attestations |
| Meetings | Confirmed teachers and schedules, authorized location/links, manual response/invitation/reminder/reschedule responsibilities |
| Public identity/content | Approved contact details and teacher information, sample-book decision, Ayurveda launch expectation and approved source if required |
| Release governance | Repository/environment protections, required reviewers, deploy authority, artifact-access/history evidence and rollback owner |
| Recovery/monitoring | Retention, key custody, RPO/RTO, on-call contacts, alert channels and restore exercise sign-off |

Current workspace verifies local dependencies only. The presence of a workflow filename or account setting name does not prove an external account is configured.

## 6. Final go/no-go checklist

All boxes require evidence or the specific approved safe workaround referenced in the audit.

- [ ] Launch date, canonical host, launch mode and accountable owner/deputies recorded.
- [ ] F01/F04/F08/F11/F14 closed; all other P1 findings closed or individually accepted with tested workaround and expiry.
- [ ] Exact release artifact scanned: no credentials/private files/backups/ledger/logs/evidence/tests/unnecessary tools; historical contaminated-artifact recipients reviewed.
- [ ] Frozen-lockfile clean build, TypeScript, lint, safe unit tests, isolated integration/browser tests pass; dependency exceptions justified.
- [ ] SQL migration chain and schema compatibility verified; no reset or seed against working/production content.
- [ ] Production Node/Prisma/OpenSSL startup, SQL, Blob and public media work after restart; local defaults/ports not exposed.
- [ ] Secrets protected; admin MFA/access boundary, login/public API throttling, upload safeguards, cookies and proxy trust verified.
- [ ] Production privacy practices and qualified-review decisions approved before flags are set.
- [ ] Durable independent erasure ledger survives release/restore; SQL/media/key recovery demonstrated; backup/log/evidence retention assigned.
- [ ] No simulated registrations/sample-book read promises/unapproved teacher placeholders remain publicly actionable.
- [ ] Confirmed meetings or honest disabled/contact-only state; all registration entry points agree.
- [ ] Corporate and meeting receipt/error/duplicate/capacity/pending-retry scenarios verified in staging; mail and monitored contact inboxes tested.
- [ ] Manual operator/deputy demonstrate reconciliation, invitations/reminders and reschedule/cancel/rights handling.
- [ ] All approved routes/content/graphics/URLs preserved; public links/media/404 behavior checked on exact release.
- [ ] Mobile/tablet/desktop, keyboard/screen reader/zoom/contrast and critical form/dialog/reader journeys reviewed.
- [ ] Performance measurements recorded from production-compatible staging; monitoring and error/queue alerts active.
- [ ] Correct HTTPS metadataBase/canonical/social URLs, sitemap/robots, intended public indexing and private noindex rules verified from served responses.
- [ ] DNS/TLS/mail authentication and external destination ownership confirmed.
- [ ] Protected promotion/rollback rehearsed; previous immutable release retained; new data/ledger protected during rollback.
- [ ] Owner explicitly authorizes final release; post-promotion external smoke and staffed monitoring window scheduled.

Any unchecked P0 or unaccepted P1 means **NO-GO**. Passing local tests alone is insufficient.

## 7. Deferred backlog

These items may follow launch once the mandatory gates above are satisfied.

| Project | Deferred scope / acceptance boundary |
| --- | --- |
| Complete meeting automation | Teacher-specific calendar/account model; Google Cloud/Workspace scopes and authorization; secure token lifecycle; schedule synchronization; idempotent Calendar creation; Meet generation and joining instructions; participant invitations; reminders; retries/outbox/observability; cancellation/reschedule reconciliation; timezone/DST behavior; capacity/concurrency; restricted/deleted participant handling; processor/privacy review; recovery and end-to-end staging tests. Existing local test endpoints are not this project |
| Comprehensive SEO | Search Console/analytics decision, Georgian content/URL inventory, full canonical/redirect strategy, structured Article/Book/Organization data, social image strategy, crawl/indexation monitoring, performance-led SEO and approved editorial/keyword work |
| Performance scaling | Catalog query/cache/pagination, larger-book delivery, image budgets, route-level bundle analysis and field CWV optimization based on measurements (F19) |
| Broader CI automation | Full reproducible disposable SQL/media environments, expanded publication/privacy/reader browser gates and scheduled dependency review beyond minimum release checks (F24) |
| Security hardening | Tested fuller CSP/reporting, stricter malformed-ID handling, media decode/dimension limits beyond launch edge safeguards, account/session management improvements; no deferral of an unmitigated P1 |
| Migration hygiene | Resolve the known SQL default normalization diff in isolation; never reset a live database (F21) |
| Dev tooling cleanup | Safely exclude production-unneeded Calendar/recovery/test tools and archived fixtures while preserving developer/recovery evidence (F22) |
| Product/content extensions | Owner-approved Ayurveda scope, additional real books/teacher content, further accessibility refinements; no automatic editorial rewrite |

No automation implementation or SEO rewriting was begun. The next step is owner review and explicit approval of the selected remediation scope.
