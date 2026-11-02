import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/** Pub/sub channel for de-identified organisational activity, fanned out to SSE clients. */
export function activityChannel(organizationId: string) {
  return `realtime:activity:${organizationId}`;
}
