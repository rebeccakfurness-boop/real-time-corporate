'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AiAssistantPanelProps {
  riskId?: string;
  suggestedPrompts: string[];
}

export function AiAssistantPanel({ riskId, suggestedPrompts }: AiAssistantPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'template' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function ask(q: string) {
    setQuestion(q);
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/ai/risk-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, riskId }),
      });
      if (!res.ok) {
        setError('The assistant could not answer that question.');
        setAnswer(null);
        return;
      }
      const data = await res.json();
      setAnswer(data.answer);
      setSource(data.source);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-foreground text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> AI Risk Assistant
        </CardTitle>
        <CardDescription>
          Answers are grounded only in aggregated data shown elsewhere on this page — never individual records.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              disabled={pending}
              className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            onKeyDown={(e) => e.key === 'Enter' && question.length > 2 && ask(question)}
          />
          <Button size="sm" disabled={pending || question.length < 3} onClick={() => ask(question)}>
            {pending ? 'Thinking…' : 'Ask'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {answer && (
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-sm leading-relaxed">
            <p>{answer}</p>
            {source === 'template' && (
              <Badge variant="secondary" className="mt-2">
                Computed answer — connect ANTHROPIC_API_KEY for AI-generated responses
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
