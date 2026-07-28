import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { getComplianceOverview } from '@/lib/data/compliance';
import { resolveLeaderDisplayNames } from '@/lib/data/leader-names';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceBarChart } from '@/components/dashboard/compliance-bar-chart';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE } from '@/lib/labels';
import Link from 'next/link';
import { AlertTriangle, ShieldOff, CalendarClock, TrendingUp } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'hsl(var(--risk-critical))',
  HIGH: 'hsl(var(--risk-high))',
  MEDIUM: 'hsl(var(--risk-moderate))',
  LOW: 'hsl(var(--risk-low))',
};

export default async function CompliancePage() {
  const session = await auth();
  if (!session) return null;
  if (!can(session.user.role, 'compliance:view')) redirect('/leader/dashboard');

  const overview = await getComplianceOverview(session.user.organizationId);
  const ownerIds = overview.overdueActions.map((a) => a.ownerId);
  const ownerNames = await resolveLeaderDisplayNames(ownerIds);

  const total = overview.historicalImprovement.improving + overview.historicalImprovement.worsening + overview.historicalImprovement.stable;
  const improvingPct = total ? Math.round((overview.historicalImprovement.improving / total) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Governance view for Health &amp; Safety and Executive roles — where risk is uncontrolled, overdue, or due
          for review.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Risks</p>
              <p className="text-2xl font-semibold tabular-nums">{overview.totalRisks}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className={overview.risksWithoutControls.length > 0 ? 'border-destructive/40' : ''}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Without Controls</p>
              <p className="text-2xl font-semibold tabular-nums text-destructive">{overview.risksWithoutControls.length}</p>
            </div>
            <ShieldOff className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>
        <Card className={overview.overdueActions.length > 0 ? 'border-warning/40' : ''}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overdue Actions</p>
              <p className="text-2xl font-semibold tabular-nums text-warning">{overview.overdueActions.length}</p>
            </div>
            <CalendarClock className="h-5 w-5 text-warning" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Trending Improving</p>
              <p className="text-2xl font-semibold tabular-nums text-success">{improvingPct}%</p>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Risks by severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceBarChart data={overview.bySeverity} dataKey="count" labelKey="priority" colors={PRIORITY_COLORS} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Risks by category</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceBarChart data={overview.byCategory} dataKey="count" labelKey="category" labels={RISK_CATEGORY_LABELS} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Residual risk profile</CardTitle>
          <CardDescription>Organisation-wide averages across the risk journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-2xl font-semibold tabular-nums">{Math.round(overview.residualRiskProfile.avgCurrent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Residual (projected)</p>
            <p className="text-2xl font-semibold tabular-nums">
              {overview.residualRiskProfile.avgResidual != null ? Math.round(overview.residualRiskProfile.avgResidual) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-2xl font-semibold tabular-nums text-success">
              {overview.residualRiskProfile.avgTarget != null ? Math.round(overview.residualRiskProfile.avgTarget) : '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Risks without active controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {overview.risksWithoutControls.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">Every identified risk has at least one active control.</p>
            )}
            {overview.risksWithoutControls.map((r) => (
              <Link key={r.id} href={`/leader/risks/${r.id}`} className="flex items-center justify-between py-2.5 text-sm hover:bg-secondary/40 rounded-md px-2 -mx-2">
                <span>{r.title}</span>
                <Badge variant={PRIORITY_BADGE[r.priority] ?? 'moderate'}>{r.priority}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Overdue actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {overview.overdueActions.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">No overdue action plan items.</p>
            )}
            {overview.overdueActions.map((a) => (
              <div key={a.id} className="flex flex-col gap-0.5 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-xs text-destructive">Due {a.dueDate?.toLocaleDateString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {a.risk.title} · Owner: {ownerNames.get(a.ownerId ?? '') ?? 'Unassigned'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Upcoming reviews (next 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {overview.upcomingRiskReviews.length === 0 && overview.upcomingReviewActions.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No reviews scheduled in the next 30 days.</p>
          )}
          {overview.upcomingRiskReviews.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>Risk review: {r.title}</span>
              <span className="text-xs text-muted-foreground">{r.nextReviewDate?.toLocaleDateString()}</span>
            </div>
          ))}
          {overview.upcomingReviewActions.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>Action review: {a.title}</span>
              <span className="text-xs text-muted-foreground">{a.reviewDate?.toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
