import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRiskDetail } from '@/lib/data/risks';
import { resolveLeaderDisplayNames } from '@/lib/data/leader-names';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE, RECOMMENDATION_TYPE_LABELS, ACTION_PLAN_STATUS_LABELS, WORKSAFE_DISCLAIMER } from '@/lib/labels';
import { RiskJourneyChart } from '@/components/dashboard/risk-journey-chart';
import { AiAssistantPanel } from '@/components/dashboard/ai-assistant-panel';
import { Info } from 'lucide-react';

const RISK_ASSISTANT_PROMPTS = [
  'Why has this risk increased?',
  'Summarise this risk for the Board',
  'Generate a Health & Safety Committee update',
];

const ACTION_STATUS_BADGE: Record<string, 'low' | 'moderate' | 'high' | 'critical' | 'secondary' | 'success'> = {
  NOT_STARTED: 'secondary',
  IN_PROGRESS: 'moderate',
  BLOCKED: 'high',
  COMPLETED: 'success',
  OVERDUE: 'critical',
};

export default async function RiskDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return null;
  const risk = await getRiskDetail(session.user.organizationId, params.id);
  if (!risk) notFound();

  const ownerIds = [risk.ownerId, ...risk.actionPlanItems.map((a) => a.ownerId)];
  const displayNames = await resolveLeaderDisplayNames(ownerIds);

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
            {risk.worksafeContext && (
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Info className="h-3.5 w-3.5" /> Why WorkSafe expects this to be managed
                </p>
                <p className="text-sm">{risk.worksafeContext}</p>
                <p className="mt-2 text-xs text-muted-foreground">{WORKSAFE_DISCLAIMER}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Risk metrics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Metric label="Inherent score" value={risk.inherentScore != null ? `${Math.round(risk.inherentScore)} / 100` : 'not set'} />
            <Metric label="Current score" value={`${Math.round(risk.currentScore)} / 100`} />
            <Metric label="Residual score" value={risk.residualScore != null ? `${Math.round(risk.residualScore)} / 100` : 'not set'} />
            <Metric label="Target score" value={risk.targetScore != null ? `${Math.round(risk.targetScore)} / 100` : 'not set'} />
            <Metric label="Trend" value={risk.trend} />
            <Metric label="Likelihood" value={`${risk.likelihood} / 5`} />
            <Metric label="Impact" value={`${risk.impact} / 5`} />
            <Metric label="Confidence" value={`${risk.confidence}%`} />
            <Metric label="Owner" value={displayNames.get(risk.ownerId ?? '') ?? 'Unassigned'} noLowercase />
            <Metric
              label="Next review"
              value={risk.nextReviewDate ? new Date(risk.nextReviewDate).toLocaleDateString() : 'not scheduled'}
              noLowercase
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Risk Journey</CardTitle>
          <CardDescription>Inherent → current → residual → target. Lower is better.</CardDescription>
        </CardHeader>
        <CardContent>
          <RiskJourneyChart
            stateChanges={risk.stateChanges.map((s) => ({ stateType: s.stateType, score: s.score, recordedAt: s.recordedAt.toISOString() }))}
            targetScore={risk.targetScore}
            inherentScore={risk.inherentScore}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Controls</CardTitle>
          <CardDescription>Measures currently in place (or planned) to reduce this risk.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {risk.controls.length === 0 && (
            <p className="py-4 text-sm text-warning">No controls recorded for this risk yet.</p>
          )}
          {risk.controls.map((control) => (
            <div key={control.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>{control.description}</span>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{control.status}</Badge>
                <Badge variant="secondary">{control.effectiveness.replaceAll('_', ' ')}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Action plan</CardTitle>
          <CardDescription>What should I do next — owned, dated and tracked to residual risk.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {risk.actionPlanItems.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No action plan items yet.</p>
          )}
          {risk.actionPlanItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={PRIORITY_BADGE[item.priority] ?? 'moderate'}>{item.priority}</Badge>
                  <Badge variant={ACTION_STATUS_BADGE[item.status] ?? 'secondary'}>{ACTION_PLAN_STATUS_LABELS[item.status]}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Owner: {displayNames.get(item.ownerId ?? '') ?? 'Unassigned'}</span>
                <span>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'not set'}</span>
                <span>Review: {item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : 'not set'}</span>
                {item.residualRiskScore != null && <span>Residual: {Math.round(item.residualRiskScore)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={item.progressPercent} className="h-1.5" />
                <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">{item.progressPercent}%</span>
              </div>
              {item.expectedOutcome && <p className="text-xs text-success">Expected outcome: {item.expectedOutcome}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">AI recommendations</CardTitle>
          <CardDescription>Practical, prioritised recommendations for this risk.</CardDescription>
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

      <AiAssistantPanel riskId={risk.id} suggestedPrompts={RISK_ASSISTANT_PROMPTS} />
    </div>
  );
}

function Metric({ label, value, noLowercase }: { label: string; value: string; noLowercase?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={noLowercase ? 'font-medium' : 'font-medium capitalize'}>{noLowercase ? value : value.toLowerCase()}</span>
    </div>
  );
}
