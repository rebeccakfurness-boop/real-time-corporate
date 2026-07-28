import { prisma } from '@/lib/prisma';
import { redis, activityChannel } from '@/lib/redis';
import type { ActivityEventType, EventSeverity } from '@prisma/client';

export interface NewActivityEvent {
  organizationId: string;
  type: ActivityEventType;
  message: string;
  severity?: EventSeverity;
  departmentScope?: string;
  locationScope?: string;
}

/**
 * Persists a de-identified activity event and fans it out over Redis pub/sub so every
 * connected SSE client for the organisation receives it immediately. No user-identifying
 * data should ever be included in `message`.
 */
export async function publishActivityEvent(input: NewActivityEvent) {
  const event = await prisma.activityEvent.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      message: input.message,
      severity: input.severity ?? 'INFO',
      departmentScope: input.departmentScope,
      locationScope: input.locationScope,
    },
  });

  await redis.publish(activityChannel(input.organizationId), JSON.stringify(event)).catch(() => {
    // Realtime fan-out is best-effort; the event is already durably stored and will
    // appear on next poll/reconnect even if Redis is temporarily unavailable.
  });

  return event;
}
