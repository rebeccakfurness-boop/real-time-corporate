'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedEvent {
  id: string;
  type: string;
  message: string;
  severity: 'INFO' | 'POSITIVE' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

const SEVERITY_DOT: Record<FeedEvent['severity'], string> = {
  INFO: 'bg-muted-foreground',
  POSITIVE: 'bg-success',
  WARNING: 'bg-warning',
  CRITICAL: 'bg-destructive',
};

export function LiveActivityFeed({ canSimulate }: { canSimulate: boolean }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const source = new EventSource('/api/feed');

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.onmessage = (message) => {
      if (!message.data) return;
      const payload = JSON.parse(message.data);
      if (!payload) return; // heartbeat
      if (payload.type === 'backfill') {
        setEvents(payload.events);
      } else if (payload.type === 'event') {
        setEvents((prev) => [...prev.slice(-49), payload.event]);
      }
    };

    return () => source.close();
  }, []);

  async function simulate() {
    await fetch('/api/feed/simulate', { method: 'POST' });
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Radio className={cn('h-3.5 w-3.5', connected ? 'text-success' : 'text-muted-foreground')} />
          {connected ? 'Live' : 'Connecting…'}
        </span>
        {canSimulate && (
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px]" onClick={simulate}>
            <Sparkles className="h-3 w-3" /> Simulate event
          </Button>
        )}
      </div>
      <ul ref={listRef} className="flex max-h-[420px] flex-col-reverse gap-0.5 overflow-y-auto scrollbar-thin">
        {events.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No activity yet.</li>
        )}
        {[...events].reverse().map((event, i) => (
          <li key={event.id ?? i} className="flex items-start gap-2.5 rounded-md px-2 py-2 text-sm animate-fade-in">
            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', SEVERITY_DOT[event.severity])} />
            <div className="min-w-0">
              <p className="leading-snug">{event.message}</p>
              <p className="text-xs text-muted-foreground">
                {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) : 'just now'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
