import Link from 'next/link';
import { listOrganisationsOverview } from '@/lib/platform';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function PlatformDashboardPage() {
  const orgs = await listOrganisationsOverview();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Client organisations</h1>
        <p className="text-sm text-muted-foreground">
          Cross-tenant health and usage. This never includes individual wellbeing data — only aggregate counts.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Active Risks</TableHead>
                <TableHead>Speak Up Reports</TableHead>
                <TableHead>Integrations</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Link href={`/platform/dashboard/${org.id}`} className="font-medium hover:underline">
                      {org.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{org.planTier}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{org._count.people}</TableCell>
                  <TableCell className="tabular-nums">{org._count.risks}</TableCell>
                  <TableCell className="tabular-nums">{org._count.speakUpReports}</TableCell>
                  <TableCell className="tabular-nums">{org._count.connectorInstallations}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{org.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {orgs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No organisations yet.
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
