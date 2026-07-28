import { auth } from '@/lib/auth';
import { getOrganisationSnapshot, getWellbeingTrend, type OrganisationSnapshot } from '@/lib/data/dashboard';
import { getFilterBarOptions } from '@/lib/data/org-structure';
import { parseDashboardFilters } from '@/lib/data/filters';
import { DashboardFilterBar } from '@/components/dashboard/filter-bar';
import { ScoreCard } from '@/components/dashboard/score-card';
import { WellbeingTrendChart } from '@/components/dashboard/wellbeing-trend-chart';
import { RiskList } from '@/components/dashboard/risk-list';
import { LiveActivityFeed } from '@/components/dashboard/live-feed';
import { SuppressedCohortNotice } from '@/components/dashboard/suppressed-cohort-notice';
import { AiAssistantPanel } from '@/components/dashboard/ai-assistant-panel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isLeaderRole } from '@/lib/rbac';
import {
  HeartHandshake, Building2, Flame, ShieldCheck, ShieldAlert, Users2, MessageSquareWarning, TrendingUp,
} from 'lucide-react';

const ORG_ASSISTANT_PROMPTS = [
  'What changed this month?',
  'Which departments need support?',
  'What actions will have the biggest impact?',
  'Generate a board report',
];

export default async function LeaderDashboardPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session) return null;

  const filters = parseDashboardFilters(searchParams);
  const organizationId = session.user.organizationId;

  const [snapshotResult, trend, filterOptions] = await Promise.all([
    getOrganisationSnapshot(organizationId, filters),
    getWellbeingTrend(organizationId, filters.rangeDays > 90 ? filters.rangeDays : 90),
    getFilterBarOptions(organizationId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Live Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Real-time organisational wellbeing, psychological safety and psychosocial risk — updated continuously as
          your people check in.
        </p>
      </div>

      <DashboardFilterBar options={filterOptions} />

      {snapshotResult.suppressed ? (
        <SuppressedCohortNotice respondentCount={snapshotResult.respondentCount} reason={snapshotResult.reason} />
      ) : (
        <ScoreGrid snapshot={snapshotResult.data} />
      )}

      <AiAssistantPanel suggestedPrompts={ORG_ASSISTANT_PROMPTS} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-foreground text-base font-semibold">Wellbeing trend</CardTitle>
              <CardDescription>Weekly average WHO-5 wellbeing score across the organisation.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <WellbeingTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Live activity</CardTitle>
            <CardDescription>De-identified events as they happen. No personal data is ever shown here.</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveActivityFeed canSimulate={isLeaderRole(session.user.role)} />
          </CardContent>
        </Card>
      </div>

      {!snapshotResult.suppressed && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-foreground text-base font-semibold">
                Emerging Risks <Badge variant="critical">Watch</Badge>
              </CardTitle>
              <CardDescription>Risks trending worse — act before they escalate.</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskList risks={snapshotResult.data.emergingRisks} emptyLabel="No risks are currently trending worse." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-foreground text-base font-semibold">
                High Risk Areas <Badge variant="high">Priority</Badge>
              </CardTitle>
              <CardDescription>Highest priority items across all sixteen risk categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskList risks={snapshotResult.data.highRiskAreas} emptyLabel="No high or critical priority risks right now." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-foreground text-base font-semibold">
                Trending Improvements <Badge variant="success">Positive</Badge>
              </CardTitle>
              <CardDescription>What is working — reinforce these actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskList risks={snapshotResult.data.trendingImprovements} emptyLabel="No risks are currently improving yet." />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ScoreGrid({ snapshot }: { snapshot: OrganisationSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <ScoreCard
        label="Organisation Wellbeing"
        value={snapshot.wellbeingScore}
        suffix="%"
        deltaPct={snapshot.engagementTrendPct}
        icon={HeartHandshake}
        interpretation={
          snapshot.wellbeingScore >= 65
            ? 'Healthy baseline. Keep reinforcing what is working — recognition and flexible work initiatives sustain this.'
            : 'Below the healthy baseline of 65%. Review the emerging risks below and prioritise manager check-ins this month.'
        }
      />
      <ScoreCard
        label="Organisation Health"
        value={snapshot.organisationHealthScore}
        suffix="%"
        icon={Building2}
        interpretation="Composite of wellbeing, burnout, psychological safety and risk exposure. Use it to track overall trajectory quarter to quarter."
      />
      <ScoreCard
        label="Burnout Index"
        value={snapshot.burnoutIndex}
        suffix="%"
        direction="down-is-good"
        icon={Flame}
        interpretation={
          snapshot.burnoutIndex >= 55
            ? 'Elevated. Investigate workload and recovery time in the highest-scoring teams before it affects retention.'
            : 'Within a manageable range. Continue monitoring workload spikes around major deadlines.'
        }
      />
      <ScoreCard
        label="Psychological Safety"
        value={snapshot.psychologicalSafetyScore}
        suffix="%"
        icon={ShieldCheck}
        interpretation="How safe people feel to speak up, take risks and challenge decisions without fear. Low scores predate most other risks."
      />
      <ScoreCard
        label="Psychosocial Risk"
        value={snapshot.psychosocialRiskScore}
        suffix="%"
        direction="down-is-good"
        icon={ShieldAlert}
        interpretation="Aggregate exposure across all sixteen risk categories. See Psychosocial Risk for the full breakdown and owners."
      />
      <ScoreCard
        label="Participation Rate"
        value={snapshot.participationRatePct}
        suffix="%"
        deltaPct={snapshot.engagementTrendPct}
        icon={Users2}
        interpretation="Share of active employees who checked in during the selected period. Low participation weakens confidence in every score above."
      />
      <ScoreCard
        label="Active Speak Up Cases"
        value={snapshot.activeSpeakUpCases}
        icon={MessageSquareWarning}
        direction="down-is-good"
        interpretation="Open anonymous reports awaiting review or action. Go to Speak Up Cases to see de-identified case status."
      />
      <ScoreCard
        label="Engagement Trend"
        value={Math.abs(snapshot.engagementTrendPct)}
        suffix=" pts"
        deltaPct={snapshot.engagementTrendPct}
        icon={TrendingUp}
        interpretation="Change in participation vs. the prior equivalent period. Sustained decline is itself an early risk signal."
      />
    </div>
  );
}
