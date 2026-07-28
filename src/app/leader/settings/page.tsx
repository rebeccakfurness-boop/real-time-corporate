import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const org = await prisma.organization.findUnique({ where: { id: session.user.organizationId } });
  if (!org) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organisation Settings</h1>
        <p className="text-sm text-muted-foreground">Tenant configuration and security posture.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Organisation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Name" value={org.name} />
          <Row label="Plan" value={<Badge variant="secondary">{org.planTier}</Badge>} />
          <Row label="Timezone" value={org.timezone} />
          <Row label="SSO domain" value={org.ssoDomain ?? 'Not configured'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Security</CardTitle>
          <CardDescription>Enterprise security controls for this tenant.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Multi-factor authentication" value={<Badge variant="success">Available per-user</Badge>} />
          <Row label="Tenant isolation" value={<Badge variant="success">Row-level, enforced per query</Badge>} />
          <Row label="Audit logging" value={<Badge variant="success">Enabled</Badge>} />
          <Row label="Encryption in transit" value={<Badge variant="success">TLS everywhere</Badge>} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
