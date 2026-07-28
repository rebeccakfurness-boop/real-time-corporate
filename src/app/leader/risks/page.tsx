import { auth } from '@/lib/auth';
import { listRisks } from '@/lib/data/risks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE } from '@/lib/labels';
import Link from 'next/link';

export default async function RisksPage() {
  const session = await auth();
  if (!session) return null;
  const risks = await listRisks(session.user.organizationId);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Psychosocial Risk Register</h1>
        <p className="text-sm text-muted-foreground">
          Every identified risk, scored and prioritised, with an owner and recommended actions — this is where
          measurement becomes management.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="max-w-[280px]">
                    <Link href={`/leader/risks/${risk.id}`} className="font-medium hover:underline">
                      {risk.title}
                    </Link>
                    {risk.departmentScope && <p className="text-xs text-muted-foreground">{risk.departmentScope}</p>}
                  </TableCell>
                  <TableCell className="text-xs">{RISK_CATEGORY_LABELS[risk.category] ?? risk.category}</TableCell>
                  <TableCell className="font-medium tabular-nums">{Math.round(risk.currentScore)}</TableCell>
                  <TableCell className="text-xs capitalize">{risk.trend.toLowerCase()}</TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_BADGE[risk.priority] ?? 'moderate'}>{risk.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{risk.status.replaceAll('_', ' ')}</TableCell>
                  <TableCell className="text-xs">{risk.owner?.name ?? 'Unassigned'}</TableCell>
                </TableRow>
              ))}
              {risks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No risks identified yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
