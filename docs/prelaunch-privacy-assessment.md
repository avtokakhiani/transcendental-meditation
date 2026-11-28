# F08: privacy readiness assessment and owner decision

Assessment: 25 November 2026. **F08 remains open; public launch remains NO-GO.** F01's local packaging controls and F04's approved unavailable-registration mode were reviewed, not reimplemented. This record does not certify legal compliance, approve collection, configure provider controls or replace a qualified review.

**Subsequent owner decision:** Option A was approved, followed by authorization for local corporate-only remediation. The historical assessment/tests below are retained as evidence, not current pending scope choices. See [local F08 implementation](prelaunch-privacy-remediation.md) and [outstanding production approval checklist](f08-production-approval-checklist.md). Meetings and production collection remain blocked independently; no external readiness claim is made.

## Finding and local evidence

The underlying blocker is missing evidence that the published privacy commitments match actual production operations. `privacyLaunchBlockers()` and the production corporate API already fail closed. Flipping attestations, weakening the guard or treating a passing unit test as operational approval would not resolve F08.

The ignored local configuration was inspected for presence/attestation status only: **0 of 6 privacy flags are true; 0 of 5 required mail/origin settings are present**. Values are omitted from the evidence. This inspection says nothing about inaccessible production settings or provider accounts. The six flags are operator attestations, not infrastructure configuration.

The corporate endpoint remains unchanged and returns 503 in production when prerequisites are absent. Local development behavior is unchanged. Meeting registration remains disabled independently by F04; privacy approval cannot re-enable it. The approved policy text is unchanged. The About page still contains the existing automatically loaded Google Maps iframe; its processing/cookie/transfer basis and any required safeguards need owner/qualified-reviewer assessment before launch. No conclusion about the applicable legal basis is made here and no consent/design change was implemented.

## Evidence needed to close F08

| Requirement | What must be supplied or demonstrated | Local assessment boundary |
| --- | --- | --- |
| Accountability and policy/practice alignment | Controller confirms actual service/data scope; assigns privacy primary/deputy and qualified reviewer; records approval of the published policy against actual practice. | Displayed names/contact details are not proof of authority, ownership or review. |
| Production hosting/storage and processors | Actual provider/account ownership, regions, access controls, encryption/network/secret arrangements, processor terms and transfer review, with private evidence references. | No provider account was accessed or changed. F11/F14 production work remains outstanding. |
| Backup, ledger and log retention | Production SQL/media/key recovery and durable independent erasure ledger; actual backup retention and all platform/provider/mailbox log practices, including approved exceptions and owners. | F01/F04 local backup checks do not attest production recovery, provider retention or ACLs. Preserve F01 historical-exposure/private-storage follow-ups. |
| Rights, restrictions, holds, incidents and minors/authority | Named operator/deputy demonstrate identity/authority checks and request handling, restrictions, erasure/remote-copy reconciliation, exceptions and incident process; qualified reviewer approves applicable requirements/deadlines. | Existing admin record controls do not establish identity, authority, legal basis or staffed procedures. No real records were processed in this assessment. |
| Policy/contact and notification channels | Owner confirms monitored mailbox/contact ownership and staffing; approved senders, delivery/retry/bounce and retention/deletion handling are demonstrated with authorized synthetic staging data. | Presence of an address or provider key is not delivery/ownership evidence. No live mail or DNS operation was performed. |
| Maps | Owner/qualified reviewer assess the existing automatic embed and document the applicable decision/safeguards; approve any needed public behavior change before implementation. | Disclosing the embed in policy is not proof of approval or that no additional control is needed. Approved embed/layout are unchanged. |
| Final attestation and served release | Implement and verify actual controls first, record approvers/evidence references, then separately authorize secure configuration and release checks. | No attestation or indexing flag was changed. A production-mode code test is not an approved production setting. |

Dependencies on F10–F15 do not justify skipping to another independent P0 in this task. Owner choices/evidence must be recorded before dependent implementation; external changes and any later deployment require their own authorization. Do not paste credentials, personal records or unredacted provider exports into this document or chat.

## Owner options — neither implemented

**A — Preserve the corporate form and complete the privacy evidence/operations review (recommended).** Keep the approved public website and corporate workflow unchanged, meeting registration disabled, and production collection blocked until the applicable controls above are evidenced and approved. Assign the controller/operator/deputy/reviewer, confirm approved providers and monitored contact handling, and record evidence references. After those decisions, prepare/rehearse the remaining local procedures and authorized staging verification; attest only what has actually been demonstrated. This matches the requested preservation scope and does not invent a new public flow. It does not make launch immediately permissible.

**B — Authorize a reduced corporate contact-only/unavailable mode.** Temporarily withhold the corporate submission form and reject its endpoint consistently, preserving its URL/layout as far as possible and retaining administration/storage for later activation. The owner must approve the visible fallback wording and any monitored contact destination before implementation. F04 remains disabled. This reduces collection scope but **does not close F08 by itself**: hosting/access logs, admin data, existing stored records, policy/contact handling and Maps still need the applicable owner/qualified review and controls. Any proposed email/phone fallback also needs review of its data-handling practices. No form, API, contact channel or public copy was changed to implement B.

For either choice, the owner must settle the controller/operator/reviewer responsibilities and Maps/provider/retention decisions. No purely local code change can supply those facts. Stop at this decision; do not weaken the existing safeguards or claim F08 resolved.

## Backups, tests and preservation

Private evidence directory: `%LOCALAPPDATA%/learnTM/prelaunch/f08-assessment-1795616096697/`. Before documentation edits, copies of the action plan, privacy implementation guide and completed F01/F04 reports were written outside the repository and verified by SHA-256 readback (`documentation-backup.json`). Runtime/content/assets/schema/configuration hashes were recorded in `preservation-before.json`. No consequential runtime or data change, destructive test, SQL fixture or SQL backup/restore operation was needed for this assessment.

`tests/privacy-launch-gate.test.ts` adds a focused regression without changing application code. It uses synthetic process settings and a throwing fake database, never the working `.env` or a real database. It exercises **38 negative corporate handler cases**: each of 11 missing requirements, four non-approved values for each of six flags, and three invalid/non-HTTPS origin settings. Each returns 503 without a success payload, reading the request body, accessing SQL or calling the network/mail provider. A fully populated synthetic configuration is checked only against the pure gate function; no accepting API path is invoked, and it is explicitly not real-world approval evidence.

Verification: `privacy-gate-tests.log` passes; `focused-lint.log` and `typecheck.log` pass. `local-readiness-presence.json` records booleans only. `assessment-verification.json` confirms verified documentation backups and unchanged runtime source, approved content/styles/graphs, all 64 public assets, schema/migrations, working `.env`, completed F01/F04 reports and disabled meeting policy. No full F01 packaging, F04 browser/registration suite, production build or deployment was repeated because runtime behavior was unchanged.

Reproduce the isolated, non-destructive gate check:

```powershell
pnpm.cmd --filter @tm/web exec tsx --test tests/privacy-launch-gate.test.ts
```

F08 is **assessed and regression-tested, not remediated/approved**. Await the owner decision and actual controls/evidence. Do not proceed to F11 or another P0 within this task.
