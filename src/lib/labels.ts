export const RISK_CATEGORY_LABELS: Record<string, string> = {
  WORK_DEMANDS: 'Work Demands',
  ROLE_CLARITY: 'Role Clarity',
  LEADERSHIP: 'Leadership',
  RECOGNITION: 'Recognition',
  WORK_RELATIONSHIPS: 'Work Relationships',
  BULLYING: 'Bullying',
  HARASSMENT: 'Harassment',
  CHANGE_MANAGEMENT: 'Change Management',
  JOB_CONTROL: 'Job Control',
  SUPPORT: 'Support',
  INCLUSION: 'Inclusion',
  PSYCHOLOGICAL_SAFETY: 'Psychological Safety',
  FATIGUE: 'Fatigue',
  BURNOUT: 'Burnout',
  ISOLATION: 'Isolation',
  ORGANISATIONAL_JUSTICE: 'Organisational Justice',
};

export const DOMAIN_LABELS: Record<string, string> = {
  WORK_DESIGN: 'Work Design',
  CULTURE_AND_LEADERSHIP: 'Culture & Leadership',
  SOCIAL_CONNECTIONS: 'Social Connections',
  MANA_WHENUA: 'Mana Whenua',
  DEI: 'Diversity, Equity & Inclusion',
  PERSONAL_FACTORS: 'Personal Factors',
  PSYCHOLOGICAL_SAFETY: 'Psychological Safety',
  PSYCHOSOCIAL_RISK: 'Psychosocial Risk',
  BURNOUT_BAT: 'Burnout (BAT)',
  WHO5: 'WHO-5',
  TE_WHARE_TAPA_WHA: 'Te Whare Tapa Whā',
};

/** Which broad wellbeing domain each of the 16 psychosocial risk categories sits under. */
export const RISK_CATEGORY_DOMAIN: Record<string, string> = {
  WORK_DEMANDS: 'WORK_DESIGN',
  ROLE_CLARITY: 'WORK_DESIGN',
  JOB_CONTROL: 'WORK_DESIGN',
  FATIGUE: 'WORK_DESIGN',
  LEADERSHIP: 'CULTURE_AND_LEADERSHIP',
  RECOGNITION: 'CULTURE_AND_LEADERSHIP',
  CHANGE_MANAGEMENT: 'CULTURE_AND_LEADERSHIP',
  ORGANISATIONAL_JUSTICE: 'CULTURE_AND_LEADERSHIP',
  WORK_RELATIONSHIPS: 'SOCIAL_CONNECTIONS',
  ISOLATION: 'SOCIAL_CONNECTIONS',
  INCLUSION: 'DEI',
  BULLYING: 'PSYCHOLOGICAL_SAFETY',
  HARASSMENT: 'PSYCHOLOGICAL_SAFETY',
  SUPPORT: 'PSYCHOLOGICAL_SAFETY',
  PSYCHOLOGICAL_SAFETY: 'PSYCHOLOGICAL_SAFETY',
  BURNOUT: 'BURNOUT_BAT',
};

/** Plain-English framing only — never legal advice. Any risk-page copy citing HSWA/WorkSafe
 * guidance must read as descriptive context, not a compliance guarantee. */
export const WORKSAFE_DISCLAIMER =
  'This is general context on how WorkSafe New Zealand frames psychosocial hazards under the Health and Safety at Work Act 2015 (HSWA) — it is not legal advice. Talk to your health and safety advisor about your organisation’s specific obligations.';

export const PRIORITY_BADGE: Record<string, 'low' | 'moderate' | 'high' | 'critical'> = {
  LOW: 'low',
  MEDIUM: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const ROLE_LABELS: Record<string, string> = {
  ORG_OWNER: 'Organisation Owner',
  ORG_ADMIN: 'Organisation Admin',
  EXECUTIVE: 'Executive',
  PEOPLE_AND_CULTURE: 'People & Culture',
  HEALTH_AND_SAFETY: 'Health & Safety',
  DEPARTMENT_MANAGER: 'Department Manager',
  LEADER: 'Leader',
  EMPLOYEE: 'Employee',
};

export const SPEAK_UP_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  INVESTIGATING: 'Investigating',
  ACTION_TAKEN: 'Action Taken',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const ACTION_PLAN_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
};

export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  LEADERSHIP_ACTION: 'Leadership Action', POLICY: 'Policy', COMMUNICATION: 'Communication',
  MANAGER_COACHING: 'Manager Coaching', TEAM_INTERVENTION: 'Team Intervention', WORK_REDESIGN: 'Work Redesign',
  ROLE_CLARIFICATION: 'Role Clarification', RECOGNITION: 'Recognition', FLEXIBLE_WORK: 'Flexible Work',
  PROCESS_IMPROVEMENT: 'Process Improvement', PSYCH_SAFETY_INITIATIVE: 'Psychological Safety Initiative',
  WORKSHOP: 'Workshop', LEARNING_RESOURCE: 'Learning Resource',
};
