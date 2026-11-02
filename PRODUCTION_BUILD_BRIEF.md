# Realtime (Corporate): production build brief

This is a handoff brief for continuing this project in a fresh Claude Code session.
It was written by an earlier session after a long build-and-design conversation; that
session's context is gone, so everything useful from it is captured here. Read this
whole file before touching code.

**Not included on purpose:** brand colours, logo, and typography. The user is
finalising those separately and will supply them. Until you're given final brand
input, don't invent or lock in new hex values. Leave the existing tokens as
placeholders and keep new UI neutral and token-driven, so a palette swap later is
cheap.

---

## 1. What this product is

**Realtime** (internal/legacy codename **chnnl**, still the repo and package name;
see §5) is an enterprise Psychological Safety, Wellbeing and Psychosocial Risk
Intelligence platform for New Zealand/Australia employers. It measures workforce
wellbeing continuously (WHO-5, Te Whare Tapa Whā model, daily check-ins, journaling)
and turns it into psychosocial risk intelligence for leaders, with a strict identity/
anonymity architecture so no leader can ever see which individual said what.

Three tiers:
- **Employee platform**: the "native app" equivalent in the real product's actual
  architecture (see §6). Daily check-in, WHO-5, Speak Up, journal, personal growth,
  resources, team challenges.
- **Leader dashboard**: the "desktop dashboard" equivalent. Org health, psychosocial
  risk intelligence (16-category risk matrix/register), compliance view, reporting,
  AI insights.
- **Platform-owner / internal ops console**: cross-tenant staff tier. Client
  management, pre-aggregation review queue, break-glass identity unlock, connector
  health, audit log. Never visible to tenant users.

---

## 2. Current real implementation (this repo)

Stack: Next.js 14 App Router, TypeScript, Tailwind, Prisma, PostgreSQL (3 schemas),
Redis, Auth.js (NextAuth v5 beta), hosted on Vercel.

Branch: `claude/chnnl-platform-architecture-c8hgk0`. Recent history:
```
6f11b8a Add postinstall prisma generate for Vercel/CI builds
6b30ff2 Realtime rebrand: design tokens (colour, type, contrast enforcement)
6a01a6f Update README for the identity architecture, risk matrix, and integrations
9da12d8 Add identity/anonymity architecture, risk matrix system, and integration framework
03f987e Build chnnl foundation: domain model, auth/RBAC, design system, core dashboards
```

**Built and working:**
- Full base platform: employee check-in/WHO-5/Speak Up/challenges/resources; leader
  Live Intelligence homepage, risk/Speak Up/reports/challenges views; API routes;
  Redis-backed SSE live feed; seed data; Docker + infra scaffold.
- **Identity/anonymity architecture (Part C)**, the most load-bearing piece. Postgres
  split into three schemas (`app`, `identity`, `platform`) with three least-privilege
  DB roles (`chnnl_app`, `chnnl_identity`, `chnnl_platform`), real GRANTs verified live
  (cross-schema access actually denied at the DB level, not just in app code). `Person`
  (no PII) vs `IdentityRecord` (PII, separate schema, no Prisma relation back, so the
  ORM can't join them). Platform-owner tier has its own session system, separate from
  tenant NextAuth sessions. Two-person-approved, time-boxed, audited break-glass
  workflow to ever resolve identity. k-anonymity threshold (default n=5) suppresses
  narrow breakdowns everywhere. ESLint rules physically block importing identity/
  platform DB clients outside their own folders.
- **Risk Matrix system (Part A)**: interactive heat map, Risk Journey
  (inherent/current/residual/target state), structured Action Plan entities, Dynamic
  Risk Register, Compliance Dashboard (WorkSafe/HSWA references kept descriptive,
  never legal-advice-flavoured; keep it that way), AI Risk Assistant (real Anthropic
  call if `ANTHROPIC_API_KEY` set, else a data-grounded template fallback, never a
  dead "AI unavailable" state).
- **Connector framework (Part B)**: plugin architecture for 31 named providers,
  AES-256-GCM credential encryption, OAuth state via `jose`. Only Microsoft 365 is
  actually implemented (Entra ID SSO/provisioning, Teams, Outlook); the rest are
  stubbed. Explicit rule enforced throughout: payroll/HRIS data must never feed
  wellbeing or risk scores, and a connector failure must never break core platform
  functionality.
- **Design tokens**: a tokens-only pass exists (`DESIGN_TOKENS.md`), with two
  deliberately-flagged deviations from the literal brief (muted-foreground contrast,
  accent restraint) and a WCAG contrast check script (`pnpm check:contrast`). This was
  explicitly paused after step 1 of a 9-step rebrand rollout, awaiting confirmation.
  Steps 2 through 9 (logo, full page-by-page token application, voice/tone pass,
  PDF/email templates, auth/marketing pages, error/empty states) were never done.
  Given the new instruction not to lock in brand colours, treat the whole
  visual-design side of this rollout as on hold pending the user's own brand input,
  not as something to resume on your own initiative.

**Known open issue:** a Vercel deploy was being troubleshot. A `postinstall: prisma
generate` script was added as a plausible fix (commit `6f11b8a`), but the actual
failure (a build log that silently terminated at "Linting and checking validity of
types..." with no error or success line, suggesting an OOM, timeout, or killed build
on a 2-core/8GB machine) was never confirmed fixed. **Verify current deploy status
before assuming this is resolved.** Check the Vercel dashboard for this project's
latest deployment status/logs, or ask the user.

---

## 3. The gap: features designed and validated, but not yet in this codebase

Over several follow-up requests, a separate line of work built out **standalone HTML
artifact prototypes** (outside this repo, published to claude.ai) to rapidly explore
UX for features and a reporting system, then validated them against two real chnnl
report PDFs the user supplied (a monthly "Deep Dive" report and a quarterly
"Baseline" report). These artifacts are click-through functional (client-side JS,
`localStorage` state) but are **not real code against this schema/backend**. Treat
them as the UX/IA spec to port in, not something to import directly.

**Reference artifact (read this first, it's the fullest spec):**
`https://claude.ai/code/artifact/82ae68b7-fa62-405b-9199-756e493a55fc`, "Realtime
Indigo Pulse Demo". Open it with the Artifact tool's `read` action, or in a browser.
It has Employee / Leader / Platform Owner portals with every feature below wired up
and clickable. Two earlier/alternate artifacts exist if useful for IA comparison:
`https://claude.ai/code/artifact/44515278-3e59-4a97-8329-1d53ffa889f4` (early static
redesign draft, less complete); the full first MVP demo pass is the direct ancestor
of the Indigo Pulse one, with the same feature set under a different visual skin.

**Features validated in the artifact that don't exist in this repo yet. Build these:**

1. **Journal tab (Employee).** An ongoing reflective AI chat, explicitly framed as
   not a therapist or crisis service (a persistent banner says so). Replies are
   data/keyword-grounded reflective prompts, not generic chatbot filler. Includes
   **crisis-keyword detection**: a short list of high-risk phrases (suicide, self-harm,
   etc.) short-circuits the normal reply path to a distinct response pointing at
   EAP/crisis resources, instead of a reflective prompt. Entries are private, never
   aggregated, never leader-visible, same as the rest of the identity model.
   **Sentiment scoring per entry** (positive/neutral/negative plus confidence) should
   be computed and stored. This mirrors a real pipeline (see §6): raw journal text is
   sent through sentiment classification, then the result is stored alongside the
   entry. Build this as a real server-side classification step in production, not the
   artifact's quick keyword heuristic.
2. **Personal Growth tab (Employee).** Four sub-features: Goals (title, category,
   progress percentage, target date), Circle of Control (three zones: Control,
   Influence, Out of my hands, with free-text items per zone), Brain Dump that splits
   free text into a 7-day weekly board with checkable, movable items, and Celebrate
   Wins (a quick-add log with a running count).
3. **Wellbeing Report tab (Leader).** A merge of a live dashboard and a report
   builder, not two separate pages. Live cards: Te Whare Tapa Whā domain breakdown,
   WHO-5 domain breakdown, average wellbeing by team, by seniority/role type, and an
   **anonymised cross-organisation benchmark** (your org against peer orgs; peers must
   stay anonymised, a leader must never see another tenant's name), top wellbeing
   promoters/detractors, and a monthly trend. All of this is filterable by a scope
   selector (Organisation wellbeing, Team(s) wellbeing, Psychosocial risk management,
   Wellbeing resource participation); selecting a scope shows only the cards relevant
   to it.
   **Report builder, same page:** report type (Monthly Deep Dive, Quarterly Baseline,
   Board Summary), a real custom date-range picker (not just presets), and a PDF
   export. The two real report PDFs the user supplied set the actual bar for
   "comprehensive": cover, Introduction (wellbeing model explainer), Executive
   Summary (wins/insights plus score), Wellbeing Score Overview (trend plus score
   spread across teams), domain breakdowns, group/org/seniority breakdowns, a navy
   section divider before "Reflections Analysis", Top Promoters & Detractors,
   **Positive/Negative Contributors as dot-plots** (current period against previous
   period, on a 1 to 5 scale, with month-on-month percentage change; this is a
   specific real chart type from the source reports, not just a bar list), Journals &
   Wellbeing Outcomes (including a sentiment breakdown), Business Outcomes (job
   satisfaction, intention to leave, burnout risk against benchmark, productivity),
   Demographics & Engagement plus a 6-category psychosocial heat map (Baseline report
   type only), Recommendations, and an Appendix with data-source/methodology/
   k-anonymity disclosure. **For production, generate this server-side** (for example
   `@react-pdf/renderer`, Puppeteer, or a headless-browser print service) rather than
   the artifact's client-side `window.open()` plus browser print-dialog trick, which
   was a workaround for a sandboxed demo environment that doesn't apply here.
4. **Internal Ops console enrichments.** Client list with per-client health, plan,
   and seat count; a pre-aggregation review queue (raw Speak Up/survey text, triage
   actions: mark triaged, aggregate to leader view, or escalate); break-glass
   request/approval UI with a visible countdown once unlocked; connector marketplace
   cards; audit log. Much of the underlying architecture for this already exists in
   this repo (Part C); the artifact mainly validates the UI/IA for it.
5. **Smaller real-feature parity items** surfaced while cross-checking against the
   user's real AWS data-lake infra (see §6): a "Boosters" content type (short
   wellbeing micro-interventions, distinct from longer-form Resources/Tips), and
   group sign-up/invite links (generate a shareable join link per team/group).

**Important: do not treat the artifact's visual design (colours, logo, exact pixel
layout) as a spec.** Per the user's instruction, brand is being handled separately.
Treat the artifact as a **functional and IA spec only**: what each screen does, what
state it holds, what the user can click and what happens, what data each report page
shows. Implement it with whatever visual system the user gives you.

---

## 4. Non-negotiable rules (apply across the whole build)

These were established and repeatedly enforced across the full project history.
Violating any of them is a regression, not a style choice:

- **No leader, admin, or org-side role can ever resolve an individual's identity**,
  directly or via a drill-down/correlation path, except through the two-person
  break-glass workflow. Flag anything that risks this; don't silently build around it.
- **k-anonymity on every leader-facing breakdown.** A breakdown below the threshold
  gets suppressed, not shown with a small or misleading N.
- **Payroll/HRIS connector data must never feed a wellbeing or risk score.** Flag any
  place this could leak in.
- **WorkSafe/HSWA/psychosocial-regulation references are descriptive only, never
  legal advice.** Any compliance-flavoured copy needs a "decision-support tool only,
  not a substitute for professional advice" disclaimer nearby.
- **The Journal/AI companion is never positioned as a therapist or clinical
  substitute.** Crisis-risk content gets a distinct, clearly-labelled safety response,
  not a generic reflective reply.
- **No em dashes anywhere in any user-facing or generated copy.** Use periods,
  commas, colons, or parentheses instead. This was an explicit, repeatedly enforced
  preference. Check generated report/AI copy for this specifically, since LLM output
  defaults to em dashes constantly (this file is an example of that mistake being
  caught and fixed).
- **"Realtime" is the user-facing product name.** "chnnl" may remain in code-only
  identifiers (package name, internal env vars, DB names, the git repo name) but must
  not appear in anything a user reads. See §5 for exactly what's left to rename here.
- A connector failing must never break core platform functionality (graceful
  degradation, already implemented for M365; keep this pattern for new connectors).
- The AI assistant and report-generation patterns must degrade gracefully without an
  API key (data-grounded template fallback), never showing a dead "AI unavailable"
  state.

---

## 5. Rebrand cleanup still outstanding in this repo

`chnnl` still appears in these files (internal identifiers are fine to leave; check
each for user-facing strings specifically: titles, labels, error messages, metadata):

```
src/components/layout/app-sidebar.tsx
src/app/platform/(protected)/layout.tsx
src/app/platform/sign-in/page.tsx
src/app/platform/sign-in/sign-in-form.tsx
src/app/leader/integrations/page.tsx
src/app/sign-in/page.tsx
src/app/privacy/page.tsx
src/app/layout.tsx   (the page <title> and meta description currently literally say "chnnl")
src/lib/identity/db.ts
src/lib/ai/risk-assistant.ts
src/lib/platform/index.ts
src/lib/platform/session.ts
src/lib/platform/db.ts
src/lib/redis.ts
src/lib/prisma.ts
src/lib/rbac.ts
src/lib/connectors/registry.ts
```
`package.json`'s `name` field is also still `"chnnl"`. That's fine to leave per the
internal-identifier rule, unless asked otherwise. Do a final grep pass
(`grep -rn "chnnl" src`) after any rename work and show the user what's left, the
same convention established earlier in this project. Never do a blind
find-and-replace; some of these are legitimately internal (DB role names like
`chnnl_app`/`chnnl_identity`/`chnnl_platform`, storage keys, and so on) and should
stay.

---

## 6. Real production infra context (reference only, do not build this now)

The user separately shared their actual AWS data-lake infrastructure (a CDK/
TypeScript repo: S3 data lake, Postgres RDS read replica feeding a Glue ETL, AWS
Pinpoint for native-app event telemetry, a journal sentiment-enrichment pipeline
where a SageMaker batch-transform model scores each journal entry positive, neutral,
or negative with a confidence and writes it back via an internal API, and QuickSight
for BI). This is real production infrastructure with real AWS account IDs and
internal URLs. **Never reproduce those literal identifiers anywhere**, including in
this repo or any artifact. It was used only to extract real domain modelling:

- Confirms the three-tier mapping: native mobile app maps to the Employee
  experience, the desktop dashboard (QuickSight-adjacent) maps to the Leader
  experience, and a separate ops layer maps to the Internal Ops console. This
  matches what's already built here.
- Real table/entity names worth aligning this schema's naming to, where sensible:
  `userJournal` (journal entries, has a `sentiment` field), `boosters` and
  `booster_categories` (see §3.5), `reflections`, `reflection_responses`, and
  `reflection_themes` (this is the real name for what the reports call "Wellbeing
  Promoters/Detractors", the chnnl-50 survey statement model), `groups`,
  `groupAdmin`, `groupUser`, `group_sign_up_links`, `organisations`,
  `organisationAdmin`, `surveyQuestion`, `surveyResponse`, `userSurvey` (the
  Baseline Survey), `pathway` and `pathwayItem` (maps to the Learn pillar/courses),
  `incident_types` (maps to Speak Up), `dayType` (check-ins already get analysed by
  day-type: rostered working day versus day off, and so on; keep doing this), and
  `entitlements` (plan/seat model, already reflected in this repo's client/org
  model).
- The actual event-pipeline/data-lake architecture (Pinpoint feeding S3, Glue, and
  QuickSight) is a **separate infrastructure project**, not something to attempt
  inside this Next.js/Vercel app. If or when there's a real need for an analytics
  data lake, that's its own piece of work requiring real AWS access and credentials
  this session doesn't have. Don't start scaffolding AWS CDK stacks into this repo
  without the user explicitly asking for that, separately from a web-app feature
  request.

---

## 7. Suggested build order

1. Confirm the current Vercel deploy is actually green (§2's open issue) before
   adding new surface area on top of it.
2. Read the reference artifact end to end (§3) and produce a concrete feature/gap
   list against this repo's current routes and Prisma schema.
3. Extend the Prisma schema for the new features: journal entries (with sentiment),
   goals, circle-of-control items, week-plan items, wins, group sign-up tokens, and
   a booster content type. Keep the existing schema separation (identity/PII stays
   out of the `app` schema; journal text is already a protected/sensitive field
   pattern per §6, so treat it accordingly, likely living in a schema with the same
   access discipline as other personal data).
4. Build Journal and Personal Growth as real Employee routes.
5. Rebuild the Wellbeing Report tab as described in §3.3, with server-side PDF
   generation for the custom-timeframe export.
6. Port the Internal Ops console enrichments.
7. Finish the chnnl-to-Realtime string sweep (§5) once brand direction is otherwise
   settled; don't block the above on this.
8. Apply whatever brand/visual system the user provides separately, across the full
   app. This was explicitly deferred; don't guess at it.
