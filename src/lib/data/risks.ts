import { prisma } from '@/lib/prisma';
import type { WellbeingDomain } from '@prisma/client';
import { DEFAULT_K_ANONYMITY_THRESHOLD } from '@/lib/data/k-anonymity';

export interface RiskListFilters {
  departmentName?: string;
  domain?: WellbeingDomain;
}

/**
 * Every identified risk, with department attribution suppressed for departments below
 * the org's k-anonymity threshold — a risk score narrowed down to a very small team can
 * itself be identifying, even without any name attached. Respects the same department/
 * wellbeing-domain filters as the rest of the leader dashboard.
 */
export async function listRisks(organizationId: string, filters: RiskListFilters = {}) {
  const [risks, org, departmentCounts] = await Promise.all([
    prisma.psychosocialRisk.findMany({
      where: {
        organizationId,
        ...(filters.departmentName && { departmentScope: filters.departmentName }),
        ...(filters.domain && { domain: filters.domain }),
      },
      orderBy: [{ priority: 'desc' }, { currentScore: 'desc' }],
      include: {
        controls: true,
        actionPlanItems: { orderBy: { dueDate: 'asc' }, take: 1, where: { status: { not: 'COMPLETED' } } },
      },
    }),
    prisma.organization.findUnique({ where: { id: organizationId }, select: { kAnonymityThreshold: true } }),
    prisma.department.findMany({
      where: { organizationId },
      select: { name: true, _count: { select: { people: true } } },
    }),
  ]);

  const threshold = org?.kAnonymityThreshold ?? DEFAULT_K_ANONYMITY_THRESHOLD;
  const smallDepartments = new Set(departmentCounts.filter((d) => d._count.people < threshold).map((d) => d.name));

  return risks.map((risk) =>
    risk.departmentScope && smallDepartments.has(risk.departmentScope)
      ? { ...risk, departmentScope: 'Organisation-wide (department suppressed — small team)' }
      : risk
  );
}

export async function getRiskDetail(organizationId: string, riskId: string) {
  return prisma.psychosocialRisk.findFirst({
    where: { id: riskId, organizationId },
    include: {
      recommendations: { orderBy: { createdAt: 'desc' } },
      history: { orderBy: { recordedAt: 'asc' } },
      stateChanges: { orderBy: { recordedAt: 'asc' } },
      controls: { orderBy: { createdAt: 'desc' } },
      actionPlanItems: { orderBy: { dueDate: 'asc' } },
    },
  });
}
