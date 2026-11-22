import { createHash } from 'node:crypto';
import { after } from 'next/server';
import { registrationError, registrationSchema } from '@/lib/meetings';
import { prisma } from '@/server/db';
import { notifyMeetingRegistration } from '@/server/meeting-notifications';
import { MeetingUnavailable, registerForMeeting } from '@/server/services/meetings';
import { productionPrivacyBlocked } from '@/lib/privacy-retention';

export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; expires: number }>();
const fail = (status: number, error = registrationError) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (productionPrivacyBlocked()) return fail(503);
  if (request.headers.get('origin') !== new URL(request.url).origin) return fail(403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail(415);
  if (Number(request.headers.get('content-length')) > 8192) return fail(413);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return fail(413); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return fail(400); }
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return fail(400, 'გთხოვ, სწორად შეავსო ყველა სავალდებულო ველი.');
  const now = Date.now();
  for (const [key, attempt] of attempts) if (attempt.expires <= now) attempts.delete(key);
  const key = createHash('sha256').update(parsed.data.email).digest('hex');
  const previous = attempts.get(key);
  if ((previous && previous.count >= 8) || (!previous && attempts.size >= 10000)) return fail(429, 'გთხოვ, სცადო მოგვიანებით.');
  attempts.set(key, { count: (previous?.count || 0) + 1, expires: previous?.expires || now + 600000 });
  try {
    const id = await registerForMeeting(prisma, parsed.data);
    after(async () => { try { await notifyMeetingRegistration(id); } catch { console.error('Meeting notification remains pending.'); } });
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof MeetingUnavailable) return fail(409, 'ამ შეხვედრაზე რეგისტრაცია აღარ არის ხელმისაწვდომი. აირჩიე სხვა შეხვედრა.');
    return fail(503);
  }
}
