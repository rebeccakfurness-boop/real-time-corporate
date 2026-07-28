import type { Prisma, SeniorityLevel, EmploymentType, WellbeingDomain } from '@prisma/client';

export interface DashboardFilters {
  divisionId?: string;
  departmentId?: string;
  teamId?: string;
  locationId?: string;
  workplaceGroupId?: string;
  seniority?: SeniorityLevel;
  employmentType?: EmploymentType;
  roleType?: string;
  managerId?: string;
  domain?: WellbeingDomain;
  rangeDays: number;
}

const RANGE_PRESETS = [7, 30, 90, 180, 365];

export function parseDashboardFilters(sp: Record<string, string | string[] | undefined>): DashboardFilters {
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const rangeDays = Number(get('range')) || 30;

  return {
    divisionId: get('division') || undefined,
    departmentId: get('department') || undefined,
    teamId: get('team') || undefined,
    locationId: get('location') || undefined,
    workplaceGroupId: get('workplaceGroup') || undefined,
    seniority: (get('seniority') as SeniorityLevel) || undefined,
    employmentType: (get('employmentType') as EmploymentType) || undefined,
    roleType: get('roleType') || undefined,
    managerId: get('manager') || undefined,
    domain: (get('domain') as WellbeingDomain) || undefined,
    rangeDays: RANGE_PRESETS.includes(rangeDays) ? rangeDays : 30,
  };
}

/** Builds a Prisma User `where` clause (scoped to the tenant) from the active dashboard filters. */
export function buildUserWhere(organizationId: string, filters: DashboardFilters): Prisma.UserWhereInput {
  return {
    organizationId,
    status: 'ACTIVE',
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.divisionId && { department: { divisionId: filters.divisionId } }),
    ...(filters.locationId && { locationId: filters.locationId }),
    ...(filters.workplaceGroupId && { workplaceGroupId: filters.workplaceGroupId }),
    ...(filters.seniority && { seniority: filters.seniority }),
    ...(filters.employmentType && { employmentType: filters.employmentType }),
    ...(filters.roleType && { roleType: filters.roleType }),
    ...(filters.teamId && { teams: { some: { id: filters.teamId } } }),
    ...(filters.managerId && { teams: { some: { managerId: filters.managerId } } }),
  };
}
