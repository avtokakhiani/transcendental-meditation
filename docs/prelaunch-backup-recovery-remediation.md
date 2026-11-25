# F11 local backup and recovery readiness — 25 November 2026

**Local F11 work complete; F11 production readiness remains OPEN / NO-GO.** No production storage, scheduler, key service, account or monitoring was configured. No production collection/attestation was enabled. Work stops before F14.

## Existing evidence reused

| Requirement already demonstrated locally | Evidence reused; boundary |
| --- | --- |
| Article-system native SQL recovery | `apps/web/private/article-foundation/phase6-2026-11-24/recovery-verification.json`: encrypted native backup, checksum/DBCC, exact every-table comparison and unchanged working data. Historical evidence is private/F12-managed, not release material. |
| F01 encrypted backups and complete restored records | `%LOCALAPPDATA%/learnTM/prelaunch/f01-1795597728044/backup-verification.json` and `runtime-test.json`: AES-256-GCM readback, native checksum/restore, DBCC and exact all-table comparison; source/assets/private packaging boundaries. |
| F08 current synthetic recovery and privacy semantics | `%LOCALAPPDATA%/learnTM/prelaunch/f08-local-1795617037415/integration-verification.json`, `privacy-storage.log`, `schema-diff.sql`: encrypted native SQL restore, tamper rejection, replay before retention, stale hold removal, reconstructed receipt tasks, idempotence, pending completion, legacy journals and retention boundaries. |
| F08 current SQL recovery copy | Existing `database.bak.enc` authenticated again using the existing private key. Every current working table still matches its encrypted F08 before-inventory, so the existing verified SQL backup is reusable; no unnecessary fresh working SQL backup/restore was performed. |

These cover native restore/integrity and replay semantics without repeating article/F01/F08 builds, broad browser suites or full SQL restoration. They do not establish actual production storage, key recovery, media consistency, scheduling, access or monitoring.

## Remaining local gaps resolved

1. **Backup freshness/integrity:** the helper previously trusted filesystem mtime, so touching/copying a stale file or leaving a corrupt recent file could suppress a new backup. It now credits only a timestamped, recent, authenticated non-empty regular backup. Corrupt recent files record a generic integrity-failure event and cannot suppress a fresh copy. Corruption remains visible to strict verification until an operator handles it; it is not silently deleted.
2. **Publication/readback:** native SQL still uses `COPY_ONLY`, `CHECKSUM`, and `RESTORE VERIFYONLY`. Encrypted output is staged under `.pending`, authenticated/read back against original bytes, then renamed into the managed `.enc` set. A failed/incomplete write is not advertised as a finished backup. Controlled interrupted staging is cleaned on later local helper runs.
3. **Read-only verification:** `privacy:maintain --verify-backups` previously ran retention/maintenance first and could report success for zero files. It now verifies without maintenance, pruning, SQL calls or backup creation. Empty/missing, stale, corrupt, empty-plaintext, wrong-key, future and expired timestamped sets fail. Combining verification with `--backup` is rejected. Legacy undated files cannot prove freshness; their age remains an inventory/owner matter.
4. **Missing production ledger:** production reads now require a provisioned regular `erasures/` directory; missing storage fails startup maintenance instead of being treated as an empty journal. Development's existing first-use behavior is preserved. This detects missing directories, not an apparently valid but stale/empty replacement volume; completeness and durable storage remain explicit production gates.
5. **Journal persistence:** successful new journal writes flush file data before return; non-Windows hosts also flush the directory entry. Retried existing journals are checked and flushed again; corrupt existing entries fail rather than authorize deletion. If a failed SQL transaction was followed by mail delivery before an erasure retry, newly acquired receipt IDs are merged through a flushed atomic replacement without extending the original journal retention date. Controlled interrupted merge staging expires on the 90-day journal cycle. Actual storage/failure durability, especially target Windows/mount behavior, is not certified by these local calls.
6. **Media recovery capability:** an isolated Azurite container pair exercises synthetic PNG export to an encrypted local file, source deletion, recovery into a different disposable container, SHA-256/byte equality, content type and metadata. No working media/container was changed. This is a local manual recipe/rehearsal, not a new backup service, a general production exporter or a claim that Azure versioning/SQL-media consistency is configured.

## Verified backups and tests

External evidence directory: `%LOCALAPPDATA%/learnTM/prelaunch/f11-local-1795627027180/`. Before consequential changes, a fresh encrypted source/configuration archive and encrypted full working-record inventory were verified by disk readback. The existing F08 native SQL backup was re-authenticated and its record inventory matched current working SQL. `backup-verification.json` records reuse/digests and a 30-day review/removal date. Protect the existing key separately; no secret value was printed.

`verification.json` / `targeted-tests.log` record the new targeted checks: negative backup integrity/freshness/retention cases, read-only CLI success with SQL deliberately unreachable and no ledger provisioned, forbidden mixed verify/mutate command, production missing-ledger startup failure, provisioned empty ledger, fresh-process journal read, actual local SQL-helper creation/skip/corrupt-file replacement behavior, staging cleanup and isolated media recovery. The native helper uses only a tiny UUID-named disposable database; no seed/reset runs on website data. Synthetic encryption keys are ephemeral and never approve collection.

`journal-filesystem-tests.log` covers retry/corrupt-journal behavior, receipt merging without retention renewal, interrupted merge expiry and the two focused F01 filesystem regressions. Focused TypeScript/lint and live local smoke/preservation checks are recorded separately. Original full native restore and erasure replay are deliberately reused from F08 because their service logic and ledger format remain unchanged.

Final preservation evidence (`preservation-verification.json`) confirms all 64 public assets and every existing file outside the explicit F11 implementation/documentation allowlist are byte-identical, including public pages/styles/graphics/content/URLs, article management, F04 state, F08 gate/replay service, F01 release configuration, Maps, schema, `.env` and the completed remediation reports. Full working SQL records match the encrypted before-inventory; no F11 test database/container remains. `local-smoke.json` verifies the running host dev corporate form at mobile width and empty/disabled meeting endpoints without submitting an inquiry. `evidence-reuse.json` records hashes of the original article/F01/F08 evidence; those suites were not needlessly rerun.

An initial TypeScript check caught direct assignments to Next's readonly `NODE_ENV` declaration in the new test. The test now uses process-local environment assignment consistently; no runtime setting was changed to resolve it.

## Local operation and recovery procedure

From `apps/web`, normal host HMR remains localhost:31997; SQL/Azurite remain in Docker. Do not seed, reset or start the Docker web image.

```powershell
# Read-only local encrypted-backup authentication/freshness check; nonzero means investigate.
pnpm privacy:maintain --verify-backups

# Intentional local maintenance/backup operation — separate from verification.
# Do not run against production; this can prune expired local data and files.
pnpm privacy:maintain --backup

# Targeted disposable SQL/Azurite rehearsal; evidence directory must be external/private.
# Set F11_EVIDENCE_DIR to a NEW absolute directory outside this repository first.
pnpm test:f11
```

The tests refuse remote SQL/non-local Azurite; restore/drop/delete is limited to their validated UUID-named database/container resources and checked temporary directory. They do not restore the working database. Full native restoration/replay is already documented and reproducible through `test:f08`; do not repeat routinely merely to regenerate evidence.

Recovery order: contain traffic/writes/mail → recover encrypted bytes with separately retrieved key → verify native backup integrity → restore isolated SQL and matching media → attach/validate the **current independent ledger** → replay → retention → prove erased records absent and external tasks pending → integrity/content/private-access checks → owner review of actual target evidence. Application rollback normally retains current SQL/media/ledger; restoring old SQL as routine rollback can discard new records and editorial changes.

## Production requirements retained

Use the [practical production configuration and verification checklist](f11-production-recovery-checklist.md). Every item is unchecked and launch-blocking: owner RPO/RTO, SQL/media consistency, durable private ledger/mount and independent checkpoint, provider schedule/retention, key custody/recovery, least privilege/access, out-of-band monitoring/alerts, actual target restart/recovery and owner/deputy rehearsal. Local helper daily checks run only while invoked/app is alive; they are not a production scheduler. The helper intentionally refuses remote SQL.

Existing historical archives/evidence outside managed filename pruning still need F12 ownership/expiry review; this task does not delete them. F01 historical exposure/private-storage follow-ups, F08 production privacy evidence and general F14 infrastructure remain open. No extra backup infrastructure, cloud adapter, service purchase, external configuration or release was introduced.
