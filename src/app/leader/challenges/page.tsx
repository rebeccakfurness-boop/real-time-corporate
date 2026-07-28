import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default async function ChallengesPage() {
  const session = await auth();
  if (!session) return null;

  const challenges = await prisma.challenge.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { startsAt: 'desc' },
    include: { participants: { orderBy: { points: 'desc' }, take: 5, include: { user: { select: { name: true } } } } },
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team Challenges</h1>
        <p className="text-sm text-muted-foreground">
          Participation, leaderboards and momentum across organisation-wide wellbeing challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {challenges.map((c) => {
          const now = new Date();
          const isActive = c.startsAt <= now && c.endsAt >= now;
          return (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
                    <Trophy className="h-4 w-4 text-primary" /> {c.name}
                  </CardTitle>
                  <Badge variant={isActive ? 'success' : 'secondary'}>{isActive ? 'Active' : 'Closed'}</Badge>
                </div>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {c.participants.length} of top participants shown · {c.type.replaceAll('_', ' ').toLowerCase()}
                </p>
                <ol className="flex flex-col gap-1.5">
                  {c.participants.map((p, i) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-4 text-xs text-muted-foreground">{i + 1}</span>
                        {p.user.name}
                      </span>
                      <span className="font-medium tabular-nums">{p.points} pts</span>
                    </li>
                  ))}
                  {c.participants.length === 0 && <li className="text-sm text-muted-foreground">No participants yet.</li>}
                </ol>
              </CardContent>
            </Card>
          );
        })}
        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground">No challenges have been created yet.</p>
        )}
      </div>
    </div>
  );
}
