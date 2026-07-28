'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrackResult {
  trackingCode: string;
  statusLabel: string;
  category: string;
  createdAt: string;
  messages: { fromLeader: boolean; body: string; createdAt: string }[];
}

export function TrackReportForm() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch(`/api/speak-up/track?code=${encodeURIComponent(code)}`);
    setLoading(false);
    if (!res.ok) {
      setError('No report found for that tracking code.');
      return;
    }
    setResult(await res.json());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CHNL-XXXX-XXXX" className="font-mono" />
        <Button variant="outline" onClick={lookup} disabled={!code || loading}>
          {loading ? 'Checking…' : 'Check status'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-sm">{result.trackingCode}</span>
            <Badge variant="secondary">{result.statusLabel}</Badge>
          </div>
          <ul className="flex flex-col gap-2">
            {result.messages.map((m, i) => (
              <li key={i} className={m.fromLeader ? 'text-sm' : 'text-sm text-muted-foreground'}>
                <span className="font-medium">{m.fromLeader ? 'Case handler: ' : 'You: '}</span>
                {m.body}
              </li>
            ))}
            {result.messages.length === 0 && (
              <li className="text-sm text-muted-foreground">No updates yet. Check back later.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
