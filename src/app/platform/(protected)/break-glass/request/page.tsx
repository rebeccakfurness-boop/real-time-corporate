import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RequestUnlockForm } from './request-unlock-form';

export default function RequestUnlockPage({
  searchParams,
}: {
  searchParams: { personId?: string; organizationId?: string };
}) {
  const { personId, organizationId } = searchParams;
  if (!personId || !organizationId) redirect('/platform/dashboard');

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Request identity unlock</h1>
        <p className="text-sm text-muted-foreground">
          This is a rare, exceptional path — reserved for genuine safety situations such as a Speak Up report or
          check-in pattern indicating imminent risk of harm. A second staff member must approve before anything is
          revealed, and access is time-boxed once granted.
        </p>
      </div>

      <Card className="border-warning/40">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Person code: {personId}</CardTitle>
          <CardDescription>Organisation ID: {organizationId}</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestUnlockForm personId={personId} organizationId={organizationId} />
        </CardContent>
      </Card>
    </div>
  );
}
