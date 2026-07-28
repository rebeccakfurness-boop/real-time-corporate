export const CONNECTOR_CATEGORY_LABELS: Record<string, string> = {
  IDENTITY_SSO: 'Identity & SSO',
  CALENDAR_EMAIL: 'Calendar & Email',
  HRIS: 'HRIS',
  PAYROLL: 'Payroll',
  LMS: 'Learning (LMS)',
  COLLABORATION: 'Collaboration',
  HEALTH_SAFETY: 'Health & Safety',
  BUSINESS_INTELLIGENCE: 'Business Intelligence',
  PROJECT_MANAGEMENT: 'Project Management',
  AI_PRODUCTIVITY: 'AI Productivity',
  WORKFLOW_AUTOMATION: 'Workflow Automation',
};

export const CONNECTOR_CATEGORY_ORDER = [
  'IDENTITY_SSO', 'HRIS', 'PAYROLL', 'LMS', 'COLLABORATION', 'HEALTH_SAFETY',
  'BUSINESS_INTELLIGENCE', 'PROJECT_MANAGEMENT', 'AI_PRODUCTIVITY', 'WORKFLOW_AUTOMATION', 'CALENDAR_EMAIL',
];
