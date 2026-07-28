import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SPEAK_UP_STATUS_LABELS } from '@/lib/labels';
import { ShieldAlert } from 'lucide-react';

const STATUS_VARIANT: Record<string, 'low' | 'moderate' | 'high' | 'critical' | 'secondary'> = {
  SUBMITTED: 'critical',
  UNDER_REVIEW: 'high',
  INVESTIGATING: 'high',
  ACTION_TAKEN: 'moderate',
  RESOLVED: 'low',
  CLOSED: 'secondary',
};

export default async function SpeakUpCasesPage() {
  const session = await auth();
  if (!session) return null;

  const reports = await prisma.speakUpReport.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, trackingCode: true, category: true, status: true, departmentScope: true, locationScope: true,
      isAnonymous: true, createdAt: true,
    },
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Speak Up Cases</h1>
        <p className="text-sm text-muted-foreground">
          De-identified case management. Submitter identity is never shown here, even for reports where the
          employee chose not to remain anonymous.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Case detail and secure two-way messaging with anonymous submitters live on each case page. Only
        department/location scope is shown to protect anonymity in small teams.
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.trackingCode}</TableCell>
                  <TableCell className="text-xs">{r.category.replaceAll('_', ' ')}</TableCell>
                  <TableCell className="text-xs">{r.departmentScope ?? r.locationScope ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'}>{SPEAK_UP_STATUS_LABELS[r.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No Speak Up reports submitted.
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
