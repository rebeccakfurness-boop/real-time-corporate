import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { publishActivityEvent } from '@/lib/activity';

const bodySchema = z.object({
  moodScore: z.number().int().min(1).max(5),
  energyScore: z.number().int().min(1).max(5),
  stressScore: z.number().int().min(1).max(5),
  workloadScore: z.number().int().min(1).max(5).optional(),
  reflection: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const checkIn = await prisma.checkIn.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      ...parsed.data,
    },
  });

  await publishActivityEvent({
    organizationId: session.user.organizationId,
    type: 'CHECKIN_SUBMITTED',
    severity: 'INFO',
    message: 'New daily check-in submitted',
  });

  return NextResponse.json({ checkIn }, { status: 201 });
}
