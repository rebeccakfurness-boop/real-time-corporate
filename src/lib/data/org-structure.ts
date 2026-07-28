import { prisma } from '@/lib/prisma';
import type { FilterBarOptions } from '@/components/dashboard/filter-bar';

export async function getFilterBarOptions(organizationId: string): Promise<FilterBarOptions> {
  const [divisions, departments, teams, locations, workplaceGroups] = await Promise.all([
    prisma.division.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.department.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.team.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.location.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.workplaceGroup.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const toOptions = (rows: { id: string; name: string }[]) => rows.map((r) => ({ value: r.id, label: r.name }));

  return {
    divisions: toOptions(divisions),
    departments: toOptions(departments),
    teams: toOptions(teams),
    locations: toOptions(locations),
    workplaceGroups: toOptions(workplaceGroups),
  };
}
