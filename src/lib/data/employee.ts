import { prisma } from '@/lib/prisma';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getEmployeeHomeData(userId: string, organizationId: string) {
  const [todayCheckIn, recentCheckIns, latestWho5, challenges, resources] = await Promise.all([
    prisma.checkIn.findFirst({ where: { userId, createdAt: { gte: startOfToday() } } }),
    prisma.checkIn.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 14 }),
    prisma.who5Result.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.challengeParticipant.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { joinedAt: 'desc' },
      take: 3,
    }),
    prisma.learningResource.findMany({
      where: { OR: [{ organizationId }, { organizationId: null }] },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { todayCheckIn, recentCheckIns, latestWho5, challenges, resources };
}
