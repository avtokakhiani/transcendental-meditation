import { createHash } from 'node:crypto';
import { after } from 'next/server';
import { corporateDeliveryError, corporateInquirySchema } from '@/lib/corporate-inquiry';
import { productionPrivacyBlocked } from '@/lib/privacy-retention';
import { prisma } from '@/server/db';
import { env } from '@/env';
import { storeCorporateInquiry } from '@/server/services/corporate-inquiries';
import { notifyCorporateInquiry } from '@/server/corporate-notifications';

export const runtime = 'nodejs';

// Bounded, short-lived throttling for this server process. Provider idempotency
// also protects identical submissions across processes and server restarts.
const attempts = new Map<string, { count: number; expires: number }>();
const WINDOW = 10 * 60 * 1000;
const fail = (status: number, error = corporateDeliveryError) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (productionPrivacyBlocked()) return fail(503);
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return fail(403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail(415);
  if (Number(request.headers.get('content-length')) > 20_000) return fail(413);

  let raw: string;
  try {
    // Bound actual bytes too, including requests without a content-length header.
    const reader = request.body?.getReader();
    if (!reader) return fail(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20_000) { await reader.cancel(); return fail(413); }
      chunks.push(value);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  } catch { return fail(400); }

  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return fail(400); }
  const parsed = corporateInquirySchema.safeParse(payload);
  if (!parsed.success) return fail(400, 'გთხოვთ, შეამოწმოთ შევსებული ველები.');
  const inquiry = parsed.data;
  const now = Date.now();
  if (inquiry.website || now - inquiry.startedAt < 2000 || now - inquiry.startedAt > 24 * 60 * 60 * 1000) return fail(400);

  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  // Do not trust caller-supplied forwarded IP headers. Rate-limit by normalized
  // email; a production edge may additionally enforce trusted IP-based limits.
  const key = createHash('sha256').update(inquiry.email.toLowerCase()).digest('hex');
  const previous = attempts.get(key);
  if (previous && previous.count >= 5) return fail(429, 'გთხოვთ, სცადოთ მოგვიანებით.');
  if (!previous && attempts.size >= 10_000) return fail(429);
  attempts.set(key, { count: (previous?.count ?? 0) + 1, expires: previous?.expires ?? now + WINDOW });

  try {
    const saved = await storeCorporateInquiry(prisma, inquiry, env.AUTH_SECRET);
    after(async () => { try { await notifyCorporateInquiry(saved.id); } catch { console.error('Corporate notification pending.'); } });
    return Response.json({ ok: true });
  } catch { return fail(503); }
}
