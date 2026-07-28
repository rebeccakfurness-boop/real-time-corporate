import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import type { ConnectorProvider } from '@prisma/client';

/**
 * Generic inbound webhook receiver — every connector's events land here, are persisted
 * first (so nothing is lost even if processing fails), then handed to the connector's own
 * handleWebhook if it defines one. A processing failure is recorded on the event and never
 * throws back to the caller — external services should always see a 2xx unless the
 * installation itself doesn't exist.
 */
export async function POST(request: Request, { params }: { params: { provider: string; organizationId: string } }) {
  const installation = await prisma.connectorInstallation.findUnique({
    where: { organizationId_provider: { organizationId: params.organizationId, provider: params.provider as ConnectorProvider } },
  });
  if (!installation) return NextResponse.json({ error: 'Unknown installation' }, { status: 404 });

  const payload = await request.json().catch(() => ({}));

  const event = await prisma.connectorWebhookEvent.create({
    data: {
      installationId: installation.id,
      eventType: request.headers.get('x-event-type') ?? 'unknown',
      payload,
    },
  });

  const def = getConnectorDefinition(params.provider);
  if (def?.handleWebhook) {
    try {
      await def.handleWebhook(installation, payload);
      await prisma.connectorWebhookEvent.update({ where: { id: event.id }, data: { processed: true, processedAt: new Date() } });
    } catch (error) {
      await prisma.connectorWebhookEvent.update({
        where: { id: event.id },
        data: { processingError: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
