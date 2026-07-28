import { prisma } from '@/lib/prisma';
import { createIdentity } from './index';
import type { EmploymentType, PlatformRole, SeniorityLevel } from '@prisma/client';

export interface ProvisionPersonInput {
  organizationId: string;
  email: string;
  name: string;
  passwordHash?: string;
  role?: PlatformRole;
  roleType?: string;
  seniority?: SeniorityLevel;
  employmentType?: EmploymentType;
  departmentId?: string;
  locationId?: string;
  workplaceGroupId?: string;
}

/**
 * Creates the pseudonymous Person row first (app schema), then the IdentityRecord that
 * references it (identity schema). Two writes, two Prisma clients, no transaction across
 * them — deliberate, since they're different databases-in-effect (different Postgres
 * roles); Person creation without an IdentityRecord fails obviously (no way to sign in),
 * which is an acceptable failure mode for this rare, admin-only path.
 */
export async function provisionPerson(input: ProvisionPersonInput) {
  const person = await prisma.person.create({
    data: {
      organizationId: input.organizationId,
      role: input.role ?? 'EMPLOYEE',
      roleType: input.roleType,
      seniority: input.seniority,
      employmentType: input.employmentType,
      departmentId: input.departmentId,
      locationId: input.locationId,
      workplaceGroupId: input.workplaceGroupId,
    },
  });

  await createIdentity({
    personId: person.id,
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
  });

  return person;
}
