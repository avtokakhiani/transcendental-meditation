# learnTM.ge minimum safe launch action plan

Prepared 25 November 2026, Asia/Tbilisi. Read with [the complete audit](prelaunch-readiness-audit.md), especially its evidence labels and final measurements.

## 1. Current assessment

**NO-GO in the present state.** The website and article system work locally, but production security, packaging, privacy operations, infrastructure and collection workflows have open gates. Compilation and a locally functioning page do not close those gates.

Original audit baseline: both TypeScript projects passed; 60 safe unit tests passed (six target historical recommendation helpers); all seven local migrations were applied; a clean isolated production build passed; all 28 existing public routes returned 200 across desktop/tablet/mobile, and 14 additional interaction checks plus the legal-document browser regression passed. Published article delivery was separate from drafts. There were 139 lint errors blocking the configured release workflow. The corporate unit test was stale and unsafe to run against working data. Prior build evidence confirmed private-directory inclusion; the original contaminated artifact was removed and its exact historical membership was no longer recoverable from local manifests. The audit's sanitized bundle still included 71 unnecessary app documentation/test/script paths and emitted five tracing warnings; the prior build emitted eight. See the implementation update below for current F01 evidence.

No launch date was provided. The owner must supply the predetermined date and timezone, staffing coverage and fallback decision. Work below is ordered by dependency, not assigned fictional calendar dates. If mandatory verification cannot finish before that date, move the launch or adopt an explicitly approved reduced scope that satisfies the same safety gates.

The audit originally authorized documentation only. Subsequent requests authorize local F01 remediation and assessment/remediation of the next independent P0, with verified backups/testing and a stop after each blocker. The latest request requires owner approval before visible functionality changes and a stop when an essential owner decision is reached. Deployment, purchases, external configuration changes, unrelated content rewriting and working-data cleanup remain unauthorized.

The owner subsequently **explicitly approved Option A for F04**, including the existing no-meetings notice and server-side submission disablement while preserving administration, integration groundwork and corporate inquiries. That local implementation and its verification are recorded below. No further P0 work is authorized within this implementation step.

### F01 implementation update — 25 November 2026

**Local packaging controls implemented and verified; historical-exposure review remains open.** See [the remediation record](prelaunch-packaging-remediation.md) for exact build/archive checks, backup/restore evidence, runtime and preservation checks, reproduction steps and limitations. The measurements above describe the original audit baseline, not the remediated package.

Private filesystem traversal no longer pulls the workspace into tracing. Production requires private storage outside the release. Build inputs are allowlisted; production builds refuse runtime `.env` files; Docker context and final runtime boundaries are enforced independently. Directory and actual archive gates reject private/configuration/recovery/tooling material and known secret values. The relocated package retains public assets, article administration, shared dependencies and native Prisma support.

Owner/account access is still required to assess historical artifact distribution and any necessary credential rotation. Durable production private storage, migration/access controls and recovery remain F11/F14; no production attestation is implied. The site remains **NO-GO**. This was the stop point for the F01 implementation; the later approved F04 change is recorded below.

### F04 assessment before owner approval — 25 November 2026

**Historical assessment, superseded by the approved implementation below.** At this point F04 awaited an essential owner decision. F01's completed local controls were reviewed without rebuilding or repeating their remediation. Its historical-exposure review and production private-storage decisions remain open.

Source review confirms that `MeetingPanel` still passes enabled preview meetings to `MeetingRegistration`. The `temporaryTest` submission branch waits 350 ms and shows success without calling the API or storing a row. The standalone `/introductory-meeting` page instead fetches SQL availability. A fresh read-only local SQL check found **0 meetings, 0 future open meetings and 0 registrations**. No synthetic meeting was inserted, registration submitted, email sent or Calendar call made.

The existing real-registration backend awaits a SQL transaction before returning `{ ok: true }`. It has per-meeting SQL locking, duplicate protection and capacity/closing-time checks. Authenticated meeting administration exposes stored participants and pending notification/retry status. These are useful foundations for a manual service, but this assessment does **not** re-certify concurrency, notification delivery, privacy approval or production readiness. Production collection remains subject to the existing privacy/mail gates; no flags or credentials were changed.

Both viable choices change visible registration behavior, so neither was implemented under the latest approval requirement:

| Owner choice | Concrete initial-launch behavior | Remaining prerequisites |
| --- | --- | --- |
| **A — Temporarily unavailable registration (recommended with the current empty schedule)** | Remove preview meetings and simulated success from public use. Preserve existing links, URLs, panel/page structure and styles; show the existing truthful no-meetings notice consistently. Disable registration submission on the server as well as withholding the form. Add a contact alternative only if the owner supplies an approved monitored destination. | Owner approval of this visible fallback. Production privacy, hosting/admin/security/recovery and other launch gates still apply. |
| **B — SQL receipt with manual staff handling** | Both panel and standalone page use the same real SQL availability and registration API. Show success only after durable SQL receipt; errors never show success. Staff review stored registrations independently of mail and manually handle joining instructions, invitations, reminders and changes. No Google Calendar automation. | Owner-confirmed future schedules, location/joining instructions and capacity; named primary/deputy and response deadline; approved privacy operations and verified notification/contact channels before enabling collection. No preview schedule is treated as a real commitment. |

For B, the implementation verification must use disposable SQL and synthetic participants: durable receipt/commit failure, retries/duplicates, capacity/closed meetings, delayed/failed notifications, operator reconciliation, origin/body/validation/privacy denials, and panel/standalone consistency. For A, verify disabled API submission, no public preview/form/simulated success, identical fallback across entry points, keyboard/mobile behavior and preservation of approved pages/assets. A new verified source/SQL backup is required before subsequent consequential application/data changes; this assessment made none.

Assessment evidence and verified before-edit documentation copies are outside the repository at `%LOCALAPPDATA%/learnTM/prelaunch/f04-assessment-1795612606047/`. The read-only SQL summary contains counts only. At that assessment stage application/runtime files, working records, media, `.env` and the F01 report were unchanged; the local web server was not restarted and no browser/implementation pass was claimed. F04 remained open pending the owner's choice. See the subsequent implementation results below.

### F04 approved implementation — 25 November 2026

**Locally resolved through approved Option A: public meeting registration is unavailable.** The existing introductory meeting buttons, panel, URLs, styles and no-meetings notice are preserved. Both panel and standalone page show that notice without preview meetings or a registration form. The shared code gate is disabled in every environment; opening an admin meeting or changing environment/privacy flags cannot enable public registration.

The timer-based simulated-success path is removed. The public POST endpoint returns 403 with `MEETING_REGISTRATION_DISABLED` and no success payload before reading the body or calling SQL/mail; availability returns an uncached empty list. Meeting administration, real SQL registration/notification services, schema/migrations and Calendar groundwork remain intact. Corporate inquiries and their independent privacy/security gates are unchanged.

Verified results: fresh encrypted source/SQL/record backups with disk readback; 12 live endpoint cases; development/production-mode handler checks with no body reads or SQL/mail calls; 84 page views across all 28 public routes at 1440/768/390px, including 63 available-panel checks and the reader's existing separate navigation; mobile-menu/focus/Escape/scroll behavior; standalone/no-JavaScript fallback; anonymous admin denial and authenticated meeting editor access; corporate validation and three intercepted form-failure checks; 12 existing article/privacy regressions; the retained disposable-SQL storage/concurrency/duplicate/capacity and mocked notification/retry suite; focused lint, TypeScript and an isolated default-layout production build. No client exceptions were recorded. All 64 public assets, approved content/styles/graphs, unrelated source, schema, working `.env` and database records are unchanged.

See [the F04 remediation report](prelaunch-registration-remediation.md) for exact evidence and the safe re-enablement checklist after the full integration. Local evidence/backups: `%LOCALAPPDATA%/learnTM/prelaunch/f04-1795612828074/`. No deployment, external change, meeting fixture, email or Calendar action was performed. The final release must still pass its production-compatible staging/release checks. F01 historical exposure/private-storage follow-ups and F08/F11/F14 remain open; **launch remains NO-GO**. Stop after F04 before starting the next P0.

### F08 assessment — owner decision required, 25 November 2026

**Next unresolved P0: F08 remains open.** Its underlying problem is unverified production privacy practices, not a warning that can be suppressed. The production collection gate already denies requests when attestations/settings are missing. No approval flags, collection behavior, approved public policy text, F01 controls or F04 unavailable-registration behavior were changed.

The local presence-only check found 0 of 6 privacy attestations true and 0 of 5 required mail/origin settings present. This is not a production-account inspection. A new synthetic security regression verifies 38 negative production corporate handler cases return 503 before reading submitted data, touching SQL or sending mail/network requests. Focused lint and TypeScript pass. These code checks cannot attest provider configuration, legal/processor/Maps review, retention, mailbox ownership or staffed rights/incident handling.

See [the F08 assessment and owner decision record](prelaunch-privacy-assessment.md) for the evidence matrix and concrete choices. **Recommended A:** preserve corporate functionality and keep production collection blocked until owner/qualified-reviewer decisions and actual operational evidence are complete. **Alternative B:** separately approve an honest corporate contact-only/unavailable fallback, including visible wording and any monitored contact destination; baseline hosting/logging/admin/policy/Maps requirements still apply. B was not implemented and would not by itself close F08.

Documentation backups and non-destructive test evidence are outside the repository at `%LOCALAPPDATA%/learnTM/prelaunch/f08-assessment-1795616096697/`. Runtime/content/assets/schema/configuration and the completed F01/F04 reports are unchanged; no working-data mutation, production setting, external service or destructive operation was involved. **Stop at this owner decision before dependent implementation or the next independent P0. Launch remains NO-GO.**

## 2. Launch blockers

### F08 local implementation update — 25 November 2026

The owner approved **Option A: preserve corporate inquiries with manual management**, keep F04 meeting registration disabled, defer Calendar/non-essential automation, and preserve the approved policy/retention commitments and Maps embed. This supersedes the scope-choice stop above and the older generic meeting-launch requirements below. **Locally actionable F08 work is implemented and verified; F08 itself remains OPEN / NO-GO** pending [production configuration and approval evidence](f08-production-approval-checklist.md).

The corporate-only gate no longer requires a sender for disabled meetings; all six privacy attestations, corporate mail prerequisites and HTTPS origin remain enforced. The obsolete email-only corporate test was replaced by a database-free unit test of durable receipt/error semantics and Next's notification scheduling boundary. Disposable SQL and a separate host Next dev server verified real storage/confirmation, duplicate handling, database failure without success, failed/network/invalid-receipt notifications, manual retry, restrictions and erasure. No real mail was sent and the live test server used all six attestations false.

Recovery now retains optional provider receipt IDs in the independent minimal erasure journal, and replay locks records against notification delivery and reconstructs pending external-deletion tasks without acknowledging them. An encrypted native synthetic SQL backup was restored into a separate disposable database, checked with DBCC CHECKDB, and replayed successfully, including a backup predating delivery/erasure. Legacy journals remain readable; historical missing receipt IDs still need manual provider/mailbox reconciliation. No working records were changed.

The F21 representation drift was resolved by matching Prisma's introspected `dateadd(month,(12),sysutcdatetime())` expression. The existing migration chain deploys to a disposable SQL database with an empty schema diff. No migration/reset or SQL default/data change was made to the working database; the 12-month behavior is unchanged.

See [F08 remediation and verification](prelaunch-privacy-remediation.md), [Georgian owner instructions](f08-owner-operations-ka.md), and the [unchecked production approval checklist](f08-production-approval-checklist.md). Verified encrypted backups/evidence: `%LOCALAPPDATA%/learnTM/prelaunch/f08-local-1795617037415/`. F01 historical exposure/private storage, F11/F14 provider recovery/infrastructure, real mail delivery, actual retention, owner/deputy rehearsal, qualified review and Maps remain launch blockers. No approval flag or external service was changed. Stop after this local F08 scope; do not begin another independent P0.

| Audit ID | Blocker | Required exit evidence |
| --- | --- | --- |
| F01 | Local private-file packaging causes remediated; historical exposure review remains open | Local final-package/archive, native runtime and preservation checks passed; owner review of historical artifact distribution and any required rotation still needed |
| F04 | Locally resolved through owner-approved unavailable-registration mode; automation deferred | Existing notice/panel/URLs preserved; simulated success removed; server-disabled submission and regression checks pass. Verify this mode on the eventual staged release before public promotion |
| F08 | Corporate-only local remediation verified; production/owner evidence outstanding | Preserved corporate/manual scope approved. Complete the unchecked production privacy/configuration checklist, real delivery/recovery, staffing rehearsal and qualified/Maps review before attestations. Remains OPEN / NO-GO |
| F11 | Local backup/recovery gaps resolved and verified; production readiness remains OPEN / NO-GO | Reuse article/F01/F08 native restore/replay evidence; complete the unchecked F11 production storage/schedule/key/access/monitoring and actual target SQL/media/ledger recovery checklist |
| F14 | Production runtime, SQL/Blob, HTTPS, secrets and isolation unverified | Exact release works on production-compatible private staging; least privilege, durability, monitoring and owner control established |

P1 items must also close before launch **unless their specific safe workaround is documented, exercised and accepted by the owner**. They cover lint/delivery, corporate verification, admin protection, upload safeguards/public-media policy, notification operations/mail, evidence retention, Maps/legal review, promotion/rollback, basic SEO/indexing, critical usability verification, dependency risk, public placeholders and public API abuse controls. Do not waive them with a generic “pre-existing” label.

### F11 local implementation update — 25 November 2026

The owner subsequently authorized local F11 work, stopping before F14. **Locally actionable backup/recovery work is complete; actual production F11 remains OPEN.** Existing article-system/F01 full native SQL restores, exact all-table comparisons, and F08 encrypted restore/erasure-task replay/retention evidence were reviewed and reused. Current working records match the authenticated existing F08 SQL backup; no unnecessary new working SQL backup or full restore was run.

Local gaps fixed: recent backups must authenticate and use original filename time rather than mtime; encrypted output is read back before atomic publication; verification is read-only and fails empty/stale/corrupt/wrong-key/over-retention sets; missing production erasure storage stops startup; journal data is flushed before success and corrupt retry evidence is rejected. Targeted disposable SQL/Azurite tests cover helper creation/skip/corruption recovery, retention, fresh-process journal read and encrypted synthetic media restoration with byte/hash/content-type/metadata equality. No working data/media, public content/design, F01 packaging, F04 disabled state or F08 attestations were changed.

See [F11 local remediation/evidence](prelaunch-backup-recovery-remediation.md) and [production recovery checklist](f11-production-recovery-checklist.md). Fresh verified encrypted source/record backups and evidence are outside the repository at `%LOCALAPPDATA%/learnTM/prelaunch/f11-local-1795627027180/`; the F08 SQL backup was authenticated and safely reused. Every production requirement remains unchecked: actual durable ledger completeness/private mount, SQL/media consistency, provider retention/scheduling, key custody/recovery, access controls, independent monitoring and owner/deputy target rehearsal/RPO/RTO. Historical F12 evidence still needs ownership/expiry review; nothing was deleted. No positive flag, deployment, provider/account configuration or additional infrastructure was introduced. **Stop here before F14.**

## 3. Minimum safe launch scope

Preserve all approved public texts, visual layouts, images, scientific graphics, URLs, responsive behavior and functionality, including every “რატომ TM?” page. Retain:

- Homepage; introductory article; all six benefits/research destinations; how-to-learn; existing approved articles and visuals.
- The real published book, detail page and reader; corporate/about/FAQ; header/footer/navigation; privacy and terms.
- Private, authenticated article/book administration and previews, with a protected production admin boundary.
- Corporate inquiries with manual management only after their privacy, storage, mail and operator gates pass. Introductory meeting registration remains disabled under F04; re-enablement/Calendar automation is deferred.

Remove simulated meeting success and temporary book samples from the **public launch scope** through a separately approved change; preserve approved real content and established design. Obtain genuine teacher/contact information or approve temporary omission of incomplete slots. Do not create an Ayurveda page without the owner's intended approved content; it is absent from the implemented route inventory.

Two viable launch operating modes:

| Mode | Requirements |
| --- | --- |
| Limited manual registration service | Confirmed schedules; durable real SQL receipt; privacy controls approved; verified mail; named staff monitoring/reconciliation/retry; manually issued invitations/reminders; truthful confirmation |
| Information/contact-only release | Registration/inquiry submission disabled honestly with approved monitored contact alternative; no simulated success; no unnecessary collection. Hosting, packaging, HTTPS, admin, logging, Maps and applicable legal/privacy gates still apply |

The second mode is not achieved by leaving visible forms that fail with 503. Production gates currently require mail/privacy settings for either form API. A reduced mode therefore needs an intentional approved product change and verification.

The owner-approved F04 change now provides a **meeting-specific unavailable mode** with no visible registration form and server-enforced denial. It does not disable or approve corporate inquiries and does not waive their separate launch gates. Restoring meeting collection requires a new authorized integration change and the re-enablement checks in the F04 report.

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

**Local F11 status:** targeted backup-tool fixes and synthetic media recovery verified; reuse full SQL/replay evidence as recorded in the F11 report. The [F11 production checklist](f11-production-recovery-checklist.md) remains wholly unverified. This local work does not complete Gate D or authorize F14/external configuration.

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

**F04 initial-launch scope:** completed locally through approved unavailable-registration mode; collection/automation is deferred. Meeting-specific collection steps below are prerequisites for future re-enablement, not a requirement to build automation for this initial fallback. Corporate and other applicable collection/notification gates remain unresolved and independent. See [F04 results and re-enablement](prelaunch-registration-remediation.md).

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
| Mail/provider accounts | Resend account, verified corporate sender/domain, applicable SPF/DKIM/DMARC, monitored admin and policy contact inboxes; meeting sender deferred while F04 is disabled |
| Privacy/qualified review | Controller identity, processor agreements/locations/transfers, Maps decision, rights/minor/incident/retention procedures and attestations |
| Meetings | F04 remains disabled for initial launch. Teachers/schedules/location/Calendar/invitations are prerequisites for separately approved future re-enablement, not this launch |
| Public identity/content | Approved contact details and teacher information, sample-book decision, Ayurveda launch expectation and approved source if required |
| Release governance | Repository/environment protections, required reviewers, deploy authority, artifact-access/history evidence and rollback owner |
| Recovery/monitoring | Retention, key custody, RPO/RTO, on-call contacts, alert channels and restore exercise sign-off |

Current workspace verifies local dependencies only. The presence of a workflow filename or account setting name does not prove an external account is configured.

## 6. Final go/no-go checklist

All boxes require evidence or the specific approved safe workaround referenced in the audit.

- [ ] Launch date, canonical host, launch mode and accountable owner/deputies recorded.
- [ ] F01/F04/F08/F11/F14 closed; all other P1 findings closed or individually accepted with tested workaround and expiry.
- [ ] Exact release artifact scanned: no credentials/private files/backups/ledger/logs/evidence/tests/unnecessary tools; historical contaminated-artifact recipients reviewed.
- [ ] F01 owner follow-up: historical artifact distribution/access assessed; any required credential rotation completed through authorized secure channels.
- [ ] F01/F11/F14 owner follow-up: durable production private-storage location, ACLs, migration and independent-ledger/recovery behavior configured and verified outside the release.
- [ ] Frozen-lockfile clean build, TypeScript, lint, safe unit tests, isolated integration/browser tests pass; dependency exceptions justified.
- [ ] SQL migration chain and schema compatibility verified; no reset or seed against working/production content.
- [ ] Production Node/Prisma/OpenSSL startup, SQL, Blob and public media work after restart; local defaults/ports not exposed.
- [ ] Secrets protected; admin MFA/access boundary, login/public API throttling, upload safeguards, cookies and proxy trust verified.
- [ ] Production privacy practices and qualified-review decisions approved before flags are set.
- [ ] Durable independent erasure ledger survives release/restore; SQL/media/key recovery demonstrated; backup/log/evidence retention assigned.
- [ ] No simulated registrations/sample-book read promises/unapproved teacher placeholders remain publicly actionable.
- [ ] Confirmed meetings or honest disabled/contact-only state; all registration entry points agree.
- [ ] Corporate receipt/error/duplicate/pending-retry scenarios verified on actual staging; real mail and monitored contact inboxes tested. Meeting endpoints remain disabled; capacity/invitations belong to future re-enablement.
- [ ] Manual operator/deputy demonstrate corporate reconciliation, retry, contact-date/rights/incident handling and escalation. Meeting invitations/reminders/rescheduling are deferred.
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
| Migration hygiene | F21 default-expression representation normalized locally with empty disposable schema diff; no working SQL/reset/migration change. Validate compatibility on the eventual target; broader migration cleanup remains deferred |
| Dev tooling cleanup | Safely exclude production-unneeded Calendar/recovery/test tools and archived fixtures while preserving developer/recovery evidence (F22) |
| Product/content extensions | Owner-approved Ayurveda scope, additional real books/teacher content, further accessibility refinements; no automatic editorial rewrite |

No Calendar automation or SEO rewriting was begun. The preserved-corporate/manual scope is approved and its local F08 tasks are complete. Next, obtain the unchecked production/owner/qualified-review evidence; no external configuration or deployment is authorized by this local completion.
