import { prisma } from '@/lib/prisma';

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function getComplianceOverview(organizationId: string) {
  const [risks, controls, overdueActions, upcomingReviewActions] = await Promise.all([
    prisma.psychosocialRisk.findMany({
      where: { organizationId },
      include: { controls: true },
    }),
    prisma.riskControl.findMany({ where: { organizationId } }),
    prisma.actionPlanItem.findMany({
      where: { organizationId, status: { notIn: ['COMPLETED'] }, dueDate: { lt: new Date() } },
      include: { risk: { select: { title: true, category: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.actionPlanItem.findMany({
      where: { organizationId, status: { notIn: ['COMPLETED'] }, reviewDate: { gte: new Date(), lte: daysFromNow(30) } },
      include: { risk: { select: { title: true } } },
      orderBy: { reviewDate: 'asc' },
    }),
  ]);

  const bySeverity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => ({
    priority,
    count: risks.filter((r) => r.priority === priority).length,
  }));

  const byCategory = new Map<string, number>();
  for (const r of risks) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1);

  const risksWithoutControls = risks.filter((r) => r.controls.filter((c) => c.status === 'ACTIVE').length === 0);

  const upcomingRiskReviews = risks
    .filter((r) => r.nextReviewDate && r.nextReviewDate >= new Date() && r.nextReviewDate <= daysFromNow(30))
    .sort((a, b) => (a.nextReviewDate!.getTime() - b.nextReviewDate!.getTime()));

  const controlEffectiveness = ['HIGH', 'MEDIUM', 'LOW', 'NOT_YET_ASSESSED'].map((effectiveness) => ({
    effectiveness,
    count: controls.filter((c) => c.effectiveness === effectiveness).length,
  }));

  const withResidual = risks.filter((r) => r.residualScore != null);
  const avgCurrent = risks.length ? risks.reduce((s, r) => s + r.currentScore, 0) / risks.length : 0;
  const avgResidual = withResidual.length ? withResidual.reduce((s, r) => s + (r.residualScore ?? 0), 0) / withResidual.length : null;
  const avgTarget = risks.filter((r) => r.targetScore != null).length
    ? risks.reduce((s, r) => s + (r.targetScore ?? 0), 0) / risks.filter((r) => r.targetScore != null).length
    : null;

  const improving = risks.filter((r) => r.trend === 'IMPROVING').length;
  const worsening = risks.filter((r) => r.trend === 'WORSENING').length;
  const stable = risks.filter((r) => r.trend === 'STABLE').length;

  return {
    totalRisks: risks.length,
    bySeverity,
    byCategory: Array.from(byCategory.entries()).map(([category, count]) => ({ category, count })),
    risksWithoutControls,
    overdueActions,
    upcomingRiskReviews,
    upcomingReviewActions,
    controlEffectiveness,
    residualRiskProfile: { avgCurrent, avgResidual, avgTarget },
    historicalImprovement: { improving, worsening, stable },
  };
}
