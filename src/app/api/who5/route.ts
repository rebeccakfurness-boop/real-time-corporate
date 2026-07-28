import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { publishActivityEvent } from '@/lib/activity';
import { scoreWho5 } from '@/domain/scoring';

const bodySchema = z.object({
  q1Cheerful: z.number().int().min(0).max(5),
  q2Calm: z.number().int().min(0).max(5),
  q3Active: z.number().int().min(0).max(5),
  q4RestedFresh: z.number().int().min(0).max(5),
  q5Interesting: z.number().int().min(0).max(5),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const score = scoreWho5(parsed.data);

  const result = await prisma.who5Result.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      ...parsed.data,
      ...score,
    },
  });

  await publishActivityEvent({
    organizationId: session.user.organizationId,
    type: 'CHECKIN_SUBMITTED',
    severity: score.belowThreshold ? 'WARNING' : 'INFO',
    message: 'New WHO-5 wellbeing assessment submitted',
  });

  return NextResponse.json({ result }, { status: 201 });
}
