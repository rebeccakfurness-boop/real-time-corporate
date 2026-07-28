import { PrismaClient } from '@prisma/client';

/**
 * The platform-scoped Prisma client. Connects via PLATFORM_DATABASE_URL, whose Postgres
 * role (chnnl_platform) has full access to the "platform" schema (platform staff,
 * break-glass audit trail) and read-only access to "app" (cross-tenant org health for the
 * platform-owner dashboard) and "identity" (only ever queried at the moment of an
 * approved break-glass unlock). Must never be imported outside src/lib/platform/*
 * (enforced by the no-restricted-imports ESLint rule in .eslintrc.json).
 */

const globalForPlatformDb = globalThis as unknown as { platformDb?: PrismaClient };

export const platformDb =
  globalForPlatformDb.platformDb ??
  new PrismaClient({
    datasources: { db: { url: process.env.PLATFORM_DATABASE_URL } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPlatformDb.platformDb = platformDb;
