# F04: introductory meeting registration unavailable for initial launch

Local implementation: 25 November 2026. Owner explicitly approved Option A: retain the introductory meeting button, panel, styling and URLs; show the existing no-upcoming-meetings notice; remove simulated success and disable public submissions. Corporate inquiries are a separate workflow and remain unchanged. No deployment or external configuration change is included.

## Behavior and implementation

`apps/web/src/lib/meeting-registration-policy.ts` is the shared public-registration gate. It deliberately returns `false` in every environment. No environment flag, privacy approval, database meeting status or Calendar setting can override it. Re-enabling requires a reviewed source change and a fresh client/server build.

- The existing introductory meeting links still open the same panel; `/introductory-meeting` remains the direct/no-JavaScript destination. Both display the existing Georgian no-upcoming-meetings notice. Headings, classes, stylesheet, dialog behavior, URLs and surrounding approved content are preserved.
- The unavailable UI neither fetches schedules nor renders a registration form or preview meeting. The preview fixture module is retained with its flag off and disconnected from the public component. Its presence does not enable registration.
- `GET /api/meetings` returns `200 { "meetings": [] }` with `Cache-Control: no-store` before querying SQL. This means no publicly available meetings; it is not a registration confirmation. Even an administrator opening a database meeting does not bypass the public gate.
- `POST /api/meetings/register` returns **403**, `Cache-Control: no-store`, and `{ error: <existing notice>, code: "MEETING_REGISTRATION_DISABLED" }`. It returns before reading the request body, SQL access, throttling state or notification scheduling. It never returns `{ ok: true }` in this mode. Unsupported submission methods are rejected by Next with 405. A framework-generated OPTIONS response, if present, describes methods and does not register anyone.
- The timer-based temporary submission/success branch is removed. The retained real form can report success only after an HTTP success containing `ok: true`; the retained backend emits that only after awaiting its SQL transaction. It is unreachable while the public gate is closed.

Meeting administration, authenticated editing, SQL storage/concurrency/capacity/duplicate handling, notification retry groundwork, Calendar test/integration groundwork, Prisma schema/migrations and existing records are retained. There was no seed, schema migration, new meeting or participant fixture inserted into the working database. No corporate UI, API, validation, storage, notification, privacy gate or contact channel was changed. This fix does not approve corporate production collection or close its separate findings.

## Backups and preservation

Before application edits, fresh encrypted source/configuration and SQL/record snapshots were created outside the repository at `%LOCALAPPDATA%/learnTM/prelaunch/f04-1795612828074/`. SQL COPY_ONLY/CHECKSUM and RESTORE VERIFYONLY/CHECKSUM passed. All three encrypted files were subsequently read from disk, decrypted with the existing local backup key and matched to their recorded hashes. No key or credential is in documentation or release inputs. Plaintext SQL staging files were removed from the host and container.

The same private evidence directory contains the before-edit source/content/assets/schema hash inventory. Final checks compare every working SQL table to the encrypted before snapshot and verify unchanged approved content, styles, images/graphs, schema/migrations, corporate files, meeting administration, Calendar groundwork and working `.env`. No full restore rehearsal was repeated for this no-migration/no-record-write change; production recovery remains F11. Retain key custody and review backup access/retention with the owner (30-day backup horizon: 25 December 2026).

## Local verification

All evidence below is in the private run directory named above.

| Check | Evidence / result |
| --- | --- |
| Backups | `backup-verification.json`, `encrypted-readback-verification.json`: SQL native checksum/VERIFYONLY and encrypted source/SQL/record disk readback passed. |
| Disabled handler, including production mode | `disabled-unit.log`: actual GET/POST exports tested in development and production mode with synthetic environment settings, a throwing request-body getter, and SQL/mail spies. All POST cases return the explicit disabled error; no body read, transaction, listing query or mail/network call occurs. |
| Live Next endpoints | `disabled-browser.json`: 12 cases passed: valid/malformed/empty/no-origin/cross-origin/form/oversized POSTs, trailing-slash submission, and GET/PUT/PATCH/DELETE rejection. POSTs return 403 with no success payload; unsupported methods return 405. Availability is uncached and empty. Corporate invalid input retains its separate 400 response. |
| Public routes and panel | `disabled-browser.json`, `disabled-browser.log`: all 28 existing public routes return 200 at 1440/768/390px (84 views), including every “რატომ TM?” destination, four articles and the real book/reader. All 63 existing site-panel entry checks show the exact notice, no form/preview, unchanged URL and keyboard/focus/scroll behavior. The 21 reader views retain their existing separate navigation. No page overflow or client exceptions. |
| Corporate/admin/no-JavaScript | Same browser report: corporate contact anchors/forms work at three widths; three synthetic failed submissions are intercepted before reaching storage/mail and preserve entered data/retry. Meeting admin denies anonymous access and retains authenticated editor fields. The normal link navigates to the truthful standalone notice with JavaScript disabled. No authenticated save or login action is performed. |
| Retained registration foundation | `retained-storage-integration.log`: the existing SQL suite passes concurrency/capacity, normalized duplicates, closing/past/draft handling, public-field privacy, validation and notification delivery/retry checks. It creates/migrates and removes its own guarded disposable database; notifications are mocked and no real email is sent. This verifies preserved groundwork without enabling the public endpoint. |
| Source/content/data preservation | `source-preservation.json`, `working-database-preservation.json`: only the five approved existing meeting runtime files differ. All other existing application source, 64 public assets, content, styles/graphs, schema/migrations, corporate flow, meeting admin/services, Calendar groundwork and `.env` remain byte-identical; every working SQL table matches the encrypted before snapshot. The new policy module and focused tests are additive. |
| Regression/static/build | `regression-tests.log`: 10 existing article document/render cases and 2 privacy filesystem cases pass. `focused-lint.log`, `final-browser-lint.log`, `typecheck.log`: focused lint and TypeScript pass. `production-build.log`: isolated allowlisted workspace, offline frozen dependency installation, synthetic build settings and default production-layout build pass. No working `.env` or private state was copied. |

The host website remains in development mode with automatic reload at http://localhost:31997. Windows Prisma generation initially encountered a DLL lock from the existing server; a workspace-scoped server restart restored it. Initial development reload/timeout and incorrect test assumptions about reader/mobile navigation were resolved before the final complete browser pass; no reader/header layout was changed. The existing metadataBase warning, repository-wide lint backlog and other audit findings are outside F04. A new production server, cloud workflow, deployment and full F01 packaging re-verification were not performed for this change; the exact eventual release still needs its staging and artifact gates.

Run the approved unavailable-mode checks from the repository:

```powershell
# Host development server, automatic reload; preserves existing SQL and media:
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
# In another terminal:
pnpm.cmd --filter @tm/web test:meetings-disabled
```

The browser suite is restricted to localhost and a local SQL endpoint. It reads public route inventory and an administrator ID, does not save/edit/publish or log in through the login action, and intercepts corporate form submissions with a synthetic failure. It sends no email or Calendar request. The normal `test:meetings` command retains its isolated SQL storage suite and now runs the current disabled-mode browser suite. The former `tests/meeting-panel.mjs` assumes enabled/preview behavior and is retained as historical test reference, not as current launch evidence; its real registration assertions must be reviewed when implementing the future integration. Existing storage and Calendar tests/groundwork are retained.

## Safe re-enablement after the full integration

1. Obtain a new owner authorization for the future integration and public collection. Confirm real teacher commitments, future schedules/timezone, locations/joining instructions, capacity and closing times. Assign a primary/deputy and response, reconciliation, invitation, reminder, reschedule and cancellation responsibilities. Do not promote the retained preview fixtures into a real schedule.
2. Close the applicable privacy, admin/security, notification, infrastructure and recovery gates, including F08/F11/F14 and F01's historical exposure/private-storage follow-ups. Verify qualified privacy decisions and actual controls before setting attestations; supply external credentials securely. Corporate prerequisites remain independently enforced. A code gate change must not bypass `productionPrivacyBlocked()`.
3. Complete the actual production registration/Calendar integration as its own project. The current development Calendar test endpoints are not that integration. Test durable receipts, idempotency/duplicates, capacity races, closed/past meetings, persistence failure, timeout/retry, delayed/failed delivery, cancellations/reschedules, private participant handling and independent erasure/restore behavior in disposable staging. A confirmation must always reflect successfully stored registration state; notification/Calendar failures must remain recoverable and visible to operators without pretending delivery succeeded.
4. Take verified backups, then deliberately change `publicMeetingRegistrationEnabled()` in a reviewed change. Keep panel and standalone availability on the same real API. Remove neither the server storage safeguards nor the failure checks. Never restore the simulated-success branch. Update the unavailable-mode tests for the newly approved mode and retain explicit server-disabled/rollback coverage; do not blindly turn the current negative tests green by bypassing the gate.
5. Produce a fresh client/server build through the F01 isolated-input and exact-artifact gates. Verify the exact production-compatible staged release, fresh and stale browsers, no-JavaScript fallback and actual approved delivery/operator handling. Because the gate is compiled into both sides, editing `.env` or opening an admin meeting cannot activate the service. Deployment/public activation still requires separate owner authorization.
6. Rehearse disabling the shared gate and rebuilding/releasing to restore this truthful unavailable state while retaining registrations, private ledger and admin access. Do not restore an old database to roll back the application or resurrect erased records. Old clients must receive a non-success response from the disabled server.

## Remaining launch requirements

F04 is addressed locally through the approved unavailable-registration mode, not through completion of registration automation. Production deployment/verification is outstanding. F01 historical artifact exposure and production private storage remain explicit owner checklist items. F08, F11, F14 and the other unresolved audit findings still prevent a public launch. No comprehensive SEO, Calendar automation, service purchase, DNS/provider change or deployment was performed. Stop after F04; do not proceed to the next P0 within this change.
