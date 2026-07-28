# chnnl

**Enterprise Psychological Safety, Wellbeing & Psychosocial Risk Intelligence Platform.**

chnnl is not an employee engagement survey tool. It's a management platform: organisations
continuously measure workforce wellbeing, psychological safety and psychosocial risk, and every
insight is designed to lead directly into a recommendation, an owner and an action — not just a
chart.

This repository contains the foundation build: domain model, authentication & RBAC, design
system, the Leader Dashboard's Live Intelligence homepage, and the Employee Platform's core
measurement flows. It's built to extend into the full platform described in
[Product Vision](#product-vision) below.

## Quick start

```bash
cp .env.example .env          # then fill in AUTH_SECRET (openssl rand -base64 32)
docker compose up -d postgres redis

pnpm install
pnpm db:generate
pnpm db:migrate                # creates the schema
pnpm db:seed                   # loads a realistic demo organisation
pnpm dev                       # http://localhost:3000
```

Demo accounts (all seeded with the same password, printed at the end of `pnpm db:seed`):

| Role | Email |
| --- | --- |
| Platform Owner | `owner@chnnl.demo` |
| Organisation Admin | `admin@chnnl.demo` |
| Executive | `exec@chnnl.demo` |
| People & Culture | `peopleculture@chnnl.demo` |
| Health & Safety | `healthsafety@chnnl.demo` |
| Department Manager | `manager@chnnl.demo` |
| Leader | `leader@chnnl.demo` |
| Employee | `employee@chnnl.demo` |

Or run everything (app + Postgres + Redis) in Docker:

```bash
docker compose up --build
```

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind, hand-rolled shadcn/ui-style primitives | Server components for data-heavy dashboards, client components only where interactive |
| Backend | Next.js Route Handlers + Server Actions | Colocated with the frontend for velocity now; the domain/data layers (`src/domain`, `src/lib/data`) are framework-agnostic and can be lifted into a standalone NestJS service later without a rewrite |
| Database | PostgreSQL via Prisma | Strong relational model for a multi-tenant org hierarchy |
| Caching / Pub-Sub | Redis (ioredis) | Realtime fan-out for the Live Data Feed |
| Realtime | Server-Sent Events (`/api/feed`), Redis pub/sub | Simpler and firewall-friendlier than WebSockets for one-directional live updates; swap for a WS gateway if bidirectional realtime is needed later |
| Auth | Auth.js (NextAuth v5), credentials + TOTP MFA, JWT sessions | RBAC enforced in `src/lib/rbac.ts` and `src/middleware.ts` |
| Charts | Recharts | |
| Deployment | Docker, `infra/k8s/` manifests, GitHub Actions CI | |

### Tenant isolation & RBAC

Every domain table carries `organizationId`. All reads go through `src/lib/data/*`, which take the
session's `organizationId` explicitly — there is no global "current org" implicit state to leak
across requests. `src/lib/rbac.ts` defines the permission matrix and per-role data scope
(`ORGANISATION` / `DEPARTMENT` / `TEAM` / `SELF`); `src/middleware.ts` blocks employees from
`/leader/*` routes at the edge.

### Domain model (`prisma/schema.prisma`)

Covers: organisations → divisions → departments → teams; locations; workplace groups; users with
seniority/employment type/role type; daily check-ins; WHO-5 results; BAT burnout results; custom
surveys; the 16-category psychosocial risk register with history, owners and recommendations;
anonymous Speak Up reports and secure case messaging; team challenges and leaderboards; the
reporting engine; a de-identified activity feed; and audit logging.

### Scoring (`src/domain/scoring.ts`)

- **WHO-5**: standard 5-item, 0–25 raw → 0–100% scale, ≤50% screening flag.
- **BAT**: exhaustion + mental distance (core) and cognitive + emotional impairment (secondary),
  banded Low/Moderate/High/Critical against published cut-offs.
- Organisation-level aggregation (wellbeing, health, burnout index, psychological safety,
  psychosocial risk) lives in `src/lib/data/dashboard.ts` and is filterable by department,
  division, team, location, workplace group, seniority, employment type, manager and wellbeing
  domain (`src/lib/data/filters.ts`), all wired into the Live Intelligence Dashboard's filter bar.

## What's built

- **Leader Dashboard** — Live Intelligence homepage (org/health/burnout/psych-safety/risk scores,
  wellbeing trend, live SSE activity feed, emerging risks, high-risk areas, trending
  improvements), full Psychosocial Risk register + detail pages with recommendations and history,
  de-identified Speak Up case list, Team Challenges & leaderboards, Reporting Engine (generation +
  history; PDF rendering is the next phase), People & Org, Settings.
- **Employee Platform** — home, daily check-in, WHO-5 assessment, personal history, resources,
  Speak Up (submit anonymously or identified, track a report by code without an account).
- **Auth & security** — credentials + optional TOTP MFA, RBAC middleware, audit logging on
  sign-in, tenant-scoped queries throughout, security headers in `next.config.mjs`.
- **Design system** — token-based light/dark theme (`src/app/globals.css`,
  `tailwind.config.ts`), a full shadcn/ui-style primitive set in `src/components/ui`.

## Roadmap (by design — not yet built)

Deliberately incremental, per the brief: "begin with a strong domain model, database schema,
authentication, design system and core dashboards before expanding into advanced analytics, AI
features and reporting."

1. **AI Insights** — natural-language Q&A over the org snapshot, auto-generated risk narratives
   and board summaries. `Recommendation`/`PsychosocialRisk` already model the output shape; needs
   an LLM service wired to `ANTHROPIC_API_KEY` (see `.env.example`).
2. **PDF reporting** — premium consulting-report layout, charts, heat maps, risk matrices,
   exported server-side (e.g. via a headless-browser render of a report template).
3. **Full survey builder UI** for `Survey`/`SurveyQuestion` (schema already supports it).
4. **Object storage** for Speak Up evidence uploads (S3-compatible; env vars scaffolded).
5. **WebSocket gateway** if bidirectional realtime (e.g. live case messaging) is needed beyond SSE.
6. **Standalone NestJS service** if/when the backend needs to scale independently of the Next.js
   frontend — the domain and data-access layers are already framework-agnostic.

## Product vision

Everything above builds toward: continuous, org-wide measurement of wellbeing, psychological
safety and psychosocial risk; real-time leader intelligence (not static reports); AI-assisted,
practical recommendations, learning resources and workshop suggestions tied to every identified
risk; anonymous Speak Up with de-identified case management; team challenges; and board-ready
reporting — accessible, mobile-responsive and fast enough to feel like Linear or Stripe rather than
legacy enterprise software.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / start |
| `pnpm lint` / `pnpm typecheck` | Lint / type-check |
| `pnpm db:migrate` | Create/apply a dev migration |
| `pnpm db:seed` | Seed the demo organisation |
| `pnpm db:studio` | Prisma Studio |
