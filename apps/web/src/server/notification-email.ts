import { productionPrivacyBlocked } from '@/lib/privacy-retention';

export function privateAdminUrl(fragment: string) {
  const base = new URL(process.env.SITE_URL || 'http://localhost:31997');
  if (process.env.NODE_ENV === 'production' && (base.protocol !== 'https:' || !process.env.SITE_URL)) throw new Error('Production SITE_URL must use HTTPS');
  return new URL(`/admin/privacy#${fragment}`, base).href;
}

export async function sendNotificationEmail(input: { from: string; to: string; subject: string; text: string; key: string }) {
  if (productionPrivacyBlocked()) throw new Error('Privacy launch approval required');
  if (process.env.NODE_ENV !== 'production' && process.env.PRIVACY_EMAIL_DELIVERY_ENABLED !== 'true') throw new Error('Pre-launch email delivery is disabled');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': input.key },
    body: JSON.stringify({ from: input.from, to: [input.to], subject: input.subject, text: input.text }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Email provider unavailable');
  const result = await response.json();
  if (typeof result.id !== 'string' || !/^[\w-]{1,100}$/.test(result.id)) throw new Error('Invalid provider receipt');
  return result.id as string;
}
