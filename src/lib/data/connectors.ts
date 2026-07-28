import { prisma } from '@/lib/prisma';
import { listConnectorDefinitions, getConnectorDefinition } from '@/lib/connectors/registry';
import type { ConnectorProvider } from '@prisma/client';

export async function listConnectorsForOrg(organizationId: string) {
  const installations = await prisma.connectorInstallation.findMany({ where: { organizationId } });
  const byProvider = new Map(installations.map((i) => [i.provider, i]));

  return listConnectorDefinitions().map((def) => ({
    definition: def,
    installation: byProvider.get(def.provider) ?? null,
  }));
}

export async function getInstallation(organizationId: string, provider: ConnectorProvider) {
  return prisma.connectorInstallation.findUnique({
    where: { organizationId_provider: { organizationId, provider } },
  });
}

export async function upsertConnectedInstallation(input: {
  organizationId: string;
  provider: ConnectorProvider;
  encryptedCredentials: string;
  config?: Record<string, unknown>;
  connectedById?: string;
}) {
  const def = getConnectorDefinition(input.provider);
  if (!def) throw new Error(`Unknown connector provider: ${input.provider}`);

  return prisma.connectorInstallation.upsert({
    where: { organizationId_provider: { organizationId: input.organizationId, provider: input.provider } },
    create: {
      organizationId: input.organizationId,
      provider: input.provider,
      category: def.category,
      status: 'CONNECTED',
      encryptedCredentials: input.encryptedCredentials,
      config: input.config as never,
      connectedById: input.connectedById,
      connectedAt: new Date(),
    },
    update: {
      status: 'CONNECTED',
      encryptedCredentials: input.encryptedCredentials,
      config: input.config as never,
      connectedById: input.connectedById,
      connectedAt: new Date(),
    },
  });
}

export async function disconnectInstallation(organizationId: string, provider: ConnectorProvider) {
  await prisma.connectorInstallation.update({
    where: { organizationId_provider: { organizationId, provider } },
    data: { status: 'DISABLED', encryptedCredentials: null },
  });
}

/** Runs a connector's sync, recording a ConnectorSyncRun either way. A connector failure
 * is recorded and surfaced in the UI — it never throws out to the caller, so a broken
 * integration can't take down anything else in the app. */
export async function runConnectorSync(organizationId: string, provider: ConnectorProvider, trigger: 'MANUAL' | 'SCHEDULED' | 'REALTIME_EVENT' | 'WEBHOOK') {
  const installation = await getInstallation(organizationId, provider);
  if (!installation) throw new Error('Connector is not installed.');

  const def = getConnectorDefinition(provider);
  if (!def?.sync) throw new Error('This connector does not support syncing.');

  const startedAt = new Date();
  try {
    const result = await def.sync(installation);
    const status = result.errorMessage ? (result.recordsProcessed > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS';

    await Promise.all([
      prisma.connectorSyncRun.create({
        data: {
          installationId: installation.id,
          trigger,
          status,
          recordsProcessed: result.recordsProcessed,
          recordsFailed: result.recordsFailed,
          errorMessage: result.errorMessage,
          startedAt,
          completedAt: new Date(),
        },
      }),
      prisma.connectorInstallation.update({
        where: { id: installation.id },
        data: { lastSyncAt: new Date(), lastSyncStatus: status, lastErrorMessage: result.errorMessage },
      }),
    ]);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
    await Promise.all([
      prisma.connectorSyncRun.create({
        data: { installationId: installation.id, trigger, status: 'FAILED', errorMessage, startedAt, completedAt: new Date() },
      }),
      prisma.connectorInstallation.update({
        where: { id: installation.id },
        data: { status: 'ERROR', lastSyncAt: new Date(), lastSyncStatus: 'FAILED', lastErrorMessage: errorMessage },
      }),
    ]);
    return { recordsProcessed: 0, recordsFailed: 0, errorMessage };
  }
}
