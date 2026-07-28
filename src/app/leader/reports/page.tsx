import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportGenerator } from './report-generator';
import { FileDown } from 'lucide-react';

export default async function ReportsPage() {
  const session = await auth();
  if (!session) return null;

  const reports = await prisma.report.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 25,
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reporting Engine</h1>
        <p className="text-sm text-muted-foreground">
          Generate executive-quality, board-ready reports on demand. PDF rendering with the full premium consulting
          layout (charts, heat maps, risk matrices) is the next build phase — reports currently generate with live
          data attached and are ready to extend with a PDF template.
        </p>
      </div>

      <ReportGenerator />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'READY' ? 'success' : r.status === 'FAILED' ? 'destructive' : 'secondary'}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.createdAt.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileDown className="h-3.5 w-3.5" /> PDF export coming soon
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No reports generated yet.
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
