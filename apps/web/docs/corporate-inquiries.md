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

Without all three variables the endpoint returns HTTP 503 and the form shows
an error, retaining the entered details. It only shows the supplied success
message after the email provider accepts the notification and returns an ID.
All seven submitted fields appear in a plain-text email, with the visitor's
email as Reply-To. No inquiries are written to the database.

Validation runs in the browser and server. The endpoint checks same-origin
requests, limits request size, rejects a honeypot and submissions made within
two seconds, limits each email to five attempts per ten minutes per process,
and uses provider idempotency for identical payloads in ten-minute windows.
The button is disabled during delivery and on success. For multi-instance
production hosting, add shared throttling or edge rate limits; the process-local
limit does not coordinate between instances.

The current site has no privacy-policy route, so the supplied privacy notice
is displayed as text. Link it when the site's policy is available.

Provider reference: https://resend.com/docs/api-reference/emails/send-email
