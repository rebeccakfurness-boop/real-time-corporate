'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveUnlockAction, denyUnlockAction } from '../../actions';
import { Button } from '@/components/ui/button';

export function ApproveDenyButtons({ unlockId }: { unlockId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      await approveUnlockAction(unlockId);
      router.refresh();
    });
  }

  function deny() {
    startTransition(async () => {
      await denyUnlockAction(unlockId, 'Denied via console');
      router.refresh();
    });
  }

  return (
    <>
      <Button size="sm" disabled={pending} onClick={approve}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={deny}>
        Deny
      </Button>
    </>
  );
}
