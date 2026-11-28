# Google Calendar local connectivity test

These temporary tests determine whether one managed `@tmgeorgia.ge` account can authorize a separate local OAuth application to read its primary calendar, or separately create an event with Google Meet and delete that test event. Each capability is established only after the account holder completes its specific consent flow and the page reports success. Automated tests use synthetic responses and do not establish account access.

The tests are available only in Next.js development mode, on the exact host `localhost:31997`, behind an active site administrator session with role `admin`. There is no public navigation entry. The read-only button performs no event writes. The separately confirmed write test creates and cleans up only its own temporary event. No Gmail permissions, database migrations, bookings, or synchronization are involved.

## Write test after a successful read test

Use the same separate local OAuth client and existing four `GOOGLE_CALENDAR_TEST_*` settings. No new credentials, environment variables, callback URI, or API enablement are needed. A successful read grant does not establish write or Meet permission.

1. In the **same Google Cloud project**, open **Google Auth Platform → Data Access → Add or remove scopes**. Add `https://www.googleapis.com/auth/calendar.events.owned` and save. Keep the existing read-only and basic identity scopes. Do not add the full `calendar` scope, `calendar.events`, Gmail, or Meet REST API scopes. Keep **Audience → External → Testing** and the exact Workspace account under **Test users**. The write authorization request asks only for `openid email calendar.events.owned`; the existing read-only request remains separate. [Google scope setup](https://developers.google.com/workspace/guides/configure-oauth-consent)
2. Leave the Web client and its authorized redirect URI unchanged: `http://localhost:31997/api/admin/calendar-test/callback`. The new local `/api/admin/calendar-test/start-write` route starts authorization; it is **not** an additional Google callback.
3. Sign in as a site administrator, open `http://localhost:31997/admin/calendar-test`, and reload once to see **Write-access test: create event + Google Meet, then delete**. Resolve any previous leftover test event before rerunning. Tick the checkbox authorizing creation and deletion of one temporary event, then click **Authorize write access and test event + Meet + cleanup**.
4. Select the configured `@tmgeorgia.ge` account and approve the **new write permission** on Google’s consent screen. If consent is granular, select the Calendar checkbox. The app verifies the signed Google identity and actual issued scope before making any write. Google may include this app’s previously granted read-only scope; the write flow permits that known prior grant but rejects unrelated broader permissions. If a later read-only test reports `unexpected_scope` after a write grant, remove the dedicated test app’s consent and reauthorize read-only, or use a separate local test client to isolate grants. Do not change the read test into a write flow.
5. Wait for the callback to finish; Meet generation is asynchronous and is polled up to eight times, two seconds apart. Do not edit source files, restart the server, clear results, or start another test while it is running. A completed result separately reports **Event creation**, **Event identity and content verification**, **Google Meet video link verified**, and **Cleanup: event absent from calendar**, along with the safe run reference and UTC start time. Full success requires all four steps to succeed.

The event title is **learnTM Calendar Integration Test**. Its start is 24 hours after the test, its duration is ten minutes, and it is private and transparent (does not block availability). It has no attendees, recurrence, or reminders. Insert and delete request `sendUpdates=none`; no invitation or notification delivery is requested. Google Calendar supplies the Meet conference through `conferenceDataVersion=1` and a unique `hangoutsMeet` conference request. The test verifies a successful conference response and an HTTPS Google Meet video entry point without retaining or displaying the meeting URL. No separate Meet REST API or Gmail access is needed. [Calendar insert](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert), [conference generation states](https://developers.google.com/workspace/calendar/api/v3/reference/events#resource)

### Cleanup guarantees and interruptions

The server generates a cryptographically random Calendar-compatible event ID and a unique private run marker. There is **one insert attempt per completed write authorization**, with no insert retry. It never lists existing events or accepts an event ID/title/calendar from the browser. It reads and deletes only that generated ID under `primary`, after verifying the marker, title, exact times, absence of guests/recurrence, and current version. A conditional `If-Match` delete protects against a change between that check and deletion. A marker/content mismatch or missing version refuses deletion. Only HTTP 412 permits another attempt: after a short delay, the server re-fetches that exact ID, repeats every identity/content check, and uses the newly fetched ETag. There are at most three conditional DELETE attempts (250/500 ms delays); persistent conflicts are reported as refused. Other errors and lost responses do not trigger mutation retries. [Resource version checks](https://developers.google.com/workspace/calendar/api/guides/version-resources), [event deletion](https://developers.google.com/workspace/calendar/api/v3/reference/events/delete)

The previous implementation already used a fresh cleanup GET, but stopped on its first HTTP 412. That response indicates a precondition/version conflict between the cleanup read and deletion; it does not identify the actor or prove that asynchronous Meet processing caused it. Safe result diagnostics now show deletion attempts, 412 counts, whether the first cleanup version differed from the last successful verification read, and whether a re-fetch after a conflict observed a changed version. They retain no raw ETags. A “not observed” flag does not establish that no changes occurred between requests.

Start and end now derive from one sampled clock, aligned to whole seconds **before insertion**. This avoids requesting fractional milliseconds and then treating a second-normalized response as a different event. Retrieved instants still must match exactly; there is no tolerance or rounding of returned event times. Equivalent RFC3339 timezone offsets represent the same instant and are accepted. Identity markers and conditional deletion are unchanged.

On a mismatch, the result lists only failed check names: event ID, private marker, title, start/end instant, guests/recurrence, cancellation, or event version. Meet checks separately identify conference type, request identity, generation status, or video URL validation. No raw event body, marker value, conference URL, credential, or token is added to these diagnostics. If event validation fails before Meet inspection, Meet verification is reported as **not attempted**, rather than a failed conference generation request.

For one controlled retry after manually removing a previous leftover: reload the admin page, clear its old result, and use the write button **once** with the confirmation checkbox and the existing `calendar.events.owned` grant. Keep the server running until all four steps finish. Cleanup success may show HTTP 404/410, indicating the post-deletion check confirmed absence. If any check fails or cleanup is refused/unconfirmed, stop and record only the result code, failed check names, and HTTP status; inspect the exact run reference manually before another attempt. No further Cloud Console, redirect URI, scope, or environment changes are required for this verification fix.

### Confirming the implementation used by the running server

The development server previously cached an entire `CalendarConnectivityTest` instance on `globalThis`. That retained its old methods and imported write-test function across HMR, even when the page and files on disk were newer. An offline probe on the live server reproduced `event_verification_failed` with a `.749Z` scheduled start and refused cleanup from that cached engine, while the newly loaded implementation passed the same simulated API responses with `.000Z`.

The cache now contains only transaction data: pending flows, session-bound safe results, and running-test locks. Each module evaluation constructs the current executable engine around that data. Existing data is migrated without retaining old methods. The timestamp fix therefore survives real HMR updates without resetting the one-time state or cleanup locks.

Before another controlled manual test, verify the admin page shows **Loaded test implementation: `owned-write-etag-retry-v4`**. Old results are explicitly labeled **legacy — implementation not recorded**; displaying them does not execute the new code. Clear the old result, authorize one write test, and verify the completed result also carries `owned-write-etag-retry-v4`. A `.000Z` suffix is JavaScript's ISO representation of a whole second; a nonzero suffix such as `.749Z` must not appear in a newly scheduled start.

While logged in as an admin, `http://localhost:31997/api/admin/calendar-test/runtime` runs an **offline** synthetic probe through the loaded engine and current code. It returns implementation identity, whole-second handling, field-check booleans, and simulated verification/cleanup statuses. It never contacts Google or operates on real events, and does not confirm real account capabilities. Run `node tests/google-calendar-runtime-browser.mjs` from `apps/web` to test it before and after a real HMR source reevaluation; the script restores the source bytes exactly. The callback also returns the safe implementation identifier in `X-Calendar-Test-Implementation`.

Cleanup runs after successful creation even if Meet verification fails. An insert timeout or server failure may have created the event despite a lost response: cleanup checks only the generated ID and deletes it only if the private marker and expected contents match. An explicitly rejected or colliding insert is never followed by deletion. Deletion is not retried blindly; a subsequent read confirms absence (404/410 or a cancelled-event tombstone), including when the DELETE response was lost. Failure of the absence check is reported as unconfirmed cleanup, not success.

If cleanup fails or is unknown, use the **exact run reference, UTC start time, and title** shown in the admin result to inspect your primary calendar. Verify the run reference in the description before deleting only that event manually. Do not select other events by title alone, and resolve it before running another write test. A deleted Calendar event is not a guarantee that its Meet conference URL is immediately invalidated; the test never joins or distributes it.

Tokens remain local variables in the callback and are discarded when it finishes. No offline access or refresh token is requested or persisted. Only safe result metadata is kept in server memory for 30 minutes. Clearing results or restarting cannot clean up an event after its token has been discarded. A process crash/interruption can prevent the cleanup `finally` block from running; inspect the primary calendar at the test’s execution time plus 24 hours and verify its run description if no result returns. There is deliberately no background retry/token storage system in this local test.

### Write failure interpretation

- **`admin_policy_enforced` / explicit `domainPolicy`:** organization policy restriction; ask the Workspace administrator to review this client ID and the new `calendar.events.owned` scope for this user. Read approval does not imply write approval.
- **`access_denied` alone:** ambiguous. Check cancellation, Test users, and the Google error-screen explanation before attributing it to an administrator.
- **`invalid_client`, `redirect_uri_mismatch`, `invalid_scope`, `org_internal`, `invalid_grant`:** OAuth/client/audience/code configuration or flow errors, separate from Calendar API execution.
- **`missing_scope` / `insufficient_scope`:** write consent was not issued or was insufficient. No write is attempted if the required scope is missing from the issued token.
- **Calendar HTTP 400:** request/conference capability rejection; check Calendar/Meet support, licensing, and policies. It does not by itself prove an administrator block. **HTTP 409:** insert conflict; no retry or cleanup of an existing event.
- **`meet_failed` / `meet_timeout`:** event creation and conference generation are distinct. Check the creation and cleanup steps; a Meet failure does not automatically mean an OAuth failure or Workspace restriction.
- **`cleanup_failed`, `cleanup_refused`, `cleanup_unverified`, or cleanup network/API errors:** inspect only the recorded run manually. The event/Meet test is not fully successful until cleanup is confirmed.
- **Local HTTP 400 / 409:** explicit write confirmation was missing, or a test is already running. Missing/null/foreign POST Origins remain HTTP 403. Admin login and the `admin` role remain mandatory.

Run `pnpm --filter @tm/web test:calendar-oauth` for the isolated OAuth, write, and cleanup safety tests. They never contact Google. From `apps/web`, `node tests/google-calendar-test-browser.mjs` checks both actual authorization forms, their scope/Origin redirects, checkbox enforcement, and protected endpoints while aborting all external browser requests. It does not complete Google consent or create an event. A manual write authorization is still required to establish real Workspace creation/Meet/cleanup results.

## 1. Create a separate Google Cloud test project

1. Sign in to [Google Cloud Console](https://console.cloud.google.com/) with an account allowed to manage a project. Create a **new project**, for example `learnTM Calendar Local Test`. Do not reuse production OAuth credentials. If the international organization prevents project creation, use a permitted development project/account or ask its administrator to create this separate project. Owning a Google Cloud project does not grant access to Workspace users’ data.
2. Select the new project. Open **APIs & Services → Library**, find **Google Calendar API**, and click **Enable**. Confirm it appears under **Enabled APIs & services** in this same project. No Gmail API or Meet REST API is needed.
3. Open **Google Auth Platform → Branding** (or OAuth consent screen → Get started). Enter an unmistakable test name, a support email, and developer contact email. Do not upload a logo or add production website domains for this localhost-only test.
4. Under **Audience**, select **External** and keep publishing status **Testing**. External allows a test account from the international organization to attempt consent. **Internal** works only if the Cloud project belongs to that account’s actual Google Cloud / Workspace organization; an email domain alone does not establish this. Do not publish the app to production for this test.
5. Under **Audience → Test users**, add the **exact Google account address** you will use, including `@tmgeorgia.ge`. An email alias can differ from the Google account’s sign-in identity; verify the actual account email. Add each account separately if testing more than one. Being a Cloud project editor does not replace being an OAuth test user.
6. Under **Data Access → Add or remove scopes**, configure only:

   | Scope | Purpose |
   | --- | --- |
   | `openid` | Verify Google’s signed account identity token. |
   | `https://www.googleapis.com/auth/userinfo.email` | Verify the precise account email; the authorization request uses its `email` shorthand. |
   | `https://www.googleapis.com/auth/calendar.events.owned.readonly` | Read events on owned calendars; this test targets `primary`. Narrower than reading all accessible calendars. |

   Calendar scopes may appear under sensitive scopes. Leave broader Calendar, profile, Contacts, Gmail, and write permissions unselected. This test deliberately verifies event-read connectivity; an availability-only design could instead use a free/busy scope and endpoint.
7. Under **Clients → Create client**, choose **Web application**, named `learnTM localhost Calendar test`.
8. Set **Authorized redirect URIs** to exactly:

   ```text
   http://localhost:31997/api/admin/calendar-test/callback
   ```

   Match `http`, `localhost`, port, path, and absence of a trailing slash. Do not use `127.0.0.1`, the LAN IP, or `learnTM.ge` for this test. Localhost is the development exception to Google’s HTTPS redirect requirement. **Authorized JavaScript origins can remain empty**: the browser never calls Google APIs with tokens, and no Google JavaScript SDK is used.
9. Save the client. Copy its client ID and secret directly into the ignored local environment file below. If you download a credential JSON file, keep it outside this repository. Do not paste secrets into chat, source files, screenshots, shell commands, or browser tools. The OAuth client ID is public metadata and can be supplied to the Workspace administrator; the client secret must not be shared with them.

Google’s instructions: [consent screen and scopes](https://developers.google.com/workspace/guides/configure-oauth-consent), [Web server OAuth and redirect rules](https://developers.google.com/identity/protocols/oauth2/web-server), [Testing and Internal audience behavior](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview).

## 2. Configure localhost privately

Edit `apps/web/.env` in your local editor. Add these settings, replacing the three placeholders with the new client and exact Workspace account:

```dotenv
GOOGLE_CALENDAR_TEST_ENABLED=true
GOOGLE_CALENDAR_TEST_CLIENT_ID=YOUR_LOCAL_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CALENDAR_TEST_CLIENT_SECRET=YOUR_LOCAL_WEB_CLIENT_SECRET
GOOGLE_CALENDAR_TEST_EMAIL=YOUR_ACCOUNT@tmgeorgia.ge
```

Never prefix these settings with `NEXT_PUBLIC_`. This file is ignored by Git; `.env.example` contains blank placeholders only. The feature defaults to disabled and is always disabled in production, even if its flag is accidentally enabled there. Next.js reloads `.env` during development; restart with the established command if the page still shows incomplete configuration:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Reuse the existing server if it has reloaded the environment. Stop the existing host dev process before restarting; do not launch a competing instance. This startup keeps SQL Server and Azurite in Docker and stops the competing Docker web container. Do not run seeds.

## 3. Perform the manual read-only authorization

1. Open a regular browser at `http://localhost:31997/admin/login` and sign in with an existing **site admin** account. The site admin and Google account are separate identities. Editors are not allowed to run the test.
2. Open [the local test page](http://localhost:31997/admin/calendar-test). Check that configuration is ready. Keep this browser and admin session throughout the test.
3. Click **Authorize and test read-only Calendar access**. Select the exact configured `@tmgeorgia.ge` Google account. Confirm that Google displays your **separate local test app** and only the scopes above. Grant the read-only Calendar checkbox if shown. The app verifies email, email verification, signed token audience/issuer/expiry, nonce, and a managed Workspace hosted-domain claim. A parent organization’s hosted domain may legitimately differ from `tmgeorgia.ge`; it is not incorrectly forced to match the email domain.
4. If Google shows an unverified-app notice, verify the client and test account first; continue only for the test app you just created if Google permits it. Do not change organization policy to bypass an explicit administrator block. If Google blocks consent before a redirect, record the **displayed error code and explanation**, without copying the full URL, authorization code, or tokens. The app cannot diagnose a screen Google never sends back to localhost.
5. On return, the server exchanges the code using the client secret and S256 PKCE, verifies the account, and issues exactly one Calendar request:

   ```text
   GET https://www.googleapis.com/calendar/v3/calendars/primary/events
       ?maxResults=1&timeMin=<now>&timeMax=<now+24h>&fields=kind
   ```

   This asks only for the collection marker `calendar#events`, with no event titles, IDs, descriptions, guest addresses, or other event content. HTTP 200 with that marker succeeds even when the calendar is empty. The read-only flow makes no Calendar POST, PATCH, PUT, or DELETE requests. The OAuth token exchange itself is necessarily a POST to Google’s token endpoint.
6. Read **Test result**. Success requires both verified authorization and a successful read. Record the safe result code, stage, HTTP status, and timestamp if troubleshooting. Token issuance alone does not count as Calendar success. Success applies only to this client, user, read-only scope, and current organization policy; it does not prove future write permissions.

Pending flows expire after 10 minutes and can be used once. Safe results last 30 minutes, are bound to the exact admin session, and disappear on restart. An authorization attempt that never returns can leave an older result visible; always check its timestamp or clear it before retrying.

## 4. Interpret failures without conflating causes

| Evidence | Classification and next action |
| --- | --- |
| `admin_policy_enforced`, an explicit organization-block message, or Calendar `domainPolicy` | Workspace administrator restriction. Ask the international organization’s administrator to review the precise client ID and scope, the user’s organizational unit/group, Calendar service access, and API controls. |
| Google says the app is in Testing and this user is not approved | Missing **OAuth Test user**. Add that exact account under Audience → Test users. This is separate from Workspace app approval. |
| `access_denied` alone / generic “Access blocked” | Ambiguous: cancellation, missing test user, policy, or another denial. Read Google’s displayed explanation. Do not report this as a proven administrator block. |
| `org_internal` | Audience mismatch. The app is Internal to another organization. Use External + Testing, or have the actual Workspace organization own the test project. |
| `redirect_uri_mismatch` | Console/client configuration. Compare the exact redirect URI above with the client used by the local environment. |
| `invalid_client` / `deleted_client` / disabled client | Client configuration. Check project, Web application type, client ID/secret pair, and whether the client is active. Unknown error names are safely shown as `other_error`. |
| `invalid_grant` | Expired/reused code, redirect mismatch during exchange, or PKCE failure. Start again. Not evidence of an administrator restriction. |
| `invalid_scope` | Scope configuration. Check Data Access and the exact scope strings. |
| `missing_scope` / API `insufficientPermissions` / `ACCESS_TOKEN_SCOPE_INSUFFICIENT` | Calendar permission was not granted or is insufficient. Retry with the Calendar consent checkbox selected. |
| `unexpected_scope` | A token included broader grants than this isolated test. Remove this test app’s previous consent and use a fresh separate client. |
| `SERVICE_DISABLED` / `accessNotConfigured` | Enable Calendar API in the project owning this OAuth client, then wait and retry. |
| Generic Calendar HTTP 403 / `forbidden` | Not enough evidence to name the cause. Check Calendar service, calendar ownership/access, and Workspace app controls. |
| HTTP 404 | The primary calendar is unavailable. Open Google Calendar with that account and check service provisioning. |
| `account_mismatch` | The Google identity differs from the exact configured address, is unverified, or lacks a managed-domain claim. No Calendar request was sent. Check sign-in identity versus aliases. |
| `identity_failed` | Signed identity token, nonce, client audience, or verification failed. No Calendar request was sent. Restart the test and check the Web client. |
| `session_error` | Wrong/missing state or cookie, changed admin session, expired flow, replay, or dev server restart. Start again in the same browser. |
| HTTP 401, 429, 5xx, timeout/network error | Token rejection, quota, provider outage, or connectivity. Shown separately; these do not prove Workspace policy. |
| Local 404 / 401 / 403 / 503 | Feature disabled/non-local host/production, no site login, non-admin or wrong POST origin, or incomplete OAuth configuration respectively. |

Google documents [`admin_policy_enforced` and other OAuth errors](https://developers.google.com/identity/protocols/oauth2/web-server#errors). Workspace app controls live under **Admin console → Security → Access and data control → API controls → App access control**. Give the administrator the local app name, full OAuth client ID, exact requested scopes, test user, timestamp, and safe error text. Request the narrowest app/scope approval the organization supports for that test user or organizational unit, rather than organization-wide unrestricted access. Adding a test user does not override these controls. See [Google’s administrator guide](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data).

## 5. What a later booking integration would require

For events on a calendar **owned by the authorizing user**, request a new consent grant for `https://www.googleapis.com/auth/calendar.events.owned`. For an existing shared calendar the user can edit but does not own, `https://www.googleapis.com/auth/calendar.events` may be required, along with the calendar’s writer permission. Do not request the full `calendar` scope when event-specific permission is sufficient. The organization must permit the new scope; a successful read test does not establish this.

To create a Google Meet conference through Calendar, a future implementation would insert the event with `conferenceData.createRequest` (unique request ID, `hangoutsMeet`), use `conferenceDataVersion=1`, populate `attendees[].email`, and use `sendUpdates=all` for invitations. This does **not** require Gmail access, a separate Gmail sending permission, or the Meet REST API merely to generate a Calendar event’s Meet link. The account’s Calendar/Meet services, license capabilities, conference support, and organizational policies must allow the action; external guest and meeting admission policies still apply. Read-only connectivity cannot verify these write-time capabilities. Sources: [event insertion scopes and invitations](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert), [conference creation](https://developers.google.com/workspace/calendar/api/guides/create-events#add_video_and_phone_conferences).

A background booking system would also need explicit offline consent and secure server-side refresh-token storage, refresh/revocation handling, and a separate production OAuth client with an HTTPS callback. External Testing grants generally expire after seven days for these scopes. Publishing/verification requirements and organization approval must be assessed separately. This temporary write test does not implement those production features.

## 6. Cleanup and validation

Click **Clear local test result and pending authorization**, then remove this separate test app at [Google Account third-party connections](https://myaccount.google.com/connections). Clearing local state discards test metadata; it does not revoke Google consent or invalidate an already issued token at Google. Tokens are never persisted and no offline access or refresh token is requested. An unexpected refresh token in a provider response is neither used nor stored. Disable the feature with `GOOGLE_CALENDAR_TEST_ENABLED=false`, remove the three private test settings, and delete the dedicated OAuth client/project when no longer needed.

The callback renders no HTML and redirects immediately to the clean admin URL with `no-store` and `no-referrer` headers. The normal OAuth authorization code necessarily passes through the browser’s callback URL; it is not an access token. Callback request logging is suppressed in Next.js development. No raw provider body, error description, credential, or token is returned to the frontend or logged by the implementation. Avoid browser extensions/proxies that record OAuth traffic and do not export network traces. Only the confidential server contacts the token and Calendar endpoints.

The clean admin test page uses `Referrer-Policy: same-origin`, allowing native form submissions to retain the exact localhost `Origin` required by the CSRF check while withholding referrers from other origins. Applying `no-referrer` to this page makes browsers send `Origin: null` on its form POSTs and causes a local 403 before Google is contacted. OAuth API responses, including the callback, retain `no-referrer`. Missing, null, and foreign POST origins remain rejected.

Run the isolated flow/security tests with:

```powershell
pnpm --filter @tm/web test:calendar-oauth
pnpm --filter @tm/web typecheck
```

The tests cover read-only requests, state/cookie/session binding, PKCE, replay/expiry, account verification, scope minimization, safe diagnostics, and API error classification with synthetic responses. The live browser check is separate and makes no real Google authorization attempt.

With the development server running and the local test enabled, run the browser check from `apps/web` with `node tests/google-calendar-test-browser.mjs`. It reads existing users only, creates an isolated signed admin session in the test browser, checks the actual rendered page and endpoint protections, and clears its local result. A non-admin role is checked live only if an existing active non-admin user is available; no database fixtures are created.
