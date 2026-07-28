'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { requestUnlockAction } from '../../../actions';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function RequestUnlockForm({ personId, organizationId }: { personId: string; organizationId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await requestUnlockAction({ personId, organizationId, reason });
        router.push('/platform/break-glass');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to submit request.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Reason for this request</Label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={20}
          rows={5}
          placeholder="Describe the specific safety signal prompting this request — what was observed, and why it indicates imminent risk of harm."
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" variant="secondary" disabled={pending || reason.length < 20} onClick={submit}>
        {pending ? 'Submitting…' : 'Submit request for approval'}
      </Button>
    </div>
  );
}
