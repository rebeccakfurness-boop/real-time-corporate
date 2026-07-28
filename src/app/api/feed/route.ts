import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redis, activityChannel } from '@/lib/redis';
import Redis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const organizationId = session.user.organizationId;
  const encoder = new TextEncoder();

  const subscriber: Redis = redis.duplicate();
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // controller already closed (client disconnected) — nothing to do
        }
      };

      const recent = await prisma.activityEvent.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      send({ type: 'backfill', events: recent.reverse() });

      try {
        await subscriber.subscribe(activityChannel(organizationId));
      } catch {
        // Redis unavailable — client still has the backfill above.
      }

      subscriber.on('message', (_channel, message) => {
        try {
          send({ type: 'event', event: JSON.parse(message) });
        } catch {
          // ignore malformed payloads
        }
      });

      heartbeat = setInterval(() => send(null), 25000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      subscriber.unsubscribe().catch(() => {});
      subscriber.quit().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
