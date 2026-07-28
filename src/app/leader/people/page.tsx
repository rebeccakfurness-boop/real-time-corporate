import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { listOrgDirectory } from '@/lib/data/org-directory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROLE_LABELS } from '@/lib/labels';
import { ShieldAlert } from 'lucide-react';

export default async function PeoplePage() {
  const session = await auth();
  if (!session) return null;
  // Administrative-only surface — everyone else in the leader tier works entirely with
  // pseudonymous, aggregated data and never reaches this page.
  if (!can(session.user.role, 'org:manage_users')) redirect('/leader/dashboard');

  const people = await listOrgDirectory(session.user.organizationId);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">People &amp; Organisation</h1>
        <p className="text-sm text-muted-foreground">
          Account administration — inviting people, assigning roles, managing status.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        This is the one administrative screen where names and emails are shown, for account management only. It
        never displays wellbeing, risk or Speak Up data next to a name — those stay aggregated and de-identified
        everywhere else in the platform, for every role, including yours.
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </TableCell>
                  <TableCell className="text-xs">{ROLE_LABELS[p.role] ?? p.role}</TableCell>
                  <TableCell className="text-xs">{p.departmentName ?? '—'}</TableCell>
                  <TableCell className="text-xs">{p.locationName ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge>
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
