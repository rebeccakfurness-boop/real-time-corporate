import { redirect } from 'next/navigation';
import { listBreakGlassUnlocks } from '@/lib/platform';
import { getPlatformSession } from '@/lib/platform/session';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RevealIdentityButton } from './reveal-identity-button';
import { ApproveDenyButtons } from './approve-deny-buttons';

const STATUS_BADGE: Record<string, 'low' | 'moderate' | 'high' | 'critical' | 'secondary'> = {
  PENDING_APPROVAL: 'high',
  APPROVED: 'moderate',
  ACTIVE: 'critical',
  DENIED: 'secondary',
  EXPIRED: 'secondary',
  REVOKED: 'secondary',
};

export default async function BreakGlassPage() {
  const session = await getPlatformSession();
  if (!session) redirect('/platform/sign-in');

  const unlocks = await listBreakGlassUnlocks();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Break-glass identity unlocks</h1>
        <p className="text-sm text-muted-foreground">
          Every request, decision and access is captured here and in the audit log. Two-person rule: the approver
          must always be a different staff member from the requester.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {unlocks.map((unlock) => {
          const isRequester = unlock.requestedById === session.staffId;
          return (
            <Card key={unlock.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_BADGE[unlock.status] ?? 'secondary'}>{unlock.status.replaceAll('_', ' ')}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{unlock.personId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{unlock.createdAt.toLocaleString()}</span>
                </div>
                <p className="text-sm">{unlock.reason}</p>
                <p className="text-xs text-muted-foreground">
                  Requested by {unlock.requestedBy.name}
                  {unlock.approvedBy && <> · Decided by {unlock.approvedBy.name}</>}
                </p>

                {unlock.status === 'PENDING_APPROVAL' && (
                  <div className="flex items-center gap-2 pt-1">
                    {isRequester ? (
                      <p className="text-xs text-warning">Awaiting a different staff member to approve (two-person rule).</p>
                    ) : (
                      <ApproveDenyButtons unlockId={unlock.id} />
                    )}
                  </div>
                )}

                {(unlock.status === 'APPROVED' || unlock.status === 'ACTIVE') && (
                  <div className="pt-1">
                    <RevealIdentityButton unlockId={unlock.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {unlocks.length === 0 && <p className="text-sm text-muted-foreground">No unlock requests yet.</p>}
      </div>
    </div>
  );
}
