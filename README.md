# chnnl

**Enterprise Psychological Safety, Wellbeing & Psychosocial Risk Intelligence Platform.**

chnnl is not an employee engagement survey tool. It's a management platform: organisations
continuously measure workforce wellbeing, psychological safety and psychosocial risk, and every
insight is designed to lead directly into a recommendation, an owner and an action — not just a
chart. Every wellbeing/risk data surface is pseudonymous by construction: an organisation's own
leaders can never trace it back to a name (see [Identity architecture](#identity-architecture--three-postgres-schemas-three-db-roles)).

## Quick start

```bash
cp .env.example .env          # fill in AUTH_SECRET / PLATFORM_AUTH_SECRET / CONNECTOR_ENCRYPTION_KEY
                               # (openssl rand -base64 32, a different value for each)
docker compose up -d postgres redis

pnpm install
pnpm db:generate
pnpm db:migrate                # creates all three schemas (app / identity / platform)
psql "$MIGRATE_DATABASE_URL" -f infra/db/roles.sql   # creates the three least-privilege DB roles
pnpm db:seed                   # loads a realistic demo organisation + platform staff
pnpm dev                       # http://localhost:3000
```

Demo tenant accounts (all seeded with the same password, printed at the end of `pnpm db:seed`):

| Role | Email |
| --- | --- |
| Organisation Owner | `owner@chnnl.demo` |
| Organisation Admin | `admin@chnnl.demo` |
| Executive | `exec@chnnl.demo` |
| People & Culture | `peopleculture@chnnl.demo` |
| Health & Safety | `healthsafety@chnnl.demo` |
| Department Manager | `manager@chnnl.demo` |
| Leader | `leader@chnnl.demo` |
| Employee | `employee@chnnl.demo` |

Demo platform staff (chnnl-internal, separate identity space — sign in at `/platform/sign-in`,
password also printed at the end of `pnpm db:seed`): `staff-super@chnnl.internal` (Super Admin),
`staff-safety@chnnl.internal` (Safety Officer), `staff-support@chnnl.internal` (Support). Break-glass
identity unlocks need two *different* staff members — request as one, approve as another.

Or run everything (app + Postgres + Redis) in Docker:

```bash
docker compose up --build
```

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind, hand-rolled shadcn/ui-style primitives | Server components for data-heavy dashboards, client components only where interactive |
| Backend | Next.js Route Handlers + Server Actions | Colocated with the frontend for velocity now; the domain/data layers (`src/domain`, `src/lib/data`) are framework-agnostic and can be lifted into a standalone NestJS service later without a rewrite |
| Database | PostgreSQL via Prisma, 3 schemas / 3 roles | See [Identity architecture](#identity-architecture--three-postgres-schemas-three-db-roles) |
| Caching / Pub-Sub | Redis (ioredis) | Realtime fan-out for the Live Data Feed |
| Realtime | Server-Sent Events (`/api/feed`), Redis pub/sub | Simpler and firewall-friendlier than WebSockets for one-directional live updates; swap for a WS gateway if bidirectional realtime is needed later |
| Auth | Auth.js (NextAuth v5) for tenant sign-in, a separate signed-cookie session for platform staff | RBAC in `src/lib/rbac.ts`; edge-safe checks for both in `src/middleware.ts` |
| Charts | Recharts | |
| AI | Anthropic Messages API, optional | Falls back to data-grounded template answers when `ANTHROPIC_API_KEY` is unset — see `src/lib/ai/` |
| Integrations | Plugin registry, `src/lib/connectors/` | New connectors register a definition; nothing else changes — see [Integrations](#integrations) |
| Deployment | Docker, `infra/k8s/` manifests, GitHub Actions CI | |

### Identity architecture — three Postgres schemas, three DB roles

The core design constraint: **an organisation's own leaders (including its Admin/Owner) can never
query their way from wellbeing/risk data to a name** — not through the UI, not through a raw query,
not through a chain of filters narrowed down to a small group. This is enforced structurally, not
just hidden in the UI:

- **`app` schema** (role `chnnl_app`, what the running app connects as) — all pseudonymous tenant
  data. `Person` (id, org, role, department, seniority…) is the FK target for every check-in,
  survey response, risk, Speak Up report, etc. It holds **no PII**.
- **`identity` schema** (role `chnnl_identity`, only `src/lib/identity/*` may import its client) —
  name, email, password hash, MFA secret. `IdentityRecord.personId` is a plain column, deliberately
  **not** a Prisma relation — there is no ORM-level query path from `Person` to `IdentityRecord`.
  An ESLint rule (`.eslintrc.json`) additionally blocks importing the identity Prisma client or
  touching `identityRecord` from anywhere outside that folder.
- **`platform` schema** (role `chnnl_platform`) — a wholly separate, cross-tenant identity space
  for chnnl's own staff (`PlatformStaffAccount`, never an organisation-side role) and the
  break-glass audit trail (`BreakGlassUnlock`).

`infra/db/roles.sql` creates the three Postgres roles with real GRANTs — `chnnl_app` has zero access
to `identity`/`platform` at the database level, so a bug that somehow tried to query PII would fail
with a permission error, not just a code-review miss. `chnnl_platform` gets read-only access to
`app` (for the cross-tenant org-health view) and to `identity` (only exercised at the moment of an
approved unlock).

**k-anonymity**: every dashboard/register/compliance breakdown is gated by
`Organization.kAnonymityThreshold` (default 5, see `src/lib/data/k-anonymity.ts`) — a filter
combination matching fewer people than that is suppressed rather than shown, since a small enough
group can be identifying even with no name attached.

**Break-glass unlock** (`src/lib/platform/index.ts`, `/platform/break-glass`): the *only* path that
can ever re-identify a person, reserved for genuine safety situations. Two-person rule (approver
must differ from requester), reason required, time-boxed once accessed, fully audited via the
existing `AuditLog` (tagged `actorType: PLATFORM_STAFF`). See `/privacy` for the plain-English
version of this boundary shown to employees.

### Tenant isolation & RBAC

Every domain table carries `organizationId`. All reads go through `src/lib/data/*`, which take the
session's `organizationId` explicitly. `src/lib/rbac.ts` defines the permission matrix and per-role
data scope; `src/middleware.ts` enforces both the tenant session (blocking employees from
`/leader/*`) and the separate platform-staff session (`/platform/*`) at the edge.

### Domain model (`prisma/schema.prisma`)

Organisations → divisions → departments → teams; locations; workplace groups; `Person` (seniority/
employment type/role type, no PII); daily check-ins; WHO-5 and BAT results; custom surveys; the
16-category psychosocial risk register with a Risk Journey (inherent/current/residual/target,
append-only `RiskStateChange` log), controls, a structured action plan, owners and recommendations;
anonymous Speak Up; team challenges; the reporting engine; connector installations/sync
runs/webhook events; a de-identified activity feed; and audit logging.

### Scoring (`src/domain/scoring.ts`)

- **WHO-5**: standard 5-item, 0–25 raw → 0–100% scale, ≤50% screening flag.
- **BAT**: exhaustion + mental distance (core) and cognitive + emotional impairment (secondary),
  banded Low/Moderate/High/Critical against published cut-offs.
- Organisation-level aggregation lives in `src/lib/data/dashboard.ts`, filterable by department,
  division, team, location, workplace group, seniority, employment type, manager and wellbeing
  domain (`src/lib/data/filters.ts`) — the same filters the Psychosocial Risk Matrix/Register and
  Compliance Dashboard respect.

## What's built

- **Leader Dashboard** — Live Intelligence homepage, full Psychosocial Risk Matrix (heat map) +
  Dynamic Risk Register with Risk Journey/controls/action plans, a Compliance Dashboard, an AI Risk
  Assistant (works with or without an API key), de-identified Speak Up cases, Team Challenges
  (pseudonymous leaderboards), Reporting Engine, an Integrations marketplace, an admin-only People
  directory, Settings.
- **Employee Platform** — home, daily check-in, WHO-5 assessment, personal history, resources,
  Speak Up (submit anonymously or identified, track a report by code without an account).
- **Platform staff console** (`/platform`) — cross-tenant org list, break-glass identity unlock
  workflow. Entirely separate sign-in and session from the tenant app.
- **Integrations** — connector plugin framework (`src/lib/connectors/`) covering 31 prioritised
  providers as marketplace entries; Microsoft 365 implemented for real (OAuth 2.0 against Entra ID,
  Graph directory sync) — the rest are accurate "coming soon" listings, not fake stubs.
- **Auth & security** — credentials + optional TOTP MFA, RBAC middleware, three-schema DB isolation,
  audit logging, security headers.
- **Design system** — token-based light/dark theme, a full shadcn/ui-style primitive set.

## Integrations

New connectors are added purely by registering a `ConnectorDefinition` in
`src/lib/connectors/registry.ts` — no other core code changes. A connector failure (bad
credentials, provider outage) is caught, recorded as a failed `ConnectorSyncRun`, and surfaced in
the marketplace UI; it never propagates to break check-ins, dashboards, or anything else.
Microsoft 365 needs `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` (an Azure AD app
registration) to complete a real OAuth flow — without them it fails fast with a clear
"not configured" error.

## Roadmap (not yet built)

1. **PDF reporting** — premium consulting-report layout, exported server-side.
2. **Full survey builder UI** for `Survey`/`SurveyQuestion` (schema already supports it).
3. **Object storage** for Speak Up evidence uploads (S3-compatible; env vars scaffolded).
4. **Remaining 30 connectors** — framework is generic; each needs its own OAuth app + API mapping.
5. **Second-factor for platform staff sign-in** (`mfaSecret` field exists on
   `PlatformStaffAccount`, not yet wired into the sign-in flow).
6. **Standalone NestJS service** if/when the backend needs to scale independently — the domain and
   data-access layers are already framework-agnostic.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / start |
| `pnpm lint` / `pnpm typecheck` | Lint / type-check |
| `pnpm db:migrate` | Create/apply a dev migration (needs `MIGRATE_DATABASE_URL`, a DDL-capable role) |
| `pnpm db:seed` | Seed the demo organisation + platform staff |
| `pnpm db:studio` | Prisma Studio |
