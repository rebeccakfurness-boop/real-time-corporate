import { prisma } from '@/lib/prisma';
import { getIdentitiesByPersonIds } from '@/lib/identity';
import { isLeaderRole } from '@/lib/rbac';

/**
 * Resolves display names for a set of Person ids, but ONLY for ids that hold a
 * leader-tier role (risk/action owners are always accountable managers/leaders, never the
 * employee whose wellbeing data is being protected). This is the one sanctioned path from
 * app-schema data to a name: leader-to-leader accountability visibility, never
 * leader-to-employee. Non-leader or unknown ids are simply omitted from the result map —
 * callers should fall back to "Unassigned" rather than guessing.
 */
export async function resolveLeaderDisplayNames(personIds: (string | null | undefined)[]): Promise<Map<string, string>> {
  const ids = [...new Set(personIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return new Map();

  const people = await prisma.person.findMany({
    where: { id: { in: ids } },
    select: { id: true, role: true },
  });
  const leaderIds = people.filter((p) => isLeaderRole(p.role)).map((p) => p.id);
  if (leaderIds.length === 0) return new Map();

  const identities = await getIdentitiesByPersonIds(leaderIds);
  return new Map(leaderIds.map((id) => [id, identities.get(id)?.name ?? 'Unassigned']));
}
