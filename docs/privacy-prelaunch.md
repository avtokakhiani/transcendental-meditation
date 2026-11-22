# Privacy implementation — pre-launch only

The supplied Georgian policy is preserved verbatim in
`apps/web/src/content/privacy-policy.ts`. Its approved UTF-8 SHA-256 is
`b1ab3999a26548d256992ffd118095bfe94b8200884d3dec6a28d389fdd7b43d`.
The footer and form links open one centered accessible modal; `/privacy-policy`
provides a direct-link fallback. The pre-launch label is outside the policy text.

**This implementation is not a declaration of legal compliance or production readiness.**
Do not approve launch until the actual practices below have been configured and verified.

## Implemented locally

| Data | Retention anchor | Enforcement |
| --- | --- | --- |
| Real meeting registrations | Meeting date + 12 Tbilisi calendar months | SQL `retentionExpiresAt`; updated if the meeting is rescheduled |
| Corporate enquiries | Last recorded business communication + 12 calendar months | Private SQL storage; administrator records subsequent communication |
| Application privacy/access audit | 90 days | Deletes old audit rows; audit contains action, staff ID and record ID, not submitted text, names, email or IP |
| Managed local technical log files | 90 days | Prunes only `private/logs/learntm-*.jsonl` |
| Managed encrypted local SQL backups | 30 days | Daily encrypted copy, SQL checksum verification, expiry cleanup |
| Independent erasure ledger | 90 days | Minimal scope/record-ID/date files; reapplied before retention processing after startup/restore |

Startup maintenance runs before the application starts; it repeats every minute while
the long-running Node server is running. Due records are deleted on the next maintenance
pass. Requests that have a documented, future-dated legal/security hold are excluded;
expired holds no longer prevent deletion. Do not invent a hold to extend retention.

`/admin/privacy` requires an active **admin** role. Other content editors cannot access
private registrations, meeting management, or privacy actions. After identity and authority
verification, administrators can search, prepare an access copy, correct fields, restrict
processing, record communication, preserve with an explicit reason/review date, and erase.
Each action requires a fresh confirmation. This confirmation records an administrator's
decision; it is not automatic identity verification or a substitute for handling a real request.
Restriction blocks notification delivery; erasure and delivery are serialized with SQL row locks.

Corporate submissions now succeed only after private database storage. Delivery is separate
and retryable. Corporate administrator notification emails contain a private admin link rather
than the enquiry body. Meeting administrator notifications also omit participant details.
Participant confirmations still necessarily transmit the participant's address and confirmation
content to the mail provider. Receipt IDs are recorded to support deletion handling.

The four preview meetings remain simulated: no registration storage or email occurs for them.
They must be removed/disabled and replaced with confirmed schedules before live registration.
Local email is disabled unless `PRIVACY_EMAIL_DELIVERY_ENABLED=true`; synthetic browser tests
require it disabled. Do not enable it merely to make a local test pass.

The About page embeds Google Maps automatically on page load, without a consent gate.
Section 10 of the shared policy discloses this behavior. Disclosure does not itself establish
consent or another lawful basis: before launch, assess Google's cookies/device access,
personal-data processing and international transfers under applicable law. Document a valid
basis and safeguards; if prior consent is required, automatic loading must be reconsidered.
This remains an unresolved launch review item. The ordinary external Maps link is unchanged.

## Local maintenance and backup operation

Run from `apps/web`:

```powershell
pnpm privacy:maintain
pnpm privacy:maintain --verify-backups
pnpm privacy:maintain --backup
pnpm test:privacy
pnpm test:meetings
pnpm typecheck
```

The standard host development startup remains `start-dev.ps1`. Never run seeds as part of upkeep.
New schema migrations were applied locally without deleting existing database/media content.

Local backups use the existing Docker SQL instance, `COPY_ONLY`, `CHECKSUM`, and `RESTORE
VERIFYONLY`, then AES-256-GCM encryption. Temporary raw `.bak` staging files are removed;
interrupted staging files are cleaned up on later runs. The helper refuses remote SQL hosts.
Only controlled backup/log filename patterns in the private directory are pruned.

The 32-byte base64 backup key is stored only in the ignored local `.env`. Never put that key,
connection strings, passwords, exported records, or backup files into Git, Pages, or issue bodies.
The private directory is outside `public/`, ignored by Git, and must have restricted OS access.
Protect the key separately; losing it makes the encrypted backups unusable. Filesystem ACLs
and workstation disk encryption are operational controls and have not been provisioned here.

### Restoring without resurrecting erased data

Keep the current independent `private/erasures/` ledger when restoring an older database.
Restore into an isolated environment first; never overwrite the ledger with a backup copy.
Run privacy maintenance **before** enabling requests or notification delivery. This re-erases
records listed in the ledger and applies current retention. The ledger must be durable and
independent of the restored database, accessible only to the privacy operator.

Automated tests verify erasure replay after restoring an individual deleted row, encryption
round-trip/tamper rejection, and expiry cleanup. SQL validates backup checksums. A complete
operational disaster-recovery restoration, certificate/key recovery and operator handover are
still required before launch. Do not represent those as tested merely because these tests pass.

## External deletion is not automatic

Deleting SQL records cannot delete provider records or copies delivered to a mailbox.
Erasure creates a minimal task containing provider receipt IDs when such IDs exist.
An administrator must remove applicable provider/mailbox copies under the agreed retention,
verify the result, and acknowledge the task in `/admin/privacy`. Pending tasks remain visible;
they are not silently marked complete. Completed/minimal local records follow the log cycle.
The independent ledger contains no enquiry content or email addresses.

Provider acceptance is not proof of inbox delivery. Bounce/delivery webhooks and automatic
mail delivery retries have not been configured; administrators have manual retry controls.
Do not claim verified mail delivery or automatic remote erasure.

## Launch blockers and required owner/provider work

1. Configure the real production host, SQL/storage region, TLS, least-privilege database account,
   encryption at rest, network restrictions, secret storage, and monitoring. The local runtime
   still uses development infrastructure and a privileged SQL account.
2. Configure verified senders, Resend credentials and administrator address; verify actual
   participant/admin delivery, provider logging/retention and mailbox retention/deletion.
   The policy contact `info@learntm.ge` must be a working monitored mailbox.
3. Configure **all** hosting/platform/access/security/diagnostic logs for at most 90 days,
   subject to documented lawful exceptions. This code controls application audit rows and
   managed local files, not terminal scrollback, Azure logs, mail-provider logs or third-party logs.
4. Configure production backup retention to at most 30 days across snapshots, replicas and
   storage versions. Protect backups from normal access; verify a complete restore with the
   independent deletion ledger. Azure automatic long-term retention is not configured by this helper.
5. Verify processor agreements, actual processing countries, international-transfer arrangements,
   and staff/teacher access procedures. No provider account or region was created/verified here.
6. Establish and exercise identity verification, request handling and response deadlines,
   consent withdrawal, objections, preservation exceptions, incident handling, and required
   guardian/representative checks for minors. The admin interface supports record operations;
   it does not verify a person's age, identity, guardianship or legal basis automatically.
7. Replace preview meetings, review administrator authentication (including login throttling/MFA
   and session handling), and complete production security/dependency and legal review.

Production form APIs fail closed while required launch flags/settings are absent. The flags
`PRIVACY_BACKUPS_VERIFIED`, `PRIVACY_LOG_RETENTION_VERIFIED`, `PRIVACY_PROCESSORS_VERIFIED`,
`PRIVACY_EXTERNAL_DELETION_VERIFIED`, `PRIVACY_RIGHTS_PROCESS_VERIFIED` and finally
`PRIVACY_LAUNCH_APPROVED` are **operator attestations**, not infrastructure configuration.
Set them true only after implementing and verifying the corresponding actual practices.
Verified HTTPS `SITE_URL`, mail credentials and sender/admin settings are also checked.
The admin privacy screen lists blockers without printing credential values.

The pre-launch site has `X-Robots-Tag: noindex, nofollow`. This discourages indexing; it is
not access control. Do not publish the local development server or development service ports.

Test storage databases and fixture accounts/enquiries are isolated or explicitly cleaned up.
No real notification is sent by privacy tests. Do not run the real-email path using a person's
address merely to test retention or deletion.
