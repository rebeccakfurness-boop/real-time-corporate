import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRiskDetail } from '@/lib/data/risks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE } from '@/lib/labels';
import { RiskHistoryChart } from '@/components/dashboard/risk-history-chart';

const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  LEADERSHIP_ACTION: 'Leadership Action', POLICY: 'Policy', COMMUNICATION: 'Communication',
  MANAGER_COACHING: 'Manager Coaching', TEAM_INTERVENTION: 'Team Intervention', WORK_REDESIGN: 'Work Redesign',
  ROLE_CLARIFICATION: 'Role Clarification', RECOGNITION: 'Recognition', FLEXIBLE_WORK: 'Flexible Work',
  PROCESS_IMPROVEMENT: 'Process Improvement', PSYCH_SAFETY_INITIATIVE: 'Psychological Safety Initiative',
  WORKSHOP: 'Workshop', LEARNING_RESOURCE: 'Learning Resource',
};

export default async function RiskDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return null;
  const risk = await getRiskDetail(session.user.organizationId, params.id);
  if (!risk) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{RISK_CATEGORY_LABELS[risk.category] ?? risk.category}</Badge>
          <Badge variant={PRIORITY_BADGE[risk.priority] ?? 'moderate'}>{risk.priority} priority</Badge>
          <Badge variant="secondary">{risk.status.replaceAll('_', ' ')}</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{risk.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">What was detected</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-relaxed">
            <p>{risk.summary}</p>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it matters</p>
              <p>{risk.whyItMatters}</p>
            </div>
            {risk.contributingFactors.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contributing factors</p>
                <ul className="list-inside list-disc space-y-0.5">
                  {risk.contributingFactors.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {risk.evidenceSummary && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
                <p>{risk.evidenceSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Risk metrics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Metric label="Current score" value={`${Math.round(risk.currentScore)} / 100`} />
            <Metric label="Trend" value={risk.trend} />
            <Metric label="Likelihood" value={`${risk.likelihood} / 5`} />
            <Metric label="Impact" value={`${risk.impact} / 5`} />
            <Metric label="Confidence" value={`${risk.confidence}%`} />
            <Metric label="Owner" value={risk.owner?.name ?? 'Unassigned'} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Historical trend</CardTitle>
          <CardDescription>Risk score over time. Lower is better.</CardDescription>
        </CardHeader>
        <CardContent>
          <RiskHistoryChart data={risk.history.map((h) => ({ recordedAt: h.recordedAt.toISOString(), score: h.score }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Recommended actions</CardTitle>
          <CardDescription>What should I do next — practical, prioritised recommendations for this risk.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {risk.recommendations.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No recommendations generated for this risk yet.</p>
          )}
          {risk.recommendations.map((rec) => (
            <div key={rec.id} className="flex flex-col gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{RECOMMENDATION_TYPE_LABELS[rec.type] ?? rec.type}</Badge>
                <span className="text-xs text-muted-foreground">{rec.effortLevel.toLowerCase()} effort</span>
              </div>
              <p className="text-sm font-medium">{rec.title}</p>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
              {rec.expectedImpact && <p className="text-xs text-success">Expected impact: {rec.expectedImpact}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value.toLowerCase()}</span>
    </div>
  );
}
