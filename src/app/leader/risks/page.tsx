import { auth } from '@/lib/auth';
import { listRisks } from '@/lib/data/risks';
import { resolveLeaderDisplayNames } from '@/lib/data/leader-names';
import { getFilterBarOptions } from '@/lib/data/org-structure';
import { parseDashboardFilters } from '@/lib/data/filters';
import { DashboardFilterBar } from '@/components/dashboard/filter-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RiskMatrixHeatmap } from '@/components/dashboard/risk-matrix-heatmap';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE } from '@/lib/labels';
import Link from 'next/link';

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session) return null;

  const filters = parseDashboardFilters(searchParams);
  const filterOptions = await getFilterBarOptions(session.user.organizationId);
  const departmentName = filters.departmentId
    ? filterOptions.departments.find((d) => d.value === filters.departmentId)?.label
    : undefined;

  const risks = await listRisks(session.user.organizationId, { departmentName, domain: filters.domain });
  const ownerNames = await resolveLeaderDisplayNames(risks.map((r) => r.ownerId));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Psychosocial Risk Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Every identified risk, scored and prioritised, with an owner, controls and recommended actions — this is
          where measurement becomes management.
        </p>
      </div>

      <DashboardFilterBar options={filterOptions} />

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Residual</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Controls</TableHead>
                    <TableHead>Review Date</TableHead>
                    <TableHead>Next Action</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => {
                    const nextAction = risk.actionPlanItems[0];
                    return (
                      <TableRow key={risk.id}>
                        <TableCell className="max-w-[240px]">
                          <Link href={`/leader/risks/${risk.id}`} className="font-medium hover:underline">
                            {risk.title}
                          </Link>
                          {risk.departmentScope && <p className="text-xs text-muted-foreground">{risk.departmentScope}</p>}
                        </TableCell>
                        <TableCell className="text-xs">{RISK_CATEGORY_LABELS[risk.category] ?? risk.category}</TableCell>
                        <TableCell className="font-medium tabular-nums">{Math.round(risk.currentScore)}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {risk.residualScore != null ? Math.round(risk.residualScore) : '—'}
                        </TableCell>
                        <TableCell className="text-xs capitalize">{risk.trend.toLowerCase()}</TableCell>
                        <TableCell>
                          <Badge variant={PRIORITY_BADGE[risk.priority] ?? 'moderate'}>{risk.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{risk.status.replaceAll('_', ' ')}</TableCell>
                        <TableCell className="text-xs">
                          {risk.controls.length === 0 ? (
                            <span className="text-warning">None</span>
                          ) : (
                            `${risk.controls.filter((c) => c.status === 'ACTIVE').length}/${risk.controls.length} active`
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {risk.nextReviewDate ? new Date(risk.nextReviewDate).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-xs">{nextAction?.title ?? '—'}</TableCell>
                        <TableCell className="text-xs">{ownerNames.get(risk.ownerId ?? '') ?? 'Unassigned'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {risks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                        No risks match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardContent className="p-5">
              <RiskMatrixHeatmap risks={risks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
