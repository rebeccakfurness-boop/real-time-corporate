import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { answerRiskQuestion, answerOrgQuestion } from '@/lib/ai/risk-assistant';
import { getOrganisationSnapshot } from '@/lib/data/dashboard';

const bodySchema = z.object({
  question: z.string().min(3).max(500),
  riskId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !can(session.user.role, 'risks:view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { question, riskId } = parsed.data;

  try {
    if (riskId) {
      const risk = await prisma.psychosocialRisk.findFirst({
        where: { id: riskId, organizationId: session.user.organizationId },
        include: { stateChanges: true, actionPlanItems: true, controls: true },
      });
      if (!risk) return NextResponse.json({ error: 'Risk not found' }, { status: 404 });

      const result = await answerRiskQuestion({ risk }, question);
      return NextResponse.json(result);
    }

    const snapshotResult = await getOrganisationSnapshot(session.user.organizationId, { rangeDays: 30 });
    if (snapshotResult.suppressed) {
      return NextResponse.json({
        answer: 'Not enough data in the current view to answer — too few people match the active filters to protect anonymity.',
        source: 'template',
      });
    }

    const result = await answerOrgQuestion(
      { snapshot: snapshotResult.data, topRisks: [...snapshotResult.data.highRiskAreas, ...snapshotResult.data.emergingRisks] },
      question
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Assistant failed to respond' }, { status: 500 });
  }
}
