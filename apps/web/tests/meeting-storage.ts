// Integration test uses its own throwaway database; it never schedules public meetings.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { listMeetings, MeetingUnavailable, registerForMeeting } from '../src/server/services/meetings';
import { registrationSchema } from '../src/lib/meetings';

async function main() {
process.loadEnvFile('.env');
const sourceUrl = process.env.DATABASE_URL!;
assert.ok(/database=[^;]+/i.test(sourceUrl), 'Expected SQL Server database parameter.');
const database = `tm_meetings_test_${randomUUID().replaceAll('-', '')}`;
assert.match(database, /^tm_meetings_test_[a-f0-9]{32}$/);
const testUrl = sourceUrl.replace(/database=[^;]+/i, `database=${database}`);
const admin = new PrismaClient({ datasourceUrl: sourceUrl });
const db = new PrismaClient({ datasourceUrl: testUrl });
try {
  await admin.$executeRawUnsafe(`CREATE DATABASE [${database}]`);
  execFileSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: testUrl }, stdio: 'pipe',
  });
  const tomorrow = new Date(Date.now() + 86400000);
  const meeting = await db.introductoryMeeting.create({ data: {
    startsAt: tomorrow, format: 'online', status: 'open', capacity: 2, joiningInstructions: 'PRIVATE TEST INSTRUCTIONS',
  } });
  const input = (email: string) => registrationSchema.parse({ meetingId: meeting.id, firstName: 'Test', lastName: 'Participant', email, phone: '+995511111111' });
  const submissions = await Promise.allSettled(Array.from({ length: 6 }, (_, i) => registerForMeeting(db, input(`person${i}@example.invalid`))));
  assert.equal(submissions.filter(result => result.status === 'fulfilled').length, 2, 'Concurrent requests must not overbook.');
  assert.equal(await db.meetingRegistration.count({ where: { meetingId: meeting.id } }), 2);
  const saved = await db.meetingRegistration.findFirstOrThrow({ where: { meetingId: meeting.id } });
  await Promise.all(Array.from({ length: 4 }, () => registerForMeeting(db, input(saved.email.toUpperCase()))));
  assert.equal(await db.meetingRegistration.count(), 2, 'Normalized duplicate submissions must not consume seats.');
  const future = await db.introductoryMeeting.create({ data: { startsAt: new Date(tomorrow.getTime() + 86400000), format: 'in_person', location: 'TEST LOCATION', status: 'closed' } });
  const deadline = await db.introductoryMeeting.create({ data: { startsAt: tomorrow, format: 'online', status: 'open', registrationClosesAt: new Date(Date.now() - 1000) } });
  const draft = await db.introductoryMeeting.create({ data: { startsAt: tomorrow, format: 'online', status: 'draft' } });
  const past = await db.introductoryMeeting.create({ data: { startsAt: new Date(Date.now() - 1000), format: 'online', status: 'open' } });
  for (const unavailable of [future, deadline, draft, past]) {
    await assert.rejects(registerForMeeting(db, { ...input('blocked@example.invalid'), meetingId: unavailable.id }), MeetingUnavailable);
  }
  const publicMeetings = await listMeetings(db);
  assert.equal(publicMeetings.length, 3);
  assert.equal(publicMeetings.find(value => value.id === meeting.id)?.availability, 'full');
  assert.equal(publicMeetings.find(value => value.id === deadline.id)?.availability, 'closed');
  assert.equal(publicMeetings.at(-1)?.id, future.id);
  const serialized = JSON.stringify(publicMeetings);
  assert.ok(!serialized.includes(saved.email) && !serialized.includes('PRIVATE TEST INSTRUCTIONS'));
  assert.ok(!registrationSchema.safeParse({ ...input('valid@example.invalid'), phone: '---' }).success);
  assert.ok(!registrationSchema.safeParse({ ...input('valid@example.invalid'), firstName: ' ' }).success);
  const { notifyMeetingRegistration } = await import('../src/server/meeting-notifications');
  const realFetch = globalThis.fetch;
  const originalSettings = { RESEND_API_KEY: process.env.RESEND_API_KEY, MEETINGS_FROM_EMAIL: process.env.MEETINGS_FROM_EMAIL, ADMIN_EMAIL: process.env.ADMIN_EMAIL, PRIVACY_EMAIL_DELIVERY_ENABLED: process.env.PRIVACY_EMAIL_DELIVERY_ENABLED };
  const deliveries: { to: string[]; text: string }[] = [];
  try {
    process.env.RESEND_API_KEY = 'test-only';
    process.env.PRIVACY_EMAIL_DELIVERY_ENABLED = 'true';
    process.env.MEETINGS_FROM_EMAIL = 'sender@example.invalid';
    process.env.ADMIN_EMAIL = 'admin@example.invalid';
    globalThis.fetch = async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      deliveries.push(body);
      // Simulate one provider outage; no actual email is sent by the test.
      return deliveries.length === 1 ? new Response('', { status: 503 }) : Response.json({ id: 'test-delivery' });
    };
    await notifyMeetingRegistration(saved.id, db);
    let delivery = await db.meetingRegistration.findUniqueOrThrow({ where: { id: saved.id } });
    assert.equal(delivery.adminNotifiedAt, null);
    assert.ok(delivery.participantNotifiedAt);
    await notifyMeetingRegistration(saved.id, db);
    delivery = await db.meetingRegistration.findUniqueOrThrow({ where: { id: saved.id } });
    assert.ok(delivery.adminNotifiedAt && delivery.participantNotifiedAt);
    await notifyMeetingRegistration(saved.id, db);
    assert.equal(deliveries.length, 3, 'Only the failed audience is retried.');
    assert.ok(deliveries[1]?.text.includes('PRIVATE TEST INSTRUCTIONS'));
  } finally {
    globalThis.fetch = realFetch;
    for (const [key, value] of Object.entries(originalSettings)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  console.log('Passed: SQL concurrency/capacity, normalized duplicates, deadlines, past/draft exclusion, chronology, privacy, validation, notification delivery/retry.');
} finally {
  await db.$disconnect();
  // The validated identifier belongs exclusively to this test, never the site's database.
  await admin.$executeRawUnsafe(`IF DB_ID('${database}') IS NOT NULL BEGIN ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${database}]; END`);
  await admin.$disconnect();
}
}

main().catch(error => { console.error(error); process.exitCode = 1; });
