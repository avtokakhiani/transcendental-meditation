# F08 production configuration and approval evidence

**All items below remain launch-blocking and unverified.** Local implementation and synthetic tests do not complete these items. Corporate inquiries are in scope; public meetings remain source-disabled. No production collection, deployment, external configuration, credential rotation or legal attestation is authorized by this checklist.

For each item record privately: environment/account, accountable owner and deputy, implementation date, verifier, result, evidence reference, exceptions/review date and approval. Do not paste credentials, personal records or raw provider exports into Git or chat.

## Owner and qualified review

- [ ] Actual controller identity, service/data scope and published policy/contact ownership confirmed; monitored `info@learntm.ge`, corporate recipient and staffing established.
- [ ] Privacy primary/deputy and qualified reviewer named. Approved policy checked against actual processing, lawful basis, rights/deadlines, minors/representation, restrictions, holds, incidents and justified retention exceptions. No unsupported legal conclusion inferred from tests.
- [ ] Existing automatic Google Maps embed assessed for processing/cookies/transfers and necessary safeguards; current embed is preserved pending that decision. Any required visible change needs separate approval.
- [ ] Provider identities, actual regions/countries, processor terms and transfer arrangements reviewed and approved.
- [ ] F01 historical artifact distribution/access reviewed privately; affected credential rotation completed if warranted. Local packaging remediation does not establish historical non-exposure.

## Infrastructure and external services — F11/F14 dependencies

- [ ] Production-compatible private staging and production host, HTTPS/canonical origin, network isolation, secret store, least-privilege runtime/migration identities, administrative access/MFA and account ownership verified. No development service ports exposed.
- [ ] Durable private storage outside source/release/public paths configured with restricted access. Independent erasure ledger survives restart, release replacement and SQL restore; it is not overwritten from a database backup.
- [ ] SQL, uploaded media, required configuration and keys recoverable. Encrypt/protect backups; separate recoverable key custody; approve recovery objectives. Complete a provider-specific full restore and ledger replay before enabling any requests/mail. Local synthetic SQL recovery is not production media/key recovery evidence.
- [ ] Backup/snapshot/version retention at most 30 days and all platform/access/security/diagnostic/provider/mailbox logs at most 90 days, with reviewed documented exceptions. Assign expiry checks, alerts and owners; app pruning alone does not configure providers.
- [ ] Corporate Resend account/key, verified sender domain, applicable SPF/DKIM/DMARC and monitored recipient configured securely. Confirm real synthetic-test inbox receipt, failures/bounces, manual retry and reconciliation. `MEETINGS_FROM_EMAIL` is not needed while meetings remain disabled; do not enable meetings to satisfy mail configuration.
- [ ] Hosting/processor/mailbox retention and deletion behavior demonstrated, including copies not removed by SQL deletion. Store receipt IDs and provider evidence privately.

## Staffed manual operations

- [ ] Owner and deputy rehearse [Georgian operations](f08-owner-operations-ka.md) with authorized synthetic staging data: durable receipt, failure without success, duplicate handling, notification outage/manual retry and queue reconciliation independent of mail.
- [ ] Establish protected inquiry reconciliation log, response target and coverage. Admin recent list is limited to 20 corporate records: demonstrate no missed records; approve a complete protected database reconciliation when that window is exceeded. No full queue or automatic acknowledgement system is claimed.
- [ ] Rehearse identity/authority checks, access/correction, restrictions, contact-date renewal, holds/review dates, erasure and separately verified provider/mailbox deletion. Legacy journal entries lack receipt IDs: reconcile historical external copies manually where the restored database cannot supply them.
- [ ] Demonstrate incidents/escalation, maintenance/retention failures, backup failure alerts, key loss handling, restore containment and deputy handover. Assign monitoring coverage; manual procedures need actual staffing.

## Attestations — evidence first, global approval last

| Flag | Minimum supporting evidence; remains unapproved |
| --- | --- |
| `PRIVACY_BACKUPS_VERIFIED` | Provider retention, SQL/media/key recovery and independent-ledger replay on the actual target |
| `PRIVACY_LOG_RETENTION_VERIFIED` | All relevant app/platform/provider/mailbox log retention and exceptions |
| `PRIVACY_PROCESSORS_VERIFIED` | Actual providers/regions/terms/access and qualified processing/transfer review, including Maps |
| `PRIVACY_EXTERNAL_DELETION_VERIFIED` | Staffed, rehearsed provider/mailbox reconciliation and verified completion |
| `PRIVACY_RIGHTS_PROCESS_VERIFIED` | Approved and rehearsed identity/rights/authority/hold/incident procedures and assigned deadlines |
| `PRIVACY_LAUNCH_APPROVED` | Owner reviews the complete evidence and remaining launch blockers; this is authorized last |

- [ ] Validate HTTPS `SITE_URL`, `RESEND_API_KEY`, `CORPORATE_FROM_EMAIL`, `ADMIN_EMAIL` through secure configuration, not documentation. All six attestations remain required. Do not fill missing evidence with placeholder settings.
- [ ] On the exact separately authorized staged release verify denied/unapproved collection, successful durable corporate receipt only when approved, F04 disabled endpoints, private admin/storage boundaries, public form/error behavior and retention/recovery. Inspect built-and-served indexing headers separately at approved promotion; a runtime flag change is not proof of changed build headers.
- [ ] Record owner GO decision after F08/F11/F14 and the other mandatory launch requirements are closed. Deployment requires separate authorization. Until then: **NO-GO**.

Google Calendar, meeting automation, automated mail retry/bounce processing and comprehensive SEO remain deferred. Required safeguards and demonstrated manual coverage cannot be deferred.
