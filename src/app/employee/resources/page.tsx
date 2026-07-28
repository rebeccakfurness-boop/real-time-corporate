import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DOMAIN_LABELS } from '@/lib/labels';

export default async function ResourcesPage() {
  const session = await auth();
  if (!session) return null;

  const resources = await prisma.learningResource.findMany({
    where: { OR: [{ organizationId: session.user.organizationId }, { organizationId: null }] },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wellbeing resources</h1>
        <p className="text-sm text-muted-foreground">Articles, guides and workshops to support you.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {resources.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{r.type.replaceAll('_', ' ')}</Badge>
                {r.durationMinutes && <span className="text-xs text-muted-foreground">{r.durationMinutes} min</span>}
              </div>
              <CardTitle className="text-foreground text-sm font-semibold">{r.title}</CardTitle>
              <CardDescription>{DOMAIN_LABELS[r.domain] ?? r.domain}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.summary}</p>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && <p className="text-sm text-muted-foreground">No resources published yet.</p>}
      </div>
    </div>
  );
}
