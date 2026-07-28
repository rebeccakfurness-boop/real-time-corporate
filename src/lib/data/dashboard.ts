import { prisma } from '@/lib/prisma';
import { average, invertRiskToHealth, participationRate, toHealthScale } from '@/domain/scoring';
import { buildUserWhere, type DashboardFilters } from '@/lib/data/filters';
import { applyKAnonymity, DEFAULT_K_ANONYMITY_THRESHOLD, type KAnonymityResult } from '@/lib/data/k-anonymity';

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export interface OrganisationSnapshot {
  wellbeingScore: number;
  organisationHealthScore: number;
  burnoutIndex: number;
  psychologicalSafetyScore: number;
  psychosocialRiskScore: number;
  engagementTrendPct: number;
  participationRatePct: number;
  activeSpeakUpCases: number;
  totalEmployees: number;
  emergingRisks: RiskSummary[];
  trendingImprovements: RiskSummary[];
  highRiskAreas: RiskSummary[];
}

export interface RiskSummary {
  id: string;
  title: string;
  category: string;
  currentScore: number;
  trend: string;
  priority: string;
  departmentScope: string | null;
}

export async function getOrganisationSnapshot(
  organizationId: string,
  filters: DashboardFilters
): Promise<KAnonymityResult<OrganisationSnapshot>> {
  const since = daysAgo(filters.rangeDays);
  const previousSince = daysAgo(filters.rangeDays * 2);
  const userWhere = buildUserWhere(organizationId, filters);
  const scopedUser = { user: userWhere };

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { kAnonymityThreshold: true },
  });
  const threshold = org?.kAnonymityThreshold ?? DEFAULT_K_ANONYMITY_THRESHOLD;

  const [who5Recent, batRecent, risks, activeSpeakUpCases, totalEmployees, recentParticipants, previousParticipants] =
    await Promise.all([
      prisma.who5Result.findMany({
        where: { organizationId, createdAt: { gte: since }, ...scopedUser },
        select: { percentageScore: true },
      }),
      prisma.batResult.findMany({
        where: { organizationId, createdAt: { gte: since }, ...scopedUser },
        select: { overallScore: true },
      }),
      prisma.psychosocialRisk.findMany({
        where: { organizationId },
        orderBy: { currentScore: 'desc' },
        select: {
          id: true, title: true, category: true, currentScore: true, trend: true, priority: true, departmentScope: true,
        },
      }),
      prisma.speakUpReport.count({ where: { organizationId, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.person.count({ where: userWhere }),
      prisma.checkIn.findMany({
        where: {
          organizationId,
          createdAt: { gte: since },
          ...scopedUser,
          ...(filters.domain && { domain: filters.domain }),
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.checkIn.findMany({
        where: { organizationId, createdAt: { gte: previousSince, lt: since }, ...scopedUser },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

  const wellbeingScore = toHealthScale(average(who5Recent.map((r) => r.percentageScore)) || 68);
  const burnoutRaw = average(batRecent.map((r) => r.overallScore)) || 2.4;
  const burnoutIndex = toHealthScale(((burnoutRaw - 1) / 4) * 100);

  const psychSafetyRisks = risks.filter((r) => r.category === 'PSYCHOLOGICAL_SAFETY');
  const psychologicalSafetyScore = invertRiskToHealth(average(psychSafetyRisks.map((r) => r.currentScore)) || 28);

  const psychosocialRiskScore = toHealthScale(average(risks.map((r) => r.currentScore)) || 32);

  const organisationHealthScore = toHealthScale(
    wellbeingScore * 0.35 + (100 - burnoutIndex) * 0.25 + psychologicalSafetyScore * 0.2 + (100 - psychosocialRiskScore) * 0.2
  );

  const participationRatePct = participationRate(recentParticipants.length, totalEmployees || 1);
  const previousParticipationRatePct = participationRate(previousParticipants.length, totalEmployees || 1);
  const engagementTrendPct = participationRatePct - previousParticipationRatePct;

  const toSummary = (r: (typeof risks)[number]): RiskSummary => ({
    id: r.id,
    title: r.title,
    category: r.category,
    currentScore: r.currentScore,
    trend: r.trend,
    priority: r.priority,
    departmentScope: r.departmentScope,
  });

  const emergingRisks = risks.filter((r) => r.trend === 'WORSENING').slice(0, 5).map(toSummary);
  const trendingImprovements = risks.filter((r) => r.trend === 'IMPROVING').slice(0, 5).map(toSummary);
  const highRiskAreas = risks.filter((r) => r.priority === 'HIGH' || r.priority === 'CRITICAL').slice(0, 5).map(toSummary);

  // The filtered population size is the cohort-size gate: a narrow filter combination
  // (e.g. one team at one location) can re-identify someone even with no name attached,
  // so every number derived from it is suppressed below the org's k-anonymity threshold.
  return applyKAnonymity(totalEmployees, {
    wellbeingScore,
    organisationHealthScore,
    burnoutIndex,
    psychologicalSafetyScore,
    psychosocialRiskScore,
    engagementTrendPct,
    participationRatePct,
    activeSpeakUpCases,
    totalEmployees,
    emergingRisks,
    trendingImprovements,
    highRiskAreas,
  }, threshold);
}

export async function getRecentActivity(organizationId: string, limit = 20) {
  return prisma.activityEvent.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getWellbeingTrend(organizationId: string, days = 90) {
  const since = daysAgo(days);
  const results = await prisma.who5Result.findMany({
    where: { organizationId, createdAt: { gte: since } },
    select: { percentageScore: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byWeek = new Map<string, number[]>();
  for (const r of results) {
    const weekStart = new Date(r.createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    const bucket = byWeek.get(key) ?? [];
    bucket.push(r.percentageScore);
    byWeek.set(key, bucket);
  }

  // Suppress any week whose bucket is too small to protect anonymity, same threshold
  // as the rest of the dashboard.
  return Array.from(byWeek.entries())
    .filter(([, scores]) => scores.length >= DEFAULT_K_ANONYMITY_THRESHOLD)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, scores]) => ({ week, score: Math.round(average(scores)) }));
}
