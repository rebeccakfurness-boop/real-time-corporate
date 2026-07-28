import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isLeaderRole } from '@/lib/rbac';
import { publishActivityEvent } from '@/lib/activity';
import type { ActivityEventType, EventSeverity } from '@prisma/client';

// Demo/QA helper: manually emits a realistic, de-identified activity event so the
// Live Data Feed can be exercised without waiting for real employee submissions.
const TEMPLATES: { type: ActivityEventType; severity: EventSeverity; message: string }[] = [
  { type: 'CHECKIN_SUBMITTED', severity: 'INFO', message: 'New daily check-in submitted' },
  { type: 'PARTICIPATION_MILESTONE', severity: 'POSITIVE', message: 'Participation crossed 75% this week' },
  { type: 'RISK_EMERGING', severity: 'WARNING', message: 'Workload pressure trending up in Operations' },
  { type: 'RISK_IMPROVING', severity: 'POSITIVE', message: 'Psychological safety score improving in Product' },
  { type: 'SPEAK_UP_SUBMITTED', severity: 'WARNING', message: 'New anonymous Speak Up report received' },
  { type: 'BURNOUT_CHANGE', severity: 'CRITICAL', message: 'Burnout index rose sharply in Customer Support' },
  { type: 'CHALLENGE_ACTIVITY', severity: 'POSITIVE', message: 'Mindfulness challenge reached 40 participants' },
];

export async function POST() {
  const session = await auth();
  if (!session || !isLeaderRole(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]!;
  const event = await publishActivityEvent({ organizationId: session.user.organizationId, ...template });

  return NextResponse.json({ event });
}
