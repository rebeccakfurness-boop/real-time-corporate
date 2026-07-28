import { PrismaClient, type PlatformRole, type WellbeingDomain, type RiskCategory, type RecommendationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { scoreWho5, scoreBat } from '../src/domain/scoring';
import { createIdentity } from '../src/lib/identity';
import { identityDb } from '../src/lib/identity/db';
import { platformDb } from '../src/lib/platform/db';
import { RISK_CATEGORY_DOMAIN } from '../src/lib/labels';

// Seed scripts are trusted, dev-only tooling — they intentionally reach into the
// identity/platform Prisma clients directly (via IDENTITY_DATABASE_URL / PLATFORM_DATABASE_URL,
// which must be reachable with DDL-capable credentials for this to work locally) to
// provision demo people, platform staff and PII in one pass. No application runtime code
// is allowed to do this — see the no-restricted-imports ESLint rule in .eslintrc.json,
// which exempts prisma/** for exactly this reason.

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'ChnnlDemo123!';
const PLATFORM_STAFF_PASSWORD = 'ChnnlPlatformStaff123!';

const FIRST_NAMES = [
  'Amelia', 'Noah', 'Isla', 'Liam', 'Mia', 'Oliver', 'Ava', 'Lucas', 'Charlotte', 'Ethan',
  'Grace', 'Mason', 'Sophie', 'James', 'Ella', 'Benjamin', 'Zoe', 'Henry', 'Ruby', 'Jack',
  'Aroha', 'Mikaere', 'Manaia', 'Kahurangi', 'Tane', 'Nikau', 'Priya', 'Arjun', 'Wei', 'Ling',
  'Sione', 'Fa’amoana', 'Carlos', 'Sofia', 'Fatima', 'Omar', 'Chen', 'Yuki', 'Daniel', 'Hannah',
];
const LAST_NAMES = [
  'Wilson', 'Brown', 'Taylor', 'Anderson', 'Clarke', 'Walker', 'Robinson', 'Wright', 'Thompson', 'White',
  'Ngata', 'Wiremu', 'Rangi', 'Patel', 'Singh', 'Kumar', 'Wang', 'Li', 'Zhang', 'Nguyen',
  'Tuilagi', 'Faleolo', 'Garcia', 'Martinez', 'Rossi', 'Muller', 'Dubois', 'Kim', 'Yamamoto', 'Cohen',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const DOMAINS: WellbeingDomain[] = [
  'WORK_DESIGN', 'CULTURE_AND_LEADERSHIP', 'SOCIAL_CONNECTIONS', 'MANA_WHENUA', 'DEI',
  'PERSONAL_FACTORS', 'PSYCHOLOGICAL_SAFETY', 'PSYCHOSOCIAL_RISK', 'BURNOUT_BAT', 'WHO5', 'TE_WHARE_TAPA_WHA',
];

async function main() {
  console.log('Seeding chnnl demo data…');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const org = await prisma.organization.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Aurora Health Group',
      slug: 'demo',
      industry: 'Healthcare',
      timezone: 'Pacific/Auckland',
      planTier: 'ENTERPRISE',
    },
  });

  // Org structure
  const divisionNames = ['Corporate', 'Frontline Services'];
  const divisions = await Promise.all(
    divisionNames.map((name) => prisma.division.create({ data: { organizationId: org.id, name } }))
  );

  const departmentDefs = [
    { name: 'Engineering', divisionId: divisions[0]!.id },
    { name: 'Product', divisionId: divisions[0]!.id },
    { name: 'People & Culture', divisionId: divisions[0]!.id },
    { name: 'Finance', divisionId: divisions[0]!.id },
    { name: 'Customer Support', divisionId: divisions[1]!.id },
    { name: 'Clinical Operations', divisionId: divisions[1]!.id },
    { name: 'Facilities', divisionId: divisions[1]!.id },
  ];
  const departments = await Promise.all(
    departmentDefs.map((d) => prisma.department.create({ data: { organizationId: org.id, name: d.name, divisionId: d.divisionId } }))
  );

  const locations = await Promise.all(
    ['Auckland HQ', 'Wellington Office', 'Christchurch Site', 'Remote'].map((name) =>
      prisma.location.create({ data: { organizationId: org.id, name, country: 'New Zealand' } })
    )
  );

  const workplaceGroups = await Promise.all(
    ['Hybrid', 'On-site', 'Remote-first'].map((name) => prisma.workplaceGroup.create({ data: { organizationId: org.id, name } }))
  );

  const teams: { id: string; departmentId: string }[] = [];
  for (const dept of departments) {
    const teamCount = randInt(2, 3);
    for (let i = 0; i < teamCount; i++) {
      const team = await prisma.team.create({
        data: { organizationId: org.id, departmentId: dept.id, name: `${dept.name} Team ${i + 1}` },
      });
      teams.push({ id: team.id, departmentId: dept.id });
    }
  }

  // Named leadership accounts — one per role, easy to demo with
  const namedAccounts: { email: string; name: string; role: PlatformRole }[] = [
    { email: 'owner@chnnl.demo', name: 'Priya Sharma', role: 'ORG_OWNER' },
    { email: 'admin@chnnl.demo', name: 'Daniel Cohen', role: 'ORG_ADMIN' },
    { email: 'exec@chnnl.demo', name: 'Grace Robinson', role: 'EXECUTIVE' },
    { email: 'peopleculture@chnnl.demo', name: 'Aroha Ngata', role: 'PEOPLE_AND_CULTURE' },
    { email: 'healthsafety@chnnl.demo', name: 'Wei Zhang', role: 'HEALTH_AND_SAFETY' },
    { email: 'manager@chnnl.demo', name: 'Carlos Garcia', role: 'DEPARTMENT_MANAGER' },
    { email: 'leader@chnnl.demo', name: 'Sofia Rossi', role: 'LEADER' },
    { email: 'employee@chnnl.demo', name: 'Jack Wright', role: 'EMPLOYEE' },
  ];

  const seniorities = ['EXECUTIVE', 'SENIOR_LEADER', 'MANAGER', 'TEAM_LEAD', 'INDIVIDUAL_CONTRIBUTOR'] as const;
  const employmentTypes = ['FULL_TIME', 'FULL_TIME', 'FULL_TIME', 'PART_TIME', 'CASUAL', 'FIXED_TERM', 'CONTRACTOR'] as const;
  const roleTypes = ['Individual Contributor', 'People Manager', 'Specialist', 'Support'];

  const users: { id: string; departmentId: string; role: PlatformRole }[] = [];

  // Person (pseudonymous) + IdentityRecord (PII) are two separate writes against two
  // separate Postgres roles — see src/lib/identity/provisioning.ts for the same pattern
  // used by real application code. Emails are unique in the identity store, so re-running
  // the seed against an existing identity store would fail on the second run; this seed
  // is meant for a fresh database (see README).
  for (const acc of namedAccounts) {
    const dept = pick(departments);
    const person = await prisma.person.create({
      data: {
        organizationId: org.id,
        role: acc.role,
        seniority: acc.role === 'EXECUTIVE' ? 'EXECUTIVE' : acc.role === 'DEPARTMENT_MANAGER' ? 'MANAGER' : pick(seniorities),
        employmentType: 'FULL_TIME',
        roleType: pick(roleTypes),
        departmentId: dept.id,
        locationId: pick(locations).id,
        workplaceGroupId: pick(workplaceGroups).id,
        status: 'ACTIVE',
      },
    });
    await createIdentity({ personId: person.id, email: acc.email, name: acc.name, passwordHash });
    users.push({ id: person.id, departmentId: dept.id, role: acc.role });
  }

  // Broader employee population for realistic aggregates
  for (let i = 0; i < 60; i++) {
    const dept = pick(departments);
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const email = `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase().replace(/[^a-z]/g, '')}${i}@auroragroup.example`;
    const person = await prisma.person.create({
      data: {
        organizationId: org.id,
        role: 'EMPLOYEE',
        seniority: pick(seniorities),
        employmentType: pick(employmentTypes),
        roleType: pick(roleTypes),
        departmentId: dept.id,
        locationId: pick(locations).id,
        workplaceGroupId: pick(workplaceGroups).id,
        status: 'ACTIVE',
      },
    });
    await createIdentity({ personId: person.id, email, name: `${first} ${last}` });
    await identityDb.identityRecord.update({ where: { personId: person.id }, data: { passwordHash } });
    users.push({ id: person.id, departmentId: dept.id, role: 'EMPLOYEE' });
  }

  // Assign team memberships and managers
  for (const team of teams) {
    const deptUsers = users.filter((u) => u.departmentId === team.departmentId);
    if (deptUsers.length === 0) continue;
    const manager = pick(deptUsers);
    const members = deptUsers.filter(() => Math.random() > 0.4).slice(0, 8);
    await prisma.team.update({
      where: { id: team.id },
      data: {
        managerId: manager.id,
        members: { connect: members.map((m) => ({ id: m.id })) },
      },
    });
  }

  console.log(`Created ${users.length} people across ${departments.length} departments.`);

  // Check-ins, WHO-5, BAT over the last 60 days
  for (const user of users) {
    const submissionDays = randInt(6, 22);
    for (let i = 0; i < submissionDays; i++) {
      const createdAt = daysAgo(randInt(0, 59));
      const baseline = randInt(2, 5);
      await prisma.checkIn.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          createdAt,
          moodScore: Math.min(5, Math.max(1, baseline + randInt(-1, 1))),
          energyScore: Math.min(5, Math.max(1, baseline + randInt(-1, 1))),
          stressScore: Math.min(5, Math.max(1, 6 - baseline + randInt(-1, 1))),
          workloadScore: Math.min(5, Math.max(1, baseline + randInt(-1, 1))),
          domain: pick(DOMAINS),
        },
      });
    }

    const who5Submissions = randInt(1, 4);
    for (let i = 0; i < who5Submissions; i++) {
      const items = {
        q1Cheerful: randInt(1, 5),
        q2Calm: randInt(1, 5),
        q3Active: randInt(1, 5),
        q4RestedFresh: randInt(1, 5),
        q5Interesting: randInt(1, 5),
      };
      const score = scoreWho5(items);
      await prisma.who5Result.create({
        data: { organizationId: org.id, userId: user.id, createdAt: daysAgo(randInt(0, 59)), ...items, ...score },
      });
    }

    if (Math.random() > 0.5) {
      const dims = {
        exhaustionScore: Number((Math.random() * 4 + 1).toFixed(2)),
        mentalDistanceScore: Number((Math.random() * 4 + 1).toFixed(2)),
        cognitiveImpairmentScore: Number((Math.random() * 4 + 1).toFixed(2)),
        emotionalImpairmentScore: Number((Math.random() * 4 + 1).toFixed(2)),
      };
      const batScore = scoreBat(dims);
      await prisma.batResult.create({
        data: { organizationId: org.id, userId: user.id, createdAt: daysAgo(randInt(0, 59)), ...batScore },
      });
    }
  }
  console.log('Seeded check-ins, WHO-5 and BAT results.');

  // Psychosocial risks
  const riskDefs: {
    category: RiskCategory; title: string; summary: string; whyItMatters: string; factors: string[];
    worksafeContext: string;
    score: number; trend: 'IMPROVING' | 'STABLE' | 'WORSENING'; likelihood: number; impact: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; confidence: number; department?: string;
  }[] = [
    {
      category: 'WORK_DEMANDS', title: 'Sustained high workload in Engineering', department: 'Engineering',
      summary: 'Check-in and survey data show workload scores trending down for eight consecutive weeks in Engineering, concentrated around release cycles.',
      whyItMatters: 'Sustained high demand without recovery time is the strongest predictor of burnout and attrition in this dataset.',
      worksafeContext: 'WorkSafe NZ names excessive job demands as a core psychosocial hazard under HSWA — sustained, unmanaged workload is treated the same as any other work-related health risk that a PCBU must identify and manage.',
      factors: ['Understaffed on-call rotation', 'Compressed release timelines', 'Scope creep on active sprints'],
      score: 71, trend: 'WORSENING', likelihood: 4, impact: 4, priority: 'HIGH', confidence: 82,
    },
    {
      category: 'BURNOUT', title: 'Elevated burnout risk in Customer Support', department: 'Customer Support',
      summary: 'BAT scores for Customer Support are 1.2 points above the organisational mean, with exhaustion the dominant sub-scale.',
      whyItMatters: 'Frontline teams already show the highest attrition risk; unmanaged burnout compounds service quality and safety incidents.',
      worksafeContext: 'Chronic burnout is a recognised work-related harm outcome — WorkSafe guidance frames it as a lagging indicator that earlier psychosocial hazards (demand, control, support) went unmanaged.',
      factors: ['High ticket volume', 'Limited breaks between shifts', 'Low perceived control over queue'],
      score: 78, trend: 'WORSENING', likelihood: 4, impact: 5, priority: 'CRITICAL', confidence: 85,
    },
    {
      category: 'PSYCHOLOGICAL_SAFETY', title: 'Declining psychological safety in Product', department: 'Product',
      summary: 'Survey responses on speaking up and challenging decisions have declined 9 points quarter over quarter in Product.',
      whyItMatters: 'Low psychological safety suppresses early warning signals for every other risk category — it is a leading indicator, not a lagging one.',
      worksafeContext: 'Psychological safety underpins hazard reporting itself — WorkSafe expects PCBUs to maintain channels where workers can raise concerns without fear, since a culture that suppresses reporting hides every other hazard.',
      factors: ['Recent leadership change', 'Public criticism in team forums', 'Low manager availability'],
      score: 64, trend: 'WORSENING', likelihood: 3, impact: 4, priority: 'HIGH', confidence: 74,
    },
    {
      category: 'CHANGE_MANAGEMENT', title: 'Change fatigue following restructure', department: 'Finance',
      summary: 'Open-text responses show repeated references to "constant change" and "unclear direction" following the Q2 restructure.',
      whyItMatters: 'Poorly managed change erodes trust in leadership and increases voluntary turnover risk for 6-12 months after the event.',
      worksafeContext: 'Poorly managed organisational change is one of WorkSafe’s named psychosocial hazards — the expectation is proactive communication and support through change, not just after-the-fact remediation.',
      factors: ['Restructure communicated with short notice', 'Unclear new reporting lines', 'No dedicated change support'],
      score: 58, trend: 'STABLE', likelihood: 3, impact: 3, priority: 'MEDIUM', confidence: 70,
    },
    {
      category: 'ROLE_CLARITY', title: 'Role ambiguity in Facilities', department: 'Facilities',
      summary: 'Role clarity questions score lowest of all categories in Facilities, with several employees unsure of reporting lines.',
      whyItMatters: 'Ambiguity drives duplicated effort, frustration and disengagement, and slows onboarding for new hires.',
      worksafeContext: 'Role clarity sits under WorkSafe’s "job demands" hazard category — unclear expectations increase cognitive load in ways that are treated no differently to a physical hazard needing a control plan.',
      factors: ['No updated role descriptions since 2023', 'Dual reporting after merger', 'Informal task allocation'],
      score: 46, trend: 'IMPROVING', likelihood: 2, impact: 3, priority: 'MEDIUM', confidence: 66,
    },
    {
      category: 'RECOGNITION', title: 'Low recognition sentiment organisation-wide', department: undefined,
      summary: 'Recognition consistently scores as the lowest-rated culture item across all departments this quarter.',
      whyItMatters: 'Recognition is one of the most cost-effective levers for improving engagement and retention.',
      worksafeContext: 'Low reward and recognition is a documented psychosocial hazard contributor — it compounds perceived unfairness and reduces the protective effect that a supportive culture otherwise provides.',
      factors: ['No formal peer recognition programme', 'Manager capability gap on feedback', 'Remote workers report feeling invisible'],
      score: 52, trend: 'STABLE', likelihood: 3, impact: 2, priority: 'MEDIUM', confidence: 68,
    },
    {
      category: 'ISOLATION', title: 'Social isolation among remote-first employees', department: undefined,
      summary: 'Employees in the Remote-first workplace group report significantly lower social connection scores than hybrid or on-site peers.',
      whyItMatters: 'Isolation is strongly linked to lower psychological safety and slower escalation of concerns.',
      worksafeContext: 'Isolated or remote work is explicitly flagged by WorkSafe as a context that can elevate psychosocial risk, since normal peer support and informal check-ins are harder to sustain.',
      factors: ['Few in-person touchpoints', 'Meeting-only collaboration', 'No remote-specific connection rituals'],
      score: 55, trend: 'STABLE', likelihood: 3, impact: 3, priority: 'MEDIUM', confidence: 63,
    },
    {
      category: 'JOB_CONTROL', title: 'Low perceived job control in Clinical Operations', department: 'Clinical Operations',
      summary: 'Job control (autonomy over how work gets done) scores are the lowest of any department for the third quarter running.',
      whyItMatters: 'Low control combined with high demand is the classic high-strain job pattern most associated with health harm.',
      worksafeContext: 'The demand-control model referenced in WorkSafe guidance identifies "high demand, low control" as the highest-risk combination for psychological harm — this is exactly that pattern.',
      factors: ['Rigid rostering system', 'Limited input into process changes', 'Compliance-heavy workflows'],
      score: 60, trend: 'WORSENING', likelihood: 3, impact: 4, priority: 'HIGH', confidence: 72,
    },
    {
      category: 'INCLUSION', title: 'DEI sentiment gap by seniority', department: undefined,
      summary: 'Individual contributors report meaningfully lower inclusion scores than managers and executives on the same survey items.',
      whyItMatters: 'A perception gap between leadership and frontline staff often signals blind spots in lived experience of inclusion.',
      worksafeContext: 'Exclusion and unfair treatment fall under WorkSafe’s psychosocial hazard framework alongside bullying and harassment — a perception gap by seniority is an early signal worth investigating before it escalates.',
      factors: ['Limited ERG participation', 'Inclusion training not yet rolled out org-wide', 'Feedback channels underused'],
      score: 48, trend: 'IMPROVING', likelihood: 2, impact: 3, priority: 'LOW', confidence: 60,
    },
    {
      category: 'FATIGUE', title: 'Fatigue signals in rotating-shift roles', department: 'Clinical Operations',
      summary: 'Energy scores from daily check-ins are consistently lowest among staff working rotating shifts.',
      whyItMatters: 'Fatigue is a direct safety risk in clinical settings and compounds burnout and error rates.',
      worksafeContext: 'Fatigue from shift work is a named psychosocial (and physical safety) hazard — WorkSafe expects rostering and rest-period controls, not just individual coping strategies.',
      factors: ['Rapid shift rotation pattern', 'Inadequate rest between shifts', 'Limited fatigue management training'],
      score: 67, trend: 'STABLE', likelihood: 4, impact: 4, priority: 'HIGH', confidence: 77,
    },
    {
      category: 'SUPPORT', title: 'Manager support gap for new hires', department: undefined,
      summary: 'Employees in their first 90 days report the lowest "I feel supported by my manager" scores of any tenure band.',
      whyItMatters: 'Poor early support is one of the strongest predictors of early attrition and slows time-to-productivity.',
      worksafeContext: 'Lack of support is one of WorkSafe’s core psychosocial hazard categories — new hires are a recognised higher-risk group precisely because support structures often aren’t yet established for them.',
      factors: ['No structured onboarding check-ins', 'Manager caseloads increasing', 'Buddy programme inconsistently applied'],
      score: 44, trend: 'IMPROVING', likelihood: 2, impact: 2, priority: 'LOW', confidence: 58,
    },
    {
      category: 'ORGANISATIONAL_JUSTICE', title: 'Perceived inconsistency in performance decisions', department: undefined,
      summary: 'A cluster of open-text comments cite inconsistent application of performance and promotion criteria.',
      whyItMatters: 'Perceived unfairness strongly predicts disengagement and formal grievances if left unaddressed.',
      worksafeContext: 'Organisational justice (fairness of process and outcome) is one of the specific psychosocial factors named in WorkSafe’s guidance material on managing work-related psychological harm.',
      factors: ['No calibration process across managers', 'Promotion criteria not published', 'Limited transparency on decisions'],
      score: 50, trend: 'STABLE', likelihood: 2, impact: 3, priority: 'MEDIUM', confidence: 61,
    },
  ];

  for (const def of riskDefs) {
    const owner = pick(users.filter((u) => u.role !== 'EMPLOYEE'));
    const inherentScore = Math.min(100, Math.round(def.score + (def.trend === 'IMPROVING' ? 22 : 9)));
    const targetScore = Math.max(10, Math.round(def.score - 25));
    const residualScore = def.trend === 'IMPROVING' ? Math.round(def.score - 8) : null;

    const risk = await prisma.psychosocialRisk.create({
      data: {
        organizationId: org.id,
        category: def.category,
        domain: RISK_CATEGORY_DOMAIN[def.category] as WellbeingDomain,
        title: def.title,
        summary: def.summary,
        whyItMatters: def.whyItMatters,
        worksafeContext: def.worksafeContext,
        contributingFactors: def.factors,
        inherentScore,
        currentScore: def.score,
        residualScore: residualScore ?? undefined,
        targetScore,
        trend: def.trend,
        likelihood: def.likelihood,
        impact: def.impact,
        priority: def.priority,
        confidence: def.confidence,
        status: def.trend === 'IMPROVING' ? 'IN_PROGRESS' : 'MONITORING',
        ownerId: owner.id,
        departmentScope: def.department,
        evidenceSummary: `Based on ${randInt(30, 250)} check-in and survey responses over the last 90 days.`,
        nextReviewDate: daysAgo(-randInt(14, 60)),
      },
    });

    // Legacy score-over-time log (kept for backward compatibility)
    const weeks = 10;
    const drift = def.trend === 'WORSENING' ? -14 : def.trend === 'IMPROVING' ? 14 : 3;
    for (let w = weeks; w >= 0; w--) {
      const noise = randInt(-4, 4);
      const historicalScore = Math.min(100, Math.max(0, def.score + drift * (w / weeks) + noise));
      await prisma.riskHistoryPoint.create({
        data: { riskId: risk.id, score: Math.round(historicalScore), recordedAt: daysAgo(w * 7) },
      });
    }

    // Risk Journey — the append-only inherent/current/residual/target log
    await prisma.riskStateChange.create({
      data: { riskId: risk.id, stateType: 'INHERENT', score: inherentScore, recordedAt: daysAgo(180), evidenceType: 'MANUAL_ASSESSMENT', note: 'Initial assessment before any controls were in place.' },
    });
    for (let w = weeks; w >= 0; w--) {
      const noise = randInt(-4, 4);
      const historicalScore = Math.min(100, Math.max(0, def.score + drift * (w / weeks) + noise));
      await prisma.riskStateChange.create({
        data: { riskId: risk.id, stateType: 'CURRENT', score: Math.round(historicalScore), recordedAt: daysAgo(w * 7), evidenceType: 'SURVEY_RESULT' },
      });
    }
    await prisma.riskStateChange.create({
      data: { riskId: risk.id, stateType: 'TARGET', score: targetScore, recordedAt: daysAgo(180), evidenceType: 'MANUAL_ASSESSMENT', note: 'Organisational target set at initial assessment.' },
    });
    if (residualScore != null) {
      await prisma.riskStateChange.create({
        data: { riskId: risk.id, stateType: 'RESIDUAL', score: residualScore, recordedAt: daysAgo(14), evidenceType: 'ACTION_COMPLETED', note: 'Projected level once planned controls are fully in place.' },
      });
    }

    // Controls
    const controlCount = def.trend === 'WORSENING' ? randInt(0, 1) : randInt(1, 3);
    for (let c = 0; c < controlCount; c++) {
      await prisma.riskControl.create({
        data: {
          organizationId: org.id,
          riskId: risk.id,
          description: `${['Manager training', 'Policy update', 'Workload monitoring', 'Peer support programme'][c % 4]} targeting ${RISK_CATEGORY_DOMAIN[def.category]?.toLowerCase().replaceAll('_', ' ')}`,
          effectiveness: pick(['NOT_YET_ASSESSED', 'LOW', 'MEDIUM', 'HIGH'] as const),
          status: pick(['PLANNED', 'ACTIVE'] as const),
        },
      });
    }

    // Action plan
    const recs = await prisma.recommendation.createMany({ data: recommendationsFor(def.category, org.id, risk.id) });
    void recs;
    const createdRecs = await prisma.recommendation.findMany({ where: { riskId: risk.id } });
    for (const rec of createdRecs) {
      if (Math.random() > 0.4) continue;
      const actionOwner = pick(users.filter((u) => u.role !== 'EMPLOYEE'));
      await prisma.actionPlanItem.create({
        data: {
          organizationId: org.id,
          riskId: risk.id,
          recommendationId: rec.id,
          title: rec.title,
          description: rec.description,
          ownerId: actionOwner.id,
          dueDate: daysAgo(-randInt(7, 45)),
          priority: def.priority,
          status: pick(['NOT_STARTED', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED'] as const),
          expectedOutcome: rec.expectedImpact,
          progressPercent: pick([0, 20, 40, 60, 80, 100]),
          reviewDate: daysAgo(-randInt(30, 90)),
          residualRiskScore: targetScore + randInt(0, 10),
        },
      });
    }
  }
  console.log(`Seeded ${riskDefs.length} psychosocial risks with journey history, controls and action plans.`);

  // Speak Up reports
  const speakUpDefs = [
    { category: 'BULLYING', status: 'INVESTIGATING', department: 'Customer Support' },
    { category: 'PSYCHOLOGICAL_SAFETY', status: 'UNDER_REVIEW', department: 'Product' },
    { category: 'UNSAFE_BEHAVIOUR', status: 'ACTION_TAKEN', department: 'Facilities' },
    { category: 'WORKPLACE_ISSUE', status: 'RESOLVED', department: 'Finance' },
    { category: 'GENERAL_WELLBEING', status: 'SUBMITTED', department: 'Engineering' },
  ] as const;

  for (const def of speakUpDefs) {
    const report = await prisma.speakUpReport.create({
      data: {
        organizationId: org.id,
        trackingCode: `CHNL-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        category: def.category,
        status: def.status,
        description: 'Seeded demo report for platform walkthrough purposes.',
        departmentScope: def.department,
        isAnonymous: true,
      },
    });
    if (def.status !== 'SUBMITTED') {
      await prisma.speakUpMessage.create({
        data: { reportId: report.id, fromLeader: true, body: 'Thank you for your report. We have begun reviewing this and will update you here.' },
      });
    }
  }
  console.log('Seeded Speak Up reports.');

  // Learning resources
  await prisma.learningResource.createMany({
    data: [
      { organizationId: null, title: 'Foundations of Psychological Safety', type: 'GUIDE', domain: 'PSYCHOLOGICAL_SAFETY', summary: 'A practical guide to building team psychological safety.', durationMinutes: 15, relatedRiskCategories: ['PSYCHOLOGICAL_SAFETY'] },
      { organizationId: null, title: 'Recognising and Preventing Burnout', type: 'ARTICLE', domain: 'BURNOUT_BAT', summary: 'Evidence-based strategies for individuals and managers.', durationMinutes: 8, relatedRiskCategories: ['BURNOUT', 'FATIGUE'] },
      { organizationId: null, title: 'Resilient Leadership Workshop', type: 'WORKSHOP', domain: 'CULTURE_AND_LEADERSHIP', summary: 'A half-day workshop for people leaders on sustaining team resilience through change.', durationMinutes: 240, relatedRiskCategories: ['CHANGE_MANAGEMENT', 'LEADERSHIP'] },
      { organizationId: null, title: 'Healthy Workload Design Toolkit', type: 'TOOLKIT', domain: 'WORK_DESIGN', summary: 'Templates for auditing and redesigning team workload distribution.', durationMinutes: 30, relatedRiskCategories: ['WORK_DEMANDS', 'JOB_CONTROL'] },
      { organizationId: null, title: 'Inclusive Leadership Fundamentals', type: 'VIDEO', domain: 'DEI', summary: 'A short video series on inclusive decision-making for managers.', durationMinutes: 20, relatedRiskCategories: ['INCLUSION'] },
      { organizationId: null, title: 'Understanding Te Whare Tapa Whā', type: 'RESEARCH_SUMMARY', domain: 'TE_WHARE_TAPA_WHA', summary: 'An introduction to the four dimensions of hauora and their relevance to workplace wellbeing.', durationMinutes: 12, relatedRiskCategories: [] },
    ],
  });
  console.log('Seeded learning resources.');

  // Challenges
  const challengeDefs = [
    { name: 'Winter Steps Challenge', type: 'STEPS' as const, description: 'Track your daily steps and compete with your team.' },
    { name: 'Mindful Mornings', type: 'MINDFULNESS' as const, description: '10 minutes of mindfulness, five days a week.' },
    { name: 'Gratitude Week', type: 'GRATITUDE' as const, description: 'Share one thing you’re grateful for each day.' },
  ];
  for (const def of challengeDefs) {
    const challenge = await prisma.challenge.create({
      data: {
        organizationId: org.id,
        name: def.name,
        type: def.type,
        description: def.description,
        startsAt: daysAgo(21),
        endsAt: daysAgo(-7),
      },
    });
    const participants = users.filter(() => Math.random() > 0.7).slice(0, 20);
    for (const p of participants) {
      await prisma.challengeParticipant.create({
        data: { challengeId: challenge.id, userId: p.id, points: randInt(10, 500), streak: randInt(0, 21) },
      });
    }
  }
  console.log('Seeded team challenges.');

  // Activity feed backfill
  const activityTemplates: { type: 'CHECKIN_SUBMITTED' | 'PARTICIPATION_MILESTONE' | 'RISK_EMERGING' | 'RISK_IMPROVING' | 'CHALLENGE_ACTIVITY'; severity: 'INFO' | 'POSITIVE' | 'WARNING'; message: string }[] = [
    { type: 'CHECKIN_SUBMITTED', severity: 'INFO', message: 'New daily check-in submitted' },
    { type: 'PARTICIPATION_MILESTONE', severity: 'POSITIVE', message: 'Weekly participation crossed 70%' },
    { type: 'RISK_EMERGING', severity: 'WARNING', message: 'Workload pressure trending up in Engineering' },
    { type: 'RISK_IMPROVING', severity: 'POSITIVE', message: 'Role clarity improving in Facilities' },
    { type: 'CHALLENGE_ACTIVITY', severity: 'POSITIVE', message: 'Mindful Mornings reached 20 participants' },
  ];
  for (let i = 0; i < 25; i++) {
    const t = pick(activityTemplates);
    await prisma.activityEvent.create({
      data: { organizationId: org.id, type: t.type, severity: t.severity, message: t.message, createdAt: daysAgo(randInt(0, 14)) },
    });
  }
  console.log('Seeded activity feed backfill.');

  // Example connector installation, so the Integrations marketplace has something real to show
  const m365 = await prisma.connectorInstallation.create({
    data: {
      organizationId: org.id,
      provider: 'MICROSOFT_365',
      category: 'IDENTITY_SSO',
      status: 'CONNECTED',
      syncMode: 'SCHEDULED',
      config: { tenantDomain: 'auroragroup.example', features: ['sso', 'teams_notifications', 'outlook_calendar'] },
      connectedAt: daysAgo(30),
      lastSyncAt: daysAgo(0.2),
      lastSyncStatus: 'SUCCESS',
    },
  });
  await prisma.connectorSyncRun.create({
    data: {
      installationId: m365.id,
      trigger: 'SCHEDULED',
      status: 'SUCCESS',
      recordsProcessed: users.length,
      startedAt: daysAgo(0.2),
      completedAt: daysAgo(0.19),
    },
  });
  console.log('Seeded an example Microsoft 365 connector installation.');

  // Platform staff — the cross-tenant, chnnl-internal role. Separate identity space
  // entirely (platform schema), never an organisation-side role.
  const platformStaffPasswordHash = await bcrypt.hash(PLATFORM_STAFF_PASSWORD, 12);
  const staffDefs = [
    { email: 'staff-super@chnnl.internal', name: 'Kate Sullivan', role: 'SUPER_ADMIN' as const },
    { email: 'staff-safety@chnnl.internal', name: 'Marcus Webb', role: 'SAFETY_OFFICER' as const },
    { email: 'staff-support@chnnl.internal', name: 'Amina Yusuf', role: 'SUPPORT' as const },
  ];
  for (const staff of staffDefs) {
    await platformDb.platformStaffAccount.upsert({
      where: { email: staff.email },
      update: {},
      create: { email: staff.email, name: staff.name, role: staff.role, passwordHash: platformStaffPasswordHash },
    });
  }
  console.log('Seeded platform staff accounts.');

  console.log('\nDemo login (all tenant accounts share one password):');
  console.log(`  Password: ${DEMO_PASSWORD}`);
  for (const acc of namedAccounts) console.log(`  ${acc.role.padEnd(20)} ${acc.email}`);
  console.log('\nPlatform staff login (chnnl-internal, /platform/sign-in):');
  console.log(`  Password: ${PLATFORM_STAFF_PASSWORD}`);
  for (const staff of staffDefs) console.log(`  ${staff.role.padEnd(14)} ${staff.email}`);
}

function recommendationsFor(category: RiskCategory, organizationId: string, riskId: string) {
  const base = {
    organizationId,
    riskId,
  };
  const map: Record<string, { type: RecommendationType; title: string; description: string; expectedImpact: string; effortLevel: 'LOW' | 'MEDIUM' | 'HIGH' }[]> = {
    WORK_DEMANDS: [
      { type: 'WORK_REDESIGN', title: 'Audit sprint capacity vs. actual demand', description: 'Run a workload audit across the affected team and rebalance sprint commitments to match sustainable capacity.', expectedImpact: 'Reduces workload risk score by an estimated 10-15 points within one quarter.', effortLevel: 'MEDIUM' },
      { type: 'MANAGER_COACHING', title: 'Coach managers on saying no to scope creep', description: 'Equip managers with tools to push back on out-of-cycle requests and protect team focus time.', expectedImpact: 'Improves perceived job control and reduces after-hours work.', effortLevel: 'LOW' },
    ],
    BURNOUT: [
      { type: 'TEAM_INTERVENTION', title: 'Introduce protected recovery time after peak periods', description: 'Schedule guaranteed lower-intensity periods following high-volume weeks for frontline teams.', expectedImpact: 'Historically reduces exhaustion sub-scale scores by 0.4-0.6 points.', effortLevel: 'MEDIUM' },
      { type: 'PROCESS_IMPROVEMENT', title: 'Review shift and rostering patterns', description: 'Assess rest periods between shifts against fatigue management best practice.', expectedImpact: 'Reduces critical burnout risk classification within two quarters.', effortLevel: 'HIGH' },
    ],
    PSYCHOLOGICAL_SAFETY: [
      { type: 'PSYCH_SAFETY_INITIATIVE', title: 'Run team psychological safety workshops', description: 'Facilitate structured sessions using the Psychological Safety workshop to rebuild trust and normalise speaking up.', expectedImpact: 'Improves safety survey scores by 8-12 points in similar past interventions.', effortLevel: 'MEDIUM' },
      { type: 'LEADERSHIP_ACTION', title: 'Increase visible leadership availability', description: 'Introduce regular, informal leader office hours for the affected team.', expectedImpact: 'Rebuilds trust following leadership change.', effortLevel: 'LOW' },
    ],
    CHANGE_MANAGEMENT: [
      { type: 'COMMUNICATION', title: 'Publish a change FAQ and Q&A forum', description: 'Create a living document addressing common questions from the restructure with a channel for follow-up questions.', expectedImpact: 'Reduces uncertainty-driven anxiety in open-text feedback.', effortLevel: 'LOW' },
    ],
    ROLE_CLARITY: [
      { type: 'ROLE_CLARIFICATION', title: 'Refresh role descriptions and reporting lines', description: 'Update role documentation and confirm reporting lines with each employee individually.', expectedImpact: 'Improves role clarity scores and reduces duplicated effort.', effortLevel: 'MEDIUM' },
    ],
    RECOGNITION: [
      { type: 'RECOGNITION', title: 'Launch a peer recognition programme', description: 'Introduce a lightweight peer-to-peer recognition tool integrated into existing team rituals.', expectedImpact: 'Recognition sentiment typically improves within one quarter of launch.', effortLevel: 'LOW' },
    ],
    ISOLATION: [
      { type: 'TEAM_INTERVENTION', title: 'Introduce remote connection rituals', description: 'Establish regular informal virtual catch-ups and periodic in-person gatherings for remote-first staff.', expectedImpact: 'Improves social connection scores for remote employees.', effortLevel: 'LOW' },
    ],
    JOB_CONTROL: [
      { type: 'WORK_REDESIGN', title: 'Involve staff in rostering decisions', description: 'Pilot a self-select rostering model with structured guardrails in Clinical Operations.', expectedImpact: 'Increases perceived autonomy and reduces high-strain job classification.', effortLevel: 'HIGH' },
    ],
    INCLUSION: [
      { type: 'PSYCH_SAFETY_INITIATIVE', title: 'Expand inclusive leadership training', description: 'Roll out inclusive leadership training organisation-wide, prioritising people managers first.', expectedImpact: 'Closes the inclusion perception gap between seniority levels.', effortLevel: 'MEDIUM' },
    ],
    FATIGUE: [
      { type: 'PROCESS_IMPROVEMENT', title: 'Review shift rotation speed', description: 'Move from rapid to slow-rotating shift patterns in line with fatigue science guidance.', expectedImpact: 'Reduces fatigue-related safety incidents.', effortLevel: 'HIGH' },
    ],
    SUPPORT: [
      { type: 'MANAGER_COACHING', title: 'Structured 90-day onboarding check-ins', description: 'Mandate weekly manager check-ins for the first 90 days of employment.', expectedImpact: 'Improves early-tenure support scores and reduces early attrition.', effortLevel: 'LOW' },
    ],
    ORGANISATIONAL_JUSTICE: [
      { type: 'POLICY', title: 'Publish promotion and performance criteria', description: 'Make performance and promotion criteria transparent and run manager calibration sessions.', expectedImpact: 'Improves perceived fairness and reduces grievance risk.', effortLevel: 'MEDIUM' },
    ],
  };
  return (map[category] ?? []).map((r) => ({ ...base, ...r }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await identityDb.$disconnect();
    await platformDb.$disconnect();
  });
