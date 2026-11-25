import { prisma } from '@/server/db';
import { listMeetings } from '@/server/services/meetings';
import { publicMeetingRegistrationEnabled } from '@/lib/meeting-registration-policy';

export const runtime = 'nodejs';
export async function GET() {
  if (!publicMeetingRegistrationEnabled()) {
    return Response.json({ meetings: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    return Response.json({ meetings: await listMeetings(prisma) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'შეხვედრების ჩატვირთვა ვერ მოხერხდა.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
