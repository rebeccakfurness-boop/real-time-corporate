import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { listConnectorsForOrg } from '@/lib/data/connectors';
import { CONNECTOR_CATEGORY_LABELS, CONNECTOR_CATEGORY_ORDER } from '@/lib/connectors/labels';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SyncNowButton, DisconnectButton } from './connector-actions';
import { Plug, AlertTriangle } from 'lucide-react';

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const session = await auth();
  if (!session) return null;
  if (!can(session.user.role, 'integrations:manage')) redirect('/leader/dashboard');

  const connectors = await listConnectorsForOrg(session.user.organizationId);
  const byCategory = new Map<string, typeof connectors>();
  for (const c of connectors) {
    const list = byCategory.get(c.definition.category) ?? [];
    list.push(c);
    byCategory.set(c.definition.category, list);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect Realtime to your existing tools. A connector failure never affects check-ins, dashboards or any
          other core feature — each one runs in its own isolated module.
        </p>
      </div>

      {searchParams.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {searchParams.error}
        </div>
      )}
      {searchParams.connected && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
          Connected {searchParams.connected.replaceAll('_', ' ')} successfully.
        </div>
      )}

      {CONNECTOR_CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{CONNECTOR_CATEGORY_LABELS[category]}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {byCategory.get(category)!.map(({ definition, installation }) => (
              <Card key={definition.provider}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
                      <Plug className="h-4 w-4 text-primary" /> {definition.displayName}
                    </CardTitle>
                    {installation?.status === 'CONNECTED' ? (
                      <Badge variant="success">Connected</Badge>
                    ) : definition.implemented ? (
                      <Badge variant="secondary">Not connected</Badge>
                    ) : (
                      <Badge variant="outline">Coming soon</Badge>
                    )}
                  </div>
                  <CardDescription>{definition.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  {installation?.status === 'CONNECTED' ? (
                    <>
                      <SyncNowButton provider={definition.provider} />
                      <DisconnectButton provider={definition.provider} />
                    </>
                  ) : definition.implemented ? (
                    <Button asChild size="sm">
                      <a href={`/api/connectors/${definition.provider}/authorize`}>Connect</a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Not yet available
                    </Button>
                  )}
                  {installation?.lastSyncAt && (
                    <span className="text-xs text-muted-foreground">Last synced {installation.lastSyncAt.toLocaleString()}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
