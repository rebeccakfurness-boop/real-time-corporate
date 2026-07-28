'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SyncNowButton({ provider }: { provider: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/connectors/${provider}/sync`, { method: 'POST' });
          router.refresh();
        })
      }
    >
      {pending ? 'Syncing…' : 'Sync now'}
    </Button>
  );
}

export function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/connectors/${provider}/disconnect`, { method: 'POST' });
          router.refresh();
        })
      }
    >
      {pending ? 'Disconnecting…' : 'Disconnect'}
    </Button>
  );
}
