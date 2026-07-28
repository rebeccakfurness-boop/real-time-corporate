import { prisma } from '@/lib/prisma';

export async function listRisks(organizationId: string) {
  return prisma.psychosocialRisk.findMany({
    where: { organizationId },
    orderBy: [{ priority: 'desc' }, { currentScore: 'desc' }],
    include: { owner: { select: { name: true } } },
  });
}

export async function getRiskDetail(organizationId: string, riskId: string) {
  return prisma.psychosocialRisk.findFirst({
    where: { id: riskId, organizationId },
    include: {
      owner: { select: { name: true, email: true } },
      recommendations: { orderBy: { createdAt: 'desc' } },
      history: { orderBy: { recordedAt: 'asc' } },
    },
  });
}
