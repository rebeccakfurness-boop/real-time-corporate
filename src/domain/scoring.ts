import type { BurnoutRiskBand } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────
// WHO-5 Well-Being Index
// Five items, each scored 0 (at no time) – 5 (all of the time).
// Raw score 0–25 is converted to a 0–100 percentage scale.
// A percentage score <= 50 is the standard screening threshold for further
// assessment (e.g. depression / low wellbeing screening) — it is a flag for
// follow-up, not a diagnosis.
// ─────────────────────────────────────────────────────────────────────────

export interface Who5Items {
  q1Cheerful: number;
  q2Calm: number;
  q3Active: number;
  q4RestedFresh: number;
  q5Interesting: number;
}

export interface Who5Score {
  rawScore: number;
  percentageScore: number;
  belowThreshold: boolean;
}

export function scoreWho5(items: Who5Items): Who5Score {
  const rawScore = items.q1Cheerful + items.q2Calm + items.q3Active + items.q4RestedFresh + items.q5Interesting;
  const percentageScore = rawScore * 4;
  return {
    rawScore,
    percentageScore,
    belowThreshold: percentageScore <= 50,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// BAT — Burnout Assessment Tool
// Four dimensions scored on a 1–5 Likert scale (never – always):
//   Exhaustion, Mental Distance (core burnout symptoms)
//   Cognitive Impairment, Emotional Impairment (secondary symptoms)
// Core burnout score = mean(exhaustion, mentalDistance)
// Secondary symptom score = mean(cognitiveImpairment, emotionalImpairment)
// Overall score = mean of all four dimensions.
// Risk bands follow the published BAT cut-off guidance (approximate):
//   < 2.59 Low · 2.59–3.02 Moderate · 3.03–3.53 High · >= 3.54 Critical
// ─────────────────────────────────────────────────────────────────────────

export interface BatDimensionScores {
  exhaustionScore: number;
  mentalDistanceScore: number;
  cognitiveImpairmentScore: number;
  emotionalImpairmentScore: number;
}

export interface BatScore extends BatDimensionScores {
  coreBurnoutScore: number;
  secondaryScore: number;
  overallScore: number;
  riskBand: BurnoutRiskBand;
}

const BAT_THRESHOLDS: { max: number; band: BurnoutRiskBand }[] = [
  { max: 2.58, band: 'LOW' },
  { max: 3.02, band: 'MODERATE' },
  { max: 3.53, band: 'HIGH' },
  { max: Infinity, band: 'CRITICAL' },
];

export function scoreBat(dimensions: BatDimensionScores): BatScore {
  const coreBurnoutScore = (dimensions.exhaustionScore + dimensions.mentalDistanceScore) / 2;
  const secondaryScore = (dimensions.cognitiveImpairmentScore + dimensions.emotionalImpairmentScore) / 2;
  const overallScore =
    (dimensions.exhaustionScore +
      dimensions.mentalDistanceScore +
      dimensions.cognitiveImpairmentScore +
      dimensions.emotionalImpairmentScore) /
    4;

  const riskBand = BAT_THRESHOLDS.find((t) => overallScore <= t.max)?.band ?? 'CRITICAL';

  return { ...dimensions, coreBurnoutScore, secondaryScore, overallScore, riskBand };
}

// ─────────────────────────────────────────────────────────────────────────
// Organisational aggregation helpers
// ─────────────────────────────────────────────────────────────────────────

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Normalises a 0-100-style score into a 0-100 "organisational health" contribution, higher is better. */
export function toHealthScale(percentage: number): number {
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

/** Inverts a risk-style score (higher = worse) into a health-style score (higher = better). */
export function invertRiskToHealth(riskScore0to100: number): number {
  return toHealthScale(100 - riskScore0to100);
}

export function participationRate(responded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((responded / total) * 100);
}
