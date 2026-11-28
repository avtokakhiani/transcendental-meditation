# Corporate inquiries

The Georgian landing page is `/organizaciebitvis`. Its separate lead form posts
to `/api/corporate-inquiries`; it does not use public introductory registrations.

Email delivery requires these server-only variables in the ignored `apps/web/.env`:

- `RESEND_API_KEY`: a sending API key from the site's Resend account.
- `CORPORATE_FROM_EMAIL`: a sender on a domain verified in that account.
- `ADMIN_EMAIL`: the administrator who should receive corporate inquiries.

Use actual configured addresses; the placeholder contact in `src/lib/site.ts`
is deliberately not used for delivery. Restart the host development server
after configuration. No credentials belong in source control.

Production collection also requires HTTPS `SITE_URL` and all six evidenced
privacy attestations. Missing prerequisites return HTTP 503 before body/SQL/mail
access. `MEETINGS_FROM_EMAIL` is unnecessary while F04 keeps meetings disabled.
Never enable attestations just to make a test or form work.

The endpoint stores a private SQL inquiry before returning `{ ok: true }`.
Success means durable receipt, not inbox delivery or a completed staff response.
Database failure returns 503 without success; the existing form retains input.
Identical normalized content within a ten-minute bucket shares one SQL record.
Cross-bucket submissions can be separate inquiries; this is not a permanent
duplicate or abuse guarantee.

Next `after()` separately attempts a minimal administrator notification containing
only a protected admin link. It does not include enquiry details or visitor Reply-To.
Provider/network/invalid-receipt failures leave notification pending; authorized
staff can retry. A restriction or expired record prevents delivery. Development
mail is off unless explicitly enabled; production evidence is still required.

Validation runs in the browser and server. The endpoint checks same-origin
requests, limits request size, rejects a honeypot and submissions made within
two seconds, limits each email to five attempts per ten minutes per process,
and uses provider idempotency for identical payloads in ten-minute windows.
The button is disabled while submitting and on success. For multi-instance
production hosting, add shared throttling or edge rate limits; the process-local
limit does not coordinate between instances.

The approved privacy policy is available through the existing modal and
`/privacy-policy` fallback. The form, policy copy and layout are unchanged.

Manual initial operation uses `/admin/privacy`, monitored mail, daily reconciliation,
recorded subsequent business contact, restrictions and separately verified external
deletion. The recent list is limited to 20 corporate records; arrange complete
protected reconciliation if that window is exceeded. See
[Georgian owner instructions](../../../docs/f08-owner-operations-ka.md) and
[production approval checklist](../../../docs/f08-production-approval-checklist.md).

Safe local verification from `apps/web` (Docker SQL required): set `F08_EVIDENCE_DIR`
to a new absolute private directory outside the repository, then run `pnpm test:f08`.
The unit test never loads `.env` or connects to SQL; integration loads local SQL
credentials privately, creates only UUID-named disposable databases, intercepts
mail, uses a separate host Next dev server on localhost:31998, restores/replays in
isolation, and removes its fixtures. Keep localhost:31997 as the usual dev site.
Do not run these tests against a remote database or enable production collection.

Provider reference: https://resend.com/docs/api-reference/emails/send-email
