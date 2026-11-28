import { notFound, redirect } from 'next/navigation';
import { configuration, connectivity, testActor } from '@/server/google-calendar-test';
import { CALENDAR_SCOPE, MESSAGES, REDIRECT_URI, WRITE_CALENDAR_SCOPE } from '@/server/google-calendar-test-core';
import { VERIFICATION_CHECK_LABELS } from '@/server/google-calendar-write-test';

export const dynamic = 'force-dynamic';

export default async function CalendarTestPage() {
  const actor = await testActor();
  if (actor.status === 401) redirect('/admin/login');
  if (actor.status !== 200) notFound();
  const config = configuration();
  const result = connectivity.result(actor.owner);
  const running = connectivity.isRunning(actor.owner);
  return <div className="mx-auto max-w-3xl space-y-6 text-plum-800">
    <h1 className="text-2xl">Google Calendar connectivity test</h1>
    <p className="text-sm" data-calendar-test-implementation={connectivity.implementationRevision}>Loaded test implementation: <code>{connectivity.implementationRevision}</code>.</p>
    <p>Temporary localhost tests for administrators. Verify read access, or separately authorize creation, Google Meet verification, and automatic cleanup of one temporary event on the configured Workspace account’s primary calendar.</p>
    <dl className="space-y-3 rounded-xl border border-cream-300 p-5 text-sm">
      <dt>Configuration</dt><dd>{config ? 'Ready for manual authorization' : 'Incomplete: configure the four GOOGLE_CALENDAR_TEST_* settings in apps/web/.env using docs/google-calendar-local-test.md.'}</dd>
      <dt>Calendar permission</dt><dd className="break-all"><code>{CALENDAR_SCOPE}</code></dd>
      <dt>Identity permissions</dt><dd><code>openid email</code> — confirms the exact configured account and its managed Workspace identity.</dd>
      <dt>Redirect URI</dt><dd className="break-all"><code>{REDIRECT_URI}</code></dd>
    </dl>
    <section aria-live="polite" className="space-y-3 rounded-xl bg-cream-200 p-5">
      <h2 className="text-lg">Test result</h2>
      {result ? <>
        <p className="font-medium">{result.code === 'success' || result.code === 'write_success' ? 'Connection test succeeded' : `Test did not complete: ${result.code}`}</p>
        <p>{MESSAGES[result.code]}</p>
        <p className="text-sm">Result implementation: <code>{result.implementation ?? 'legacy — implementation not recorded'}</code>. This identifies the code that executed the test; loading this page does not rerun it.</p>
        <p className="text-sm">Test: {result.mode === 'write' ? 'write access and Google Meet' : 'read-only'}. Stage: {result.stage}. Verified account authorization: {result.authorizationSucceeded ? 'succeeded' : 'not established'}.</p>
        {result.mode !== 'write' && <p className="text-sm">Calendar read: {result.code === 'success' ? 'succeeded' : result.stage === 'calendar' ? 'failed' : 'not attempted'}.</p>}
        {result.mode === 'write' && !result.write && <p className="text-sm">Event creation, Meet generation, and cleanup were not attempted.</p>}
        {result.write && <div className="space-y-3 text-sm">
          <ul className="list-disc space-y-2 pl-5">{([
            ['Event creation', result.write.creation], ['Event identity and content verification', result.write.verification ?? { status: 'unknown' }], ['Google Meet video link verified', result.write.meet], ['Cleanup: event absent from calendar', result.write.cleanup],
          ] as const).map(([label, step]) => <li key={label}><strong>{label}:</strong> {step.status}{step.httpStatus ? ` (HTTP ${step.httpStatus})` : ''}{step.code ? ` — ${MESSAGES[step.code]}` : ''}{step.failedChecks?.length ? <p>Failed checks: {step.failedChecks.map(check => VERIFICATION_CHECK_LABELS[check]).join(', ')}.</p> : null}</li>)}</ul>
          <p>Run reference: <code className="break-all">{result.write.eventId}</code>. Scheduled start: {result.write.startsAt} (UTC).</p>
          {result.write.cleanup.deleteAttempts !== undefined && <p>Conditional deletion attempts: {result.write.cleanup.deleteAttempts}. HTTP 412 conflicts: {result.write.cleanup.versionConflicts}. Version changed since verification: {result.write.cleanup.versionChangedSinceVerification ? 'yes' : 'not observed'}. Version changed on re-fetch after conflict: {result.write.cleanup.versionChangedAfterConflict ? 'yes' : 'not observed'}.</p>}
          {result.write.cleanup.status !== 'succeeded' && <p className="font-medium">If creation succeeded or is unknown, check your primary Google Calendar for “learnTM Calendar Integration Test” at this exact start time, then verify the run reference in its description before manually deleting it. Do not rerun until any leftover event is resolved. Clear/restart cannot clean up without a token.</p>}
        </div>}
        <p className="text-sm">Checked at {result.checkedAt}{result.httpStatus ? `; Google HTTP ${result.httpStatus}` : ''}.</p>
      </> : <p>Not tested. Authorization requires the account holder to complete Google consent. If Google blocks the request without returning here, use its displayed error code and the setup guide; no result here does not prove an administrator restriction.</p>}
    </section>
    {running && <p role="status">A Calendar test is running. Wait for its verification and cleanup to finish. Do not restart the development server.</p>}
    <section className="space-y-4 rounded-xl border border-cream-300 p-5">
      <h2 className="text-lg">Read-only access test</h2>
      <p className="text-sm">Requests only the read scope above and reads a collection marker. No events are changed.</p>
      <form method="post" action="/api/admin/calendar-test/start">
        <button disabled={!config || running} className="rounded-full bg-plum-800 px-5 py-3 text-cream-100 disabled:opacity-40">Authorize and test read-only Calendar access</button>
      </form>
    </section>
    <section className="space-y-4 rounded-xl border border-cream-300 p-5">
      <h2 className="text-lg">Write-access test: create event + Google Meet, then delete</h2>
      <p className="break-all text-sm">Required write scope: <code>{WRITE_CALENDAR_SCOPE}</code>. Add it in Google Auth Platform → Data Access before authorizing. The existing client, redirect URI, test user, and environment settings remain the same.</p>
      <p className="text-sm">Creates exactly one private, transparent, ten-minute “learnTM Calendar Integration Test” event starting 24 hours from now. No attendees, invitations, notification updates, or reminders are requested. It verifies a Google Meet video link, then attempts to delete only this run’s marked event and confirms absence. Keep the server running until the result returns; interruption or API failures can leave a test event requiring manual cleanup.</p>
      <form method="post" action="/api/admin/calendar-test/start-write" className="space-y-4">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="confirmWrite" value="yes" required disabled={!config || running} />I authorize creation and automatic deletion of one temporary event on my primary calendar, with no participants.</label>
        <button disabled={!config || running} className="rounded-full bg-plum-800 px-5 py-3 text-cream-100 disabled:opacity-40">Authorize write access and test event + Meet + cleanup</button>
      </form>
    </section>
    <form method="post" action="/api/admin/calendar-test/clear"><button className="text-sm underline">Clear local test result and pending authorization</button></form>
    <p className="text-sm">Tokens are used only on the server during the test and then discarded. No offline access or refresh token is requested. Results expire after 30 minutes; pending authorizations after 10 minutes. Clear or restart removes local state, but does not revoke the Google consent grant. Remove the separate test app under Google Account → Security → Third-party connections when finished.</p>
  </div>;
}
