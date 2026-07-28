import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getEmployeeHomeData } from '@/lib/data/employee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Smile, HeartPulse, Trophy, BookOpen } from 'lucide-react';

export default async function EmployeeHomePage() {
  const session = await auth();
  if (!session) return null;

  const { todayCheckIn, recentCheckIns, latestWho5, challenges, resources } = await getEmployeeHomeData(
    session.user.id,
    session.user.organizationId
  );

  const firstName = session.user.name.split(' ')[0];
  const streak = computeStreak(recentCheckIns.map((c) => c.createdAt));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">Your wellbeing, in your control. Everything here is private to you.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className={todayCheckIn ? 'border-success/40 bg-success/5' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
              <Smile className="h-4 w-4" /> Daily check-in
            </CardTitle>
            <CardDescription>
              {todayCheckIn ? "You've checked in today. Nice work." : 'Takes under a minute. Helps us support you better.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayCheckIn ? (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Completed · {streak} day streak
              </span>
            ) : (
              <Button asChild size="sm">
                <Link href="/employee/checkin">Check in now</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
              <HeartPulse className="h-4 w-4" /> WHO-5 wellbeing assessment
            </CardTitle>
            <CardDescription>
              {latestWho5
                ? `Last taken ${latestWho5.createdAt.toLocaleDateString()} · score ${latestWho5.percentageScore}%`
                : 'A short, validated 5-question wellbeing check. Recommended every 2 weeks.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/employee/who5">Take assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
            <Trophy className="h-4 w-4" /> Your challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t joined a team challenge yet. Ask your Wellbeing Lead what&apos;s currently running.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {challenges.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.challenge.name}</span>
                  <Badge variant="secondary">{c.points} pts · {c.streak} day streak</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
            <BookOpen className="h-4 w-4" /> Recommended for you
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {resources.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type.replaceAll('_', ' ').toLowerCase()}</p>
                </div>
                {r.durationMinutes && <span className="text-xs text-muted-foreground">{r.durationMinutes} min</span>}
              </li>
            ))}
            {resources.length === 0 && <li className="py-4 text-sm text-muted-foreground">No resources yet.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function computeStreak(dates: Date[]) {
  let streak = 0;
  const day = 24 * 60 * 60 * 1000;
  let cursor = startOfDay(new Date());
  for (const d of dates.map(startOfDay).sort((a, b) => b.getTime() - a.getTime())) {
    if (d.getTime() === cursor.getTime()) {
      streak += 1;
      cursor = new Date(cursor.getTime() - day);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }
  return streak;
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
