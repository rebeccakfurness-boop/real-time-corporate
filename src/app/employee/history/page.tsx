import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WellbeingTrendChart } from '@/components/dashboard/wellbeing-trend-chart';
import { average } from '@/domain/scoring';

export default async function HistoryPage() {
  const session = await auth();
  if (!session) return null;

  const [checkIns, who5Results] = await Promise.all([
    prisma.checkIn.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.who5Result.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } }),
  ]);

  const byWeek = new Map<string, number[]>();
  for (const r of who5Results) {
    const weekStart = new Date(r.createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    byWeek.set(key, [...(byWeek.get(key) ?? []), r.percentageScore]);
  }
  const trend = Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, scores]) => ({ week, score: Math.round(average(scores)) }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My history</h1>
        <p className="text-sm text-muted-foreground">Only you can see this. Your organisation only ever sees aggregated, de-identified data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">WHO-5 trend</CardTitle>
          <CardDescription>Your personal wellbeing score over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <WellbeingTrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Recent check-ins</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {checkIns.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">{c.createdAt.toLocaleDateString()}</span>
              <span>Mood {c.moodScore} · Energy {c.energyScore} · Stress {c.stressScore}</span>
            </div>
          ))}
          {checkIns.length === 0 && <p className="py-4 text-sm text-muted-foreground">No check-ins yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
