import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROLE_LABELS } from '@/lib/labels';

export default async function PeoplePage() {
  const session = await auth();
  if (!session) return null;

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: 'asc' },
    include: { department: { select: { name: true } }, location: { select: { name: true } } },
    take: 100,
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">People &amp; Organisation</h1>
        <p className="text-sm text-muted-foreground">
          Organisation structure and role-based access. Scores shown elsewhere in the platform are always
          aggregated — individual wellbeing data is never exposed here.
        </p>
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
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </TableCell>
                  <TableCell className="text-xs">{ROLE_LABELS[u.role] ?? u.role}</TableCell>
                  <TableCell className="text-xs">{u.department?.name ?? '—'}</TableCell>
                  <TableCell className="text-xs">{u.location?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'secondary'}>{u.status}</Badge>
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
