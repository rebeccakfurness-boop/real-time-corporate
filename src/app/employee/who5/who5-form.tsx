'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LikertScale } from '@/components/employee/likert-scale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const QUESTIONS: { key: keyof Answers; prompt: string }[] = [
  { key: 'q1Cheerful', prompt: 'I have felt cheerful and in good spirits' },
  { key: 'q2Calm', prompt: 'I have felt calm and relaxed' },
  { key: 'q3Active', prompt: 'I have felt active and vigorous' },
  { key: 'q4RestedFresh', prompt: 'I woke up feeling fresh and rested' },
  { key: 'q5Interesting', prompt: 'My daily life has been filled with things that interest me' },
];

type Answers = {
  q1Cheerful: number | null;
  q2Calm: number | null;
  q3Active: number | null;
  q4RestedFresh: number | null;
  q5Interesting: number | null;
};

export function Who5Form() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({
    q1Cheerful: null, q2Calm: null, q3Active: null, q4RestedFresh: null, q5Interesting: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ percentageScore: number; belowThreshold: boolean } | null>(null);

  const canSubmit = Object.values(answers).every((v) => v !== null);

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await fetch('/api/who5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      setResult(data.result);
    }
  }

  if (result) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="text-3xl font-semibold">{result.percentageScore}%</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {result.belowThreshold
              ? 'Your score is below the typical wellbeing threshold. Consider reaching out for support — you can request it confidentially from your home page.'
              : 'Your wellbeing score is within a healthy range. Keep doing what works for you.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/employee/home')}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold">WHO-5 Well-Being Index</CardTitle>
        <CardDescription>Thinking about the last two weeks, rate each statement from 0 (at no time) to 5 (all of the time).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="flex flex-col gap-2">
            <Label>{q.prompt}</Label>
            <LikertScale
              min={0}
              max={5}
              value={answers[q.key]}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.key]: v }))}
              labels={['At no time', 'All of the time']}
            />
          </div>
        ))}
        <Button onClick={submit} disabled={!canSubmit || submitting}>
          {submitting ? 'Submitting…' : 'Submit assessment'}
        </Button>
      </CardContent>
    </Card>
  );
}
