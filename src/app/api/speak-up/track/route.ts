import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SPEAK_UP_STATUS_LABELS } from '@/lib/labels';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Tracking code is required.' }, { status: 400 });

  const report = await prisma.speakUpReport.findUnique({
    where: { trackingCode: code },
    select: {
      trackingCode: true, category: true, status: true, createdAt: true, updatedAt: true,
      messages: { orderBy: { createdAt: 'asc' }, select: { fromLeader: true, body: true, createdAt: true } },
    },
  });

  if (!report) return NextResponse.json({ error: 'No report found for that tracking code.' }, { status: 404 });

  return NextResponse.json({
    ...report,
    statusLabel: SPEAK_UP_STATUS_LABELS[report.status] ?? report.status,
  });
}
