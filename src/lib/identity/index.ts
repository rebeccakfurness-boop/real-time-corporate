import { identityDb } from './db';

/**
 * The narrow, intentional public surface for touching PII. Every export here is safe to
 * call from a legitimate self-service context (a person authenticating or reading their
 * own profile) or from the specific, gated flows Part C allows: the ORG_ADMIN people
 * directory (administrative contact info, never shown alongside wellbeing/risk data) and
 * the platform-owner break-glass unlock (src/lib/platform/*, only after an APPROVED,
 * ACTIVE BreakGlassUnlock is verified).
 *
 * There is no "get identity by role" or "search identities" function here on purpose —
 * every lookup requires already knowing the personId or email you're resolving, so this
 * module can never be used to browse or correlate wellbeing data back to a name.
 */

export interface IdentityRecordDTO {
  personId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  mfaSecret: string | null;
}

function toDTO(row: {
  personId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  mfaSecret: string | null;
}): IdentityRecordDTO {
  return row;
}

export async function findIdentityByEmail(email: string): Promise<IdentityRecordDTO | null> {
  const row = await identityDb.identityRecord.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toDTO(row) : null;
}

export async function getIdentityByPersonId(personId: string): Promise<IdentityRecordDTO | null> {
  const row = await identityDb.identityRecord.findUnique({ where: { personId } });
  return row ? toDTO(row) : null;
}

/** Batched lookup — used only to resolve display names for Persons already confirmed to
 * hold a leader-tier role (see src/lib/data/leader-names.ts). Never call this with
 * employee-tier person ids to render alongside their wellbeing data. */
export async function getIdentitiesByPersonIds(personIds: string[]): Promise<Map<string, IdentityRecordDTO>> {
  if (personIds.length === 0) return new Map();
  const rows = await identityDb.identityRecord.findMany({ where: { personId: { in: personIds } } });
  return new Map(rows.map((row) => [row.personId, toDTO(row)]));
}

export async function createIdentity(input: {
  personId: string;
  email: string;
  name: string;
  passwordHash?: string;
  avatarUrl?: string;
}): Promise<IdentityRecordDTO> {
  const row = await identityDb.identityRecord.create({
    data: {
      personId: input.personId,
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      avatarUrl: input.avatarUrl,
    },
  });
  return toDTO(row);
}

export async function setMfaSecret(personId: string, mfaSecret: string | null): Promise<void> {
  await identityDb.identityRecord.update({ where: { personId }, data: { mfaSecret } });
}

export async function updatePassword(personId: string, passwordHash: string): Promise<void> {
  await identityDb.identityRecord.update({ where: { personId }, data: { passwordHash } });
}
