'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { accessUnlockAction } from '../../actions';
import { Eye, ShieldAlert } from 'lucide-react';

export function RevealIdentityButton({ unlockId }: { unlockId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ name: string; email: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reveal() {
    startTransition(async () => {
      try {
        const { identity, expiresAt } = await accessUnlockAction(unlockId);
        setResult({ name: identity.name, email: identity.email, expiresAt: expiresAt.toString() });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to access identity.');
      }
    });
  }

  if (result) {
    return (
      <div className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
        <span className="flex items-center gap-1 font-medium text-destructive">
          <ShieldAlert className="h-3.5 w-3.5" /> {result.name} ({result.email})
        </span>
        <span className="text-muted-foreground">Access expires {new Date(result.expiresAt).toLocaleTimeString()}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" variant="destructive" disabled={pending} onClick={reveal} className="gap-1">
        <Eye className="h-3.5 w-3.5" /> {pending ? 'Accessing…' : 'Reveal identity'}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
