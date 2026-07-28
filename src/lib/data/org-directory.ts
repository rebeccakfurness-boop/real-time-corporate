import { prisma } from '@/lib/prisma';
import { getIdentitiesByPersonIds } from '@/lib/identity';

export interface OrgDirectoryEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  departmentName: string | null;
  locationName: string | null;
}

/**
 * Administrative-only people directory (contact info to invite/manage accounts) —
 * gated on the 'org:manage_users' permission (ORG_ADMIN/ORG_OWNER only). Deliberately
 * separate from every wellbeing/risk data surface: this composes app-schema Person rows
 * with identity-schema names/emails for account administration, and must never be
 * rendered alongside wellbeing or risk scores.
 */
export async function listOrgDirectory(organizationId: string, take = 100): Promise<OrgDirectoryEntry[]> {
  const people = await prisma.person.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'asc' },
    include: { department: { select: { name: true } }, location: { select: { name: true } } },
    take,
  });

  const identities = await getIdentitiesByPersonIds(people.map((p) => p.id));

  return people.map((p) => ({
    id: p.id,
    name: identities.get(p.id)?.name ?? '(no identity record)',
    email: identities.get(p.id)?.email ?? '—',
    role: p.role,
    status: p.status,
    departmentName: p.department?.name ?? null,
    locationName: p.location?.name ?? null,
  }));
}
