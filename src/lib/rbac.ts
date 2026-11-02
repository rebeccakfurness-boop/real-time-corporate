import type { PlatformRole } from '@prisma/client';

/**
 * Data scope each role is entitled to see. Every query in the data-access layer
 * must be narrowed by both organizationId (tenant isolation) and, for non-org-wide
 * roles, by the scope below (own team / own department) — never by role name alone.
 *
 * Note: PlatformRole is entirely org-scoped, even ORG_OWNER — it never spans tenants.
 * Realtime's own cross-tenant staff are a structurally separate concept: see
 * PlatformStaffAccount / src/lib/platform/*.
 */
export type DataScope = 'ORGANISATION' | 'DEPARTMENT' | 'TEAM' | 'SELF';

export const ROLE_SCOPE: Record<PlatformRole, DataScope> = {
  ORG_OWNER: 'ORGANISATION',
  ORG_ADMIN: 'ORGANISATION',
  EXECUTIVE: 'ORGANISATION',
  PEOPLE_AND_CULTURE: 'ORGANISATION',
  HEALTH_AND_SAFETY: 'ORGANISATION',
  DEPARTMENT_MANAGER: 'DEPARTMENT',
  LEADER: 'TEAM',
  EMPLOYEE: 'SELF',
};

export const LEADER_ROLES: PlatformRole[] = [
  'ORG_OWNER',
  'ORG_ADMIN',
  'EXECUTIVE',
  'PEOPLE_AND_CULTURE',
  'HEALTH_AND_SAFETY',
  'DEPARTMENT_MANAGER',
  'LEADER',
];

export type Permission =
  | 'dashboard:view'
  | 'risks:view'
  | 'risks:manage'
  | 'compliance:view'
  | 'speakup:view_deidentified'
  | 'speakup:manage_cases'
  | 'reports:generate'
  | 'reports:board_export'
  | 'org:manage_users'
  | 'org:manage_settings'
  | 'integrations:manage'
  | 'employee:checkin'
  | 'employee:speakup_submit';

const ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  ORG_OWNER: [
    'dashboard:view', 'risks:view', 'risks:manage', 'compliance:view', 'speakup:view_deidentified', 'speakup:manage_cases',
    'reports:generate', 'reports:board_export', 'org:manage_users', 'org:manage_settings', 'integrations:manage',
  ],
  ORG_ADMIN: [
    'dashboard:view', 'risks:view', 'risks:manage', 'compliance:view', 'speakup:view_deidentified', 'speakup:manage_cases',
    'reports:generate', 'reports:board_export', 'org:manage_users', 'org:manage_settings', 'integrations:manage',
  ],
  EXECUTIVE: ['dashboard:view', 'risks:view', 'compliance:view', 'speakup:view_deidentified', 'reports:generate', 'reports:board_export'],
  PEOPLE_AND_CULTURE: ['dashboard:view', 'risks:view', 'risks:manage', 'speakup:view_deidentified', 'speakup:manage_cases', 'reports:generate', 'reports:board_export'],
  HEALTH_AND_SAFETY: ['dashboard:view', 'risks:view', 'risks:manage', 'compliance:view', 'speakup:view_deidentified', 'speakup:manage_cases', 'reports:generate', 'reports:board_export'],
  DEPARTMENT_MANAGER: ['dashboard:view', 'risks:view', 'reports:generate'],
  LEADER: ['dashboard:view', 'risks:view', 'reports:generate'],
  EMPLOYEE: ['employee:checkin', 'employee:speakup_submit'],
};

export function can(role: PlatformRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isLeaderRole(role: PlatformRole): boolean {
  return LEADER_ROLES.includes(role);
}

export function assertPermission(role: PlatformRole, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: role ${role} lacks permission ${permission}`);
  }
}
