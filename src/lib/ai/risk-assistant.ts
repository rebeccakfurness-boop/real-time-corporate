import { askClaude, isAiConfigured } from './client';
import { RISK_CATEGORY_LABELS, WORKSAFE_DISCLAIMER } from '@/lib/labels';
import type { PsychosocialRisk, RiskStateChange, ActionPlanItem, RiskControl } from '@prisma/client';
import type { OrganisationSnapshot, RiskSummary } from '@/lib/data/dashboard';

/**
 * The AI Risk Assistant. Operates only over already-aggregated risk/org data (never raw
 * check-ins, survey text, or anything that could narrate its way to an identifiable
 * individual) — the same k-anonymity-respecting data the rest of the leader dashboard
 * uses. With ANTHROPIC_API_KEY configured it asks Claude for a fluent answer grounded in
 * that data; without one, it falls back to a template response computed directly from
 * the numbers, so the feature is genuinely useful either way, not just a placeholder.
 */

export interface RiskAssistantContext {
  risk: PsychosocialRisk & { stateChanges: RiskStateChange[]; actionPlanItems: ActionPlanItem[]; controls: RiskControl[] };
}

export interface OrgAssistantContext {
  snapshot: OrganisationSnapshot;
  topRisks: RiskSummary[];
}

function riskContextBlock(ctx: RiskAssistantContext): string {
  const { risk } = ctx;
  return [
    `Risk: ${risk.title}`,
    `Category: ${RISK_CATEGORY_LABELS[risk.category] ?? risk.category}`,
    `Current score: ${Math.round(risk.currentScore)}/100 (higher = more risk), trend: ${risk.trend}`,
    risk.inherentScore != null ? `Inherent score (before controls): ${Math.round(risk.inherentScore)}` : null,
    risk.residualScore != null ? `Residual score (projected with controls): ${Math.round(risk.residualScore)}` : null,
    risk.targetScore != null ? `Target score: ${Math.round(risk.targetScore)}` : null,
    `Priority: ${risk.priority}, Likelihood: ${risk.likelihood}/5, Impact: ${risk.impact}/5, Confidence: ${risk.confidence}%`,
    `Status: ${risk.status}`,
    `Summary: ${risk.summary}`,
    `Why it matters: ${risk.whyItMatters}`,
    risk.contributingFactors.length ? `Contributing factors: ${risk.contributingFactors.join('; ')}` : null,
    `Controls in place: ${risk.controls.filter((c) => c.status === 'ACTIVE').length} active, ${risk.controls.length} total`,
    `Action plan items: ${risk.actionPlanItems.length} (${risk.actionPlanItems.filter((a) => a.status === 'COMPLETED').length} completed)`,
  ]
    .filter(Boolean)
    .join('\n');
}

function orgContextBlock(ctx: OrgAssistantContext): string {
  const { snapshot } = ctx;
  return [
    `Organisation wellbeing: ${snapshot.wellbeingScore}%`,
    `Organisation health: ${snapshot.organisationHealthScore}%`,
    `Burnout index: ${snapshot.burnoutIndex}%`,
    `Psychological safety: ${snapshot.psychologicalSafetyScore}%`,
    `Psychosocial risk: ${snapshot.psychosocialRiskScore}%`,
    `Participation rate: ${snapshot.participationRatePct}%, trend ${snapshot.engagementTrendPct > 0 ? '+' : ''}${snapshot.engagementTrendPct.toFixed(1)}pts`,
    `Active Speak Up cases: ${snapshot.activeSpeakUpCases}`,
    `Emerging (worsening) risks: ${snapshot.emergingRisks.map((r) => `${r.title} (${Math.round(r.currentScore)})`).join('; ') || 'none'}`,
    `High/critical priority risks: ${snapshot.highRiskAreas.map((r) => `${r.title} [${r.priority}]`).join('; ') || 'none'}`,
    `Trending improvements: ${snapshot.trendingImprovements.map((r) => r.title).join('; ') || 'none'}`,
  ].join('\n');
}

const SYSTEM_PROMPT = `You are the AI Risk Assistant inside Realtime, an enterprise psychosocial risk intelligence platform. \
You answer a leader's question using ONLY the aggregated data provided in the context — never invent scores, \
department names, or people. Never speculate about or reference any named individual — everything you discuss is \
at the organisation, department or risk-category level. Keep answers concise (3-6 sentences or a short bulleted \
list), practical, and written for a busy executive or Health & Safety lead. If asked about legal/compliance \
obligations, keep it descriptive (general context on how WorkSafe/HSWA frames psychosocial hazards), never \
legal advice, and note the person should confirm specifics with their H&S advisor.`;

export async function answerRiskQuestion(ctx: RiskAssistantContext, question: string): Promise<{ answer: string; source: 'ai' | 'template' }> {
  if (isAiConfigured()) {
    const answer = await askClaude(SYSTEM_PROMPT, `Context:\n${riskContextBlock(ctx)}\n\nQuestion: ${question}`);
    if (answer) return { answer, source: 'ai' };
  }
  return { answer: templateRiskAnswer(ctx, question), source: 'template' };
}

export async function answerOrgQuestion(ctx: OrgAssistantContext, question: string): Promise<{ answer: string; source: 'ai' | 'template' }> {
  if (isAiConfigured()) {
    const answer = await askClaude(SYSTEM_PROMPT, `Context:\n${orgContextBlock(ctx)}\n\nQuestion: ${question}`);
    if (answer) return { answer, source: 'ai' };
  }
  return { answer: templateOrgAnswer(ctx, question), source: 'template' };
}

function templateRiskAnswer({ risk }: RiskAssistantContext, question: string): string {
  const q = question.toLowerCase();
  const categoryLabel = RISK_CATEGORY_LABELS[risk.category] ?? risk.category;

  if (q.includes('why') && (q.includes('increas') || q.includes('worse') || q.includes('trend'))) {
    if (risk.trend === 'WORSENING') {
      return `${risk.title} is trending worse (currently ${Math.round(risk.currentScore)}/100). The most likely contributing factors on record are: ${risk.contributingFactors.slice(0, 3).join(', ') || 'not yet documented'}. ${risk.controls.filter((c) => c.status === 'ACTIVE').length === 0 ? 'No active controls are currently recorded for this risk, which is likely allowing it to continue unchecked.' : `${risk.controls.filter((c) => c.status === 'ACTIVE').length} control(s) are active but have not yet reversed the trend.`}`;
    }
    return `${risk.title} is currently ${risk.trend.toLowerCase()}, not worsening. Its score is ${Math.round(risk.currentScore)}/100 against a target of ${risk.targetScore ?? 'not set'}.`;
  }

  if (q.includes('board') || q.includes('summar')) {
    return `${risk.title} (${categoryLabel}, ${risk.priority} priority): ${risk.summary} Currently scored ${Math.round(risk.currentScore)}/100 and ${risk.trend.toLowerCase()}, against a target of ${risk.targetScore ?? 'not yet set'}. ${risk.actionPlanItems.length} action plan item(s) are in train, ${risk.actionPlanItems.filter((a) => a.status === 'COMPLETED').length} completed.`;
  }

  if (q.includes('health') && q.includes('safety') || q.includes('committee')) {
    const overdue = risk.actionPlanItems.filter((a) => a.status !== 'COMPLETED' && a.dueDate && a.dueDate < new Date());
    return `H&S Committee update — ${risk.title}: status is ${risk.status.replaceAll('_', ' ').toLowerCase()}, current score ${Math.round(risk.currentScore)}/100 (${risk.trend.toLowerCase()}). ${risk.controls.length} control(s) recorded, ${risk.controls.filter((c) => c.status === 'ACTIVE').length} active. ${overdue.length > 0 ? `${overdue.length} action item(s) are overdue and need attention.` : 'No overdue action items.'} ${WORKSAFE_DISCLAIMER}`;
  }

  return `${risk.title}: ${risk.summary} Current score ${Math.round(risk.currentScore)}/100, ${risk.trend.toLowerCase()}, ${risk.priority} priority. Ask a more specific question (e.g. "why has this increased?" or "summarise this for the board") for a more targeted answer.`;
}

function templateOrgAnswer({ snapshot, topRisks }: OrgAssistantContext, question: string): string {
  const q = question.toLowerCase();

  if (q.includes('changed') || q.includes('this month') || q.includes('this week')) {
    const direction = snapshot.engagementTrendPct >= 0 ? 'up' : 'down';
    return `Participation is ${direction} ${Math.abs(snapshot.engagementTrendPct).toFixed(1)} points vs. the prior period. ${snapshot.emergingRisks.length > 0 ? `${snapshot.emergingRisks.length} risk(s) are newly trending worse: ${snapshot.emergingRisks.map((r) => r.title).join(', ')}.` : 'No risks are currently trending worse.'} ${snapshot.trendingImprovements.length > 0 ? `${snapshot.trendingImprovements.length} are improving: ${snapshot.trendingImprovements.map((r) => r.title).join(', ')}.` : ''}`;
  }

  if (q.includes('department') && (q.includes('support') || q.includes('attention') || q.includes('need'))) {
    const withDept = topRisks.filter((r) => r.departmentScope);
    if (withDept.length === 0) return 'No department-attributed high-priority risks right now — current risks are organisation-wide.';
    return `Departments needing attention based on current high/critical risks: ${withDept.map((r) => `${r.departmentScope} (${RISK_CATEGORY_LABELS[r.category] ?? r.category}, score ${Math.round(r.currentScore)})`).join('; ')}.`;
  }

  if (q.includes('biggest') && q.includes('impact')) {
    const sorted = [...topRisks].sort((a, b) => b.currentScore - a.currentScore);
    return sorted.length
      ? `Addressing "${sorted[0]!.title}" would likely have the biggest impact — it's currently the highest-scoring risk at ${Math.round(sorted[0]!.currentScore)}/100.`
      : 'No high-priority risks currently on record.';
  }

  if (q.includes('board') || q.includes('one page') || q.includes('one-page')) {
    return `Organisation wellbeing is ${snapshot.wellbeingScore}%, organisation health ${snapshot.organisationHealthScore}%, burnout index ${snapshot.burnoutIndex}%, psychological safety ${snapshot.psychologicalSafetyScore}%. Participation is ${snapshot.participationRatePct}%. ${snapshot.highRiskAreas.length} risk(s) are currently high or critical priority${snapshot.highRiskAreas.length ? `: ${snapshot.highRiskAreas.map((r) => r.title).join(', ')}` : ''}. ${snapshot.activeSpeakUpCases} Speak Up case(s) remain open.`;
  }

  return `Organisation wellbeing is ${snapshot.wellbeingScore}%, with ${snapshot.highRiskAreas.length} high/critical priority risk(s) and ${snapshot.activeSpeakUpCases} open Speak Up case(s). Ask a more specific question (e.g. "what changed this month?" or "which departments need support?") for a more targeted answer.`;
}
