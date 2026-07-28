-- chnnl identity isolation: three least-privilege Postgres roles, one per Prisma client.
--
-- Run this AFTER `prisma migrate deploy` (migrations create the three schemas and all
-- tables, owned by the migration role — e.g. the default `chnnl` role from docker-compose).
-- These GRANTs are additive and idempotent; safe to re-run.
--
-- chnnl_app      — used by the main Next.js app (DATABASE_URL). Full access to "app" only.
--                  No grants on "identity" or "platform" — a bug that accidentally tries to
--                  query IdentityRecord or PlatformStaffAccount fails at the database level,
--                  not just in code review.
-- chnnl_identity — used only by src/lib/identity/* (IDENTITY_DATABASE_URL). Full access to
--                  "identity" only.
-- chnnl_platform — used only by src/lib/platform/* (PLATFORM_DATABASE_URL). Full access to
--                  "platform" (its own tables, break-glass audit trail), read-only access to
--                  "app" (needed for the cross-tenant platform-owner dashboard: org health,
--                  usage, integration status — never individual wellbeing data), and
--                  read-only access to "identity" — only ever queried by application code at
--                  the moment of an APPROVED, time-boxed break-glass unlock.
--
-- Passwords below are placeholders for local/dev use — set real ones via your secrets
-- manager in any shared environment and never commit them.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'chnnl_app') THEN
    CREATE ROLE chnnl_app LOGIN PASSWORD 'chnnl_app_dev_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'chnnl_identity') THEN
    CREATE ROLE chnnl_identity LOGIN PASSWORD 'chnnl_identity_dev_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'chnnl_platform') THEN
    CREATE ROLE chnnl_platform LOGIN PASSWORD 'chnnl_platform_dev_password';
  END IF;
END $$;

-- chnnl_app: full access to "app" schema only
GRANT USAGE ON SCHEMA app TO chnnl_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO chnnl_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO chnnl_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL PRIVILEGES ON TABLES TO chnnl_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL PRIVILEGES ON SEQUENCES TO chnnl_app;

-- chnnl_identity: full access to "identity" schema only
GRANT USAGE ON SCHEMA identity TO chnnl_identity;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA identity TO chnnl_identity;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA identity TO chnnl_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL PRIVILEGES ON TABLES TO chnnl_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL PRIVILEGES ON SEQUENCES TO chnnl_identity;

-- chnnl_platform: full access to "platform", read-only to "app" and "identity"
GRANT USAGE ON SCHEMA platform TO chnnl_platform;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO chnnl_platform;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA platform TO chnnl_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL PRIVILEGES ON TABLES TO chnnl_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL PRIVILEGES ON SEQUENCES TO chnnl_platform;

GRANT USAGE ON SCHEMA app TO chnnl_platform;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO chnnl_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO chnnl_platform;

GRANT USAGE ON SCHEMA identity TO chnnl_platform;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO chnnl_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO chnnl_platform;

-- Explicit belt-and-braces revokes, in case PUBLIC ever had schema access.
REVOKE ALL ON SCHEMA identity FROM PUBLIC;
REVOKE ALL ON SCHEMA platform FROM PUBLIC;
