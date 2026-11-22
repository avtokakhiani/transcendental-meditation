import { prisma } from '@/server/db';
import { listMeetings } from '@/server/services/meetings';

export const runtime = 'nodejs';
export async function GET() {
  try {
    return Response.json({ meetings: await listMeetings(prisma) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'შეხვედრების ჩატვირთვა ვერ მოხერხდა.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
