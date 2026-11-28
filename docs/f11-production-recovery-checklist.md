# F11 production backup and recovery checklist

**Status: every production item below is unverified and launch-blocking.** Local SQL/media rehearsals are capabilities, not proof of configured production recovery. F14 implementation, deployment, account changes and purchases are outside this task. Meetings remain disabled and all production privacy attestations remain unapproved.

Minimum recommendation: use the already approved host/provider's native SQL and media recovery facilities where they meet the approved retention and recovery objectives. Begin with one controlled application instance and genuinely durable private storage outside the release. Do not add a new backup service or custom cloud backup engine by default. A second instance requires demonstrated shared ledger consistency/serialization first.

For each item record privately: target environment/account, owner/deputy, date, configuration/evidence reference, result, recovery objective, exception/review date and approver. No secrets or personal records belong in this checklist.

## 1. Recovery scope and approved objectives

- [ ] Owner approves maximum acceptable data loss (RPO), time to recovery (RTO), recovery window, staffing and escalation. Test measured results against those targets; do not infer an SLA from a local test duration.
- [ ] Inventory SQL (articles/revisions/books/users/corporate/privacy tasks), uploaded Blob media, required configuration/release artifacts, recoverable keys and current independent erasure ledger. Public source assets are additionally recoverable from the approved repository/release; uploaded media are not necessarily in Git or SQL.
- [ ] Match SQL and media recovery points. Document upload/change containment or provider consistency procedure; reconcile every SQL media reference with recovered object bytes/content type/metadata. Separate successful SQL and media tests do not prove cross-system consistency.

## 2. Private storage and independent ledger

- [ ] Provision absolute `PRIVACY_STORAGE_DIR` outside release/public/build paths, on a durable private mount; keep `erasures/` independent of restored SQL and immutable releases. Verify correct volume/store identity before starting the application. Never copy an old ledger over the current one during database recovery.
- [ ] First initialization: only after owner-confirmed review of prior collection/deletions may an empty private `erasures/` directory be provisioned. Otherwise migrate/reconcile the current ledger securely, preserving dates, IDs and receipt IDs. Missing production `erasures/` now fails startup; do not bypass that guard by blindly creating an empty replacement.
- [ ] Prove survival of host restart, release replacement, selected failure scenarios and recovery. Protect the current acknowledged-erasure history in a separate failure domain/checkpoint appropriate to the approved loss objective. A database backup is not an independent ledger backup.
- [ ] Verify ledger completeness/last known checkpoint against protected independent evidence. A present but empty/stale/wrong volume can still pass a directory-existence check. If completeness cannot be established, keep requests/mail stopped and escalate; do not serve potentially resurrected records.
- [ ] Verify real filesystem semantics, permissions and serialization. Local code flushes journal files before successful return and directory entries on non-Windows platforms; this does not prove cloud storage/power-loss durability. Node does not provide that directory-flush operation on Windows. Rehearse the actual target.

## 3. Scheduling and retention

- [ ] Enable and inspect actual provider SQL backups/recovery points and media recovery. Choose a schedule meeting the approved RPO; daily local-helper behavior is not a production schedule. Recovery must work when the web process is down.
- [ ] Preserve the approved maximum 30-day backup cycle across SQL snapshots/exports/replicas, Blob versions/deleted-object retention and separate ledger recovery copies, subject only to reviewed documented exceptions. The current minimal operational ledger itself remains on its existing 90-day cycle. Restoring an older SQL point requires a complete current ledger covering that point.
- [ ] Demonstrate actual expiry; inventory orphaned exports and historical evidence separately under F12. Managed local filename pruning does not cover external F01/F08/F11 archives, historical article evidence or provider snapshots. Assign an owner/review-or-removal date; no historical material was deleted in this task.
- [ ] Keep operational/backup-provider logs within the approved 90-day cycle or a reviewed exception. Confirm logs contain no submitted content, credentials, connection strings or plaintext backups.
- [ ] Keep `PRIVACY_LOCAL_BACKUPS` disabled for remote managed SQL. The existing helper deliberately refuses remote SQL and depends on local Docker; do not weaken its guard or ship Docker/SQL recovery tools into the web release. Use approved provider tools from a restricted recovery workstation/job.

## 4. Encryption, keys and access

- [ ] Verify encryption in transit/at rest for SQL, media, ledger and backup storage. Verify encrypted exports are authenticated; a successful file copy/checksum alone is insufficient.
- [ ] Store recoverable encryption keys separately from the encrypted archives; record key version/backup association and restricted custody without recording key values. Test recovery through the actual authorized key-retrieval path, including a deputy. The local test uses a synthetic key and does not prove production key custody.
- [ ] Plan key rotation without destroying recovery: retain access to keys needed by retained backups until approved expiry. Do not rotate or remove actual keys without authorization. Provider-managed recovery/key facilities and custom `LTMB1` exports have different recovery requirements.
- [ ] Restrict SQL restore/export privileges, backup access, media recovery and ledger modification. The normal runtime must not have broad restore/delete-backup authority. Verify account ownership, MFA, least privilege, network restrictions and private access. No backup/key may be publicly downloadable or included in the deployment package.

## 5. Monitoring and operator coverage

- [ ] Alert on missing/late recoverable points, failed jobs/integrity checks, retention failures, exhausted storage, inaccessible keys, ledger/mount failures and failed restore exercises. Monitor independently of the app and test actual alert receipt/escalation by owner/deputy.
- [ ] Assign daily evidence review and periodic recovery exercises. A generic `backup_verified` app log is local checksum/encrypted readback evidence, not proof of a restore or a monitored cloud backup.
- [ ] Local verifier now fails on missing/empty/stale/corrupt/wrong-key/future/over-retention timestamped backup sets. It authenticates files and their recorded age; it does not run SQL `RESTORE VERIFYONLY`, a restore, or cloud retention checks. Legacy files without a timestamp cannot establish freshness and require explicit age/inventory review.

## 6. Actual target recovery rehearsal — before production collection

1. [ ] Obtain authorization for an isolated production-compatible target and synthetic records; contain requests, writes and notification delivery. Do not overwrite working/production SQL or media.
2. [ ] Recover the selected encrypted SQL/media backup with the approved key/tooling; verify native integrity and restore SQL to the isolated target. Check required tables/records and every required media reference/object.
3. [ ] Attach the current independent ledger from its verified durable source; validate identity/completeness, then replay it **before** requests, previews, notifications or public access. Run retention after replay. Fail closed on unreadable/corrupt/missing ledger.
4. [ ] Demonstrate erased synthetic records do not return, including stale restrictions/holds from a backup; pending external deletion receipt tasks return without false completion. Repeat replay to demonstrate idempotence. Legacy receipt gaps require manual provider/mailbox reconciliation.
5. [ ] Restart the recovered application and exercise current article/book/reader delivery and private corporate/admin access, with F04 still disabled and no real mail. Test mount persistence and the actual selected release/runtime boundary. Record measured RPO/RTO and discrepancies; correct failures before approval.
6. [ ] Owner/deputy demonstrate the procedure, key access and alerts. Record sign-off, cleanup of only the approved disposable resources, and unchanged working data. Runbooks alone do not establish staff readiness.

## 7. Approval boundary

- [ ] Review all evidence above plus [F08 production privacy requirements](f08-production-approval-checklist.md), F01 historical exposure/private storage, and remaining launch gates. Only then may the owner attest `PRIVACY_BACKUPS_VERIFIED`; no positive flag was changed here. Global launch approval is last and deployment needs separate authorization.

**Any unmet item keeps F11 OPEN / NO-GO.** General hosting/runtime/network implementation remains F14; this task stops before it.
