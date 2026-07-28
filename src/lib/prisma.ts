import { PrismaClient } from '@prisma/client';

/**
 * The main app Prisma client. Connects via DATABASE_URL as the chnnl_app Postgres role,
 * which is granted access to the "app" schema only — no access to "identity" or
 * "platform" (see infra/db/roles.sql). This is safe to import anywhere in the app.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
