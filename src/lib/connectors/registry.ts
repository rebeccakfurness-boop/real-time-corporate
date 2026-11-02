import type { ConnectorDefinition } from './types';
import { microsoft365Connector } from './providers/microsoft365';

/**
 * The connector registry — the single place a new integration is added. Everything else
 * (marketplace UI, install/sync/webhook routes, audit logging) is generic over this list.
 * Most entries are `implemented: false`: real category/description so the marketplace is
 * accurate, but no runtime — see the addendum's scoping decision (framework + Microsoft
 * 365 for real this pass; the rest as defined-but-not-yet-implemented connectors).
 */
const stub = (over: Omit<ConnectorDefinition, 'implemented' | 'authType'> & { authType?: ConnectorDefinition['authType'] }): ConnectorDefinition => ({
  authType: 'oauth2',
  ...over,
  implemented: false,
});

export const CONNECTOR_REGISTRY: Record<string, ConnectorDefinition> = {
  MICROSOFT_365: microsoft365Connector,

  GOOGLE_WORKSPACE: stub({
    provider: 'GOOGLE_WORKSPACE', category: 'IDENTITY_SSO', displayName: 'Google Workspace',
    description: 'Sign-In, Calendar, Gmail notifications, directory & group sync.',
  }),

  EMPLOYMENT_HERO: stub({
    provider: 'EMPLOYMENT_HERO', category: 'HRIS', displayName: 'Employment Hero',
    description: 'Sync employees, departments, managers, employment status and role types into the dashboard filter bar.',
  }),
  BAMBOOHR: stub({
    provider: 'BAMBOOHR', category: 'HRIS', displayName: 'BambooHR',
    description: 'Sync org structure, employment dates and job titles.',
  }),
  HIBOB: stub({
    provider: 'HIBOB', category: 'HRIS', displayName: 'HiBob',
    description: 'Sync org structure, employment dates and job titles.',
  }),
  WORKDAY: stub({
    provider: 'WORKDAY', category: 'HRIS', displayName: 'Workday',
    description: 'Enterprise HRIS sync: departments, managers, locations, employment status.',
  }),
  SAP_SUCCESSFACTORS: stub({
    provider: 'SAP_SUCCESSFACTORS', category: 'HRIS', displayName: 'SAP SuccessFactors',
    description: 'Enterprise HRIS sync: departments, managers, locations, employment status.',
  }),
  UKG: stub({
    provider: 'UKG', category: 'HRIS', displayName: 'UKG',
    description: 'Sync org structure and workforce data.',
  }),
  DAYFORCE: stub({
    provider: 'DAYFORCE', category: 'HRIS', displayName: 'Dayforce',
    description: 'Sync org structure and workforce data.',
  }),
  ADP: stub({
    provider: 'ADP', category: 'PAYROLL', displayName: 'ADP',
    description: 'Demographics, employment info and leave balances — context only, never feeds a wellbeing or risk score.',
  }),

  MOODLE: stub({
    provider: 'MOODLE', category: 'LMS', displayName: 'Moodle',
    description: 'Recommend learning, track completion, measure learning impact on wellbeing scores.',
  }),
  CORNERSTONE: stub({
    provider: 'CORNERSTONE', category: 'LMS', displayName: 'Cornerstone',
    description: 'Assign training and record certifications tied to risk recommendations.',
  }),
  DOCEBO: stub({
    provider: 'DOCEBO', category: 'LMS', displayName: 'Docebo',
    description: 'Assign training and record certifications tied to risk recommendations.',
  }),

  SLACK: stub({
    provider: 'SLACK', category: 'COLLABORATION', displayName: 'Slack',
    description: 'Daily prompts, challenge participation, survey reminders, leader alerts.',
  }),
  MS_TEAMS: stub({
    provider: 'MS_TEAMS', category: 'COLLABORATION', displayName: 'Microsoft Teams (notifications)',
    description: 'Check-in reminders, workshop invites, anonymous Speak Up entry point, leader risk notifications.',
  }),
  GOOGLE_CHAT: stub({
    provider: 'GOOGLE_CHAT', category: 'COLLABORATION', displayName: 'Google Chat',
    description: 'Daily prompts, challenge participation, survey reminders.',
  }),

  HEALTH_SAFETY_PLATFORM: stub({
    provider: 'HEALTH_SAFETY_PLATFORM', category: 'HEALTH_SAFETY', displayName: 'Health & Safety Platform',
    description: 'Incident management and hazard register integration — psychosocial risk alongside physical risk.',
  }),

  POWER_BI: stub({
    provider: 'POWER_BI', category: 'BUSINESS_INTELLIGENCE', displayName: 'Power BI',
    description: 'Export and live-connect Realtime data for enterprise BI reporting.',
  }),
  TABLEAU: stub({
    provider: 'TABLEAU', category: 'BUSINESS_INTELLIGENCE', displayName: 'Tableau',
    description: 'Export and live-connect Realtime data for enterprise BI reporting.',
  }),
  LOOKER: stub({
    provider: 'LOOKER', category: 'BUSINESS_INTELLIGENCE', displayName: 'Looker',
    description: 'Export and live-connect Realtime data for enterprise BI reporting.',
  }),

  MICROSOFT_PLANNER: stub({
    provider: 'MICROSOFT_PLANNER', category: 'PROJECT_MANAGEMENT', displayName: 'Microsoft Planner',
    description: 'Turn action plan items into tracked external tasks, synced back on owner/due date/status.',
  }),
  JIRA: stub({
    provider: 'JIRA', category: 'PROJECT_MANAGEMENT', displayName: 'Jira',
    description: 'Turn action plan items into tracked external tasks, synced back on owner/due date/status.',
  }),
  ASANA: stub({
    provider: 'ASANA', category: 'PROJECT_MANAGEMENT', displayName: 'Asana',
    description: 'Turn action plan items into tracked external tasks, synced back on owner/due date/status.',
  }),
  MONDAY: stub({
    provider: 'MONDAY', category: 'PROJECT_MANAGEMENT', displayName: 'Monday.com',
    description: 'Turn action plan items into tracked external tasks, synced back on owner/due date/status.',
  }),
  TRELLO: stub({
    provider: 'TRELLO', category: 'PROJECT_MANAGEMENT', displayName: 'Trello',
    description: 'Turn action plan items into tracked external tasks, synced back on owner/due date/status.',
  }),

  MICROSOFT_COPILOT: stub({
    provider: 'MICROSOFT_COPILOT', category: 'AI_PRODUCTIVITY', displayName: 'Microsoft Copilot',
    description: 'Natural-language querying of wellbeing/risk data, respecting RBAC. Future/stub.',
  }),
  CHATGPT_ENTERPRISE: stub({
    provider: 'CHATGPT_ENTERPRISE', category: 'AI_PRODUCTIVITY', displayName: 'ChatGPT Enterprise',
    description: 'Natural-language querying of wellbeing/risk data, respecting RBAC. Future/stub.',
  }),
  CLAUDE_ENTERPRISE: stub({
    provider: 'CLAUDE_ENTERPRISE', category: 'AI_PRODUCTIVITY', displayName: 'Claude Enterprise',
    description: 'Natural-language querying of wellbeing/risk data, respecting RBAC. Future/stub.',
  }),
  GEMINI: stub({
    provider: 'GEMINI', category: 'AI_PRODUCTIVITY', displayName: 'Gemini',
    description: 'Natural-language querying of wellbeing/risk data, respecting RBAC. Future/stub.',
  }),

  POWER_AUTOMATE: stub({
    provider: 'POWER_AUTOMATE', category: 'WORKFLOW_AUTOMATION', displayName: 'Power Automate',
    description: 'Rule-based automation on Realtime events — e.g. escalate a risk to a review task when it crosses High.',
  }),
  ZAPIER: stub({
    provider: 'ZAPIER', category: 'WORKFLOW_AUTOMATION', displayName: 'Zapier',
    description: 'Rule-based automation on Realtime events, built on the internal event system as just another subscriber.',
  }),
  MAKE: stub({
    provider: 'MAKE', category: 'WORKFLOW_AUTOMATION', displayName: 'Make',
    description: 'Rule-based automation on Realtime events, built on the internal event system as just another subscriber.',
  }),
};

export function getConnectorDefinition(provider: string): ConnectorDefinition | undefined {
  return CONNECTOR_REGISTRY[provider];
}

export function listConnectorDefinitions(): ConnectorDefinition[] {
  return Object.values(CONNECTOR_REGISTRY);
}
