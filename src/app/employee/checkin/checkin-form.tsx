'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LikertScale } from '@/components/employee/likert-scale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function CheckInForm() {
  const router = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [workload, setWorkload] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = mood && energy && stress;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moodScore: mood,
        energyScore: energy,
        stressScore: stress,
        workloadScore: workload ?? undefined,
        reflection: reflection || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/employee/home'), 1200);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="font-medium">Thanks for checking in.</p>
          <p className="text-sm text-muted-foreground">Taking you back to your home page…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold">How are you today?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Mood — how are you feeling overall?</Label>
          <LikertScale value={mood} onChange={setMood} labels={['Very low', 'Very good']} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Energy — how energised do you feel?</Label>
          <LikertScale value={energy} onChange={setEnergy} labels={['Exhausted', 'Energised']} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Stress — how stressed do you feel?</Label>
          <LikertScale value={stress} onChange={setStress} labels={['Very calm', 'Very stressed']} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Workload (optional) — how manageable is your workload?</Label>
          <LikertScale value={workload} onChange={setWorkload} labels={['Overwhelming', 'Very manageable']} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reflection">Anything you&apos;d like to note? (optional, private to you)</Label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Optional reflection…"
          />
        </div>
        <Button onClick={submit} disabled={!canSubmit || submitting}>
          {submitting ? 'Submitting…' : 'Submit check-in'}
        </Button>
      </CardContent>
    </Card>
  );
}
