/**
 * Minimum cohort size enforcement (k-anonymity) for every filterable breakdown shown to
 * organisation-side roles. If a filter combination would return data from fewer than the
 * organisation's configured threshold (Organization.kAnonymityThreshold, default 5), the
 * metric must be suppressed rather than shown — filtering a dashboard down far enough
 * effectively re-identifies someone even without a name attached, which is exactly what
 * Part C's identity separation is meant to prevent. Apply this to every dashboard,
 * register, matrix and report breakdown that groups by department/team/location/manager/
 * seniority/etc, not just top-level org scores.
 */

export const DEFAULT_K_ANONYMITY_THRESHOLD = 5;

export interface SuppressibleCohort {
  respondentCount: number;
}

export type KAnonymityResult<T> =
  | { suppressed: false; data: T }
  | { suppressed: true; respondentCount: number; reason: string };

/** Guards a single aggregate value/object behind the cohort-size check. */
export function applyKAnonymity<T>(
  respondentCount: number,
  data: T,
  threshold = DEFAULT_K_ANONYMITY_THRESHOLD
): KAnonymityResult<T> {
  if (respondentCount < threshold) {
    return {
      suppressed: true,
      respondentCount,
      reason: `Fewer than ${threshold} respondents in this view — hidden to protect individual anonymity.`,
    };
  }
  return { suppressed: false, data };
}

/** Filters a list of grouped breakdown rows (e.g. per-department scores), dropping any
 * whose cohort is below the threshold rather than displaying a re-identifiable sliver. */
export function suppressSmallCohorts<T extends SuppressibleCohort>(
  rows: T[],
  threshold = DEFAULT_K_ANONYMITY_THRESHOLD
): { visible: T[]; suppressedCount: number } {
  const visible = rows.filter((row) => row.respondentCount >= threshold);
  return { visible, suppressedCount: rows.length - visible.length };
}
