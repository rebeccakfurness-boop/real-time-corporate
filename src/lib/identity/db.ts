import { PrismaClient } from '@prisma/client';

/**
 * The identity-scoped Prisma client. Connects via IDENTITY_DATABASE_URL, whose Postgres
 * role (chnnl_identity) is granted access to the "identity" schema ONLY — see
 * infra/db/roles.sql. This file must never be imported outside src/lib/identity/*
 * (enforced by the no-restricted-imports ESLint rule in .eslintrc.json).
 */

const globalForIdentityDb = globalThis as unknown as { identityDb?: PrismaClient };

export const identityDb =
  globalForIdentityDb.identityDb ??
  new PrismaClient({
    datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForIdentityDb.identityDb = identityDb;
