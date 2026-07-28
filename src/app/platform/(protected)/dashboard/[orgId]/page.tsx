import { notFound } from 'next/navigation';
import Link from 'next/link';
import { listPseudonymousPeople, getOrganisationById } from '@/lib/platform';
import { ROLE_LABELS } from '@/lib/labels';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default async function PlatformOrgDetailPage({ params }: { params: { orgId: string } }) {
  const org = await getOrganisationById(params.orgId);
  if (!org) notFound();
  const people = await listPseudonymousPeople(params.orgId);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
        <p className="text-sm text-muted-foreground">
          Pseudonymous person codes only — the same de-identified view that org&apos;s own leaders see. Names only ever
          resolve through an approved break-glass unlock.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Requesting an unlock starts a two-person-approved, time-boxed, fully audited process. This should be rare —
        reserved for genuine safety situations, not routine lookups.
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="text-xs">{ROLE_LABELS[p.role] ?? p.role}</TableCell>
                  <TableCell className="text-xs">{p.department?.name ?? '—'}</TableCell>
                  <TableCell className="text-xs">{p.location?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/platform/break-glass/request?personId=${p.id}&organizationId=${org.id}`}>
                        Request unlock
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
