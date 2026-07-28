import bcrypt from 'bcryptjs';
import { platformDb } from './db';
import { prisma } from '@/lib/prisma';
import { getIdentityByPersonId, type IdentityRecordDTO } from '@/lib/identity';

const UNLOCK_ACCESS_WINDOW_MINUTES = 15;

export interface PlatformStaffDTO {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'SAFETY_OFFICER';
}

export async function verifyStaffCredentials(email: string, password: string): Promise<PlatformStaffDTO | null> {
  const staff = await platformDb.platformStaffAccount.findUnique({ where: { email: email.toLowerCase() } });
  if (!staff || staff.status !== 'ACTIVE') return null;
  const valid = await bcrypt.compare(password, staff.passwordHash);
  if (!valid) return null;
  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}

export async function getStaffById(staffId: string): Promise<PlatformStaffDTO | null> {
  const staff = await platformDb.platformStaffAccount.findUnique({ where: { id: staffId } });
  if (!staff || staff.status !== 'ACTIVE') return null;
  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}

/** Cross-tenant organisation health/usage overview for the platform-owner dashboard.
 * Deliberately org-level only (headcount, participation, integration status) — never
 * individual wellbeing data. Reads "app" schema read-only via the chnnl_platform role. */
export async function listOrganisationsOverview() {
  const orgs = await platformDb.organization.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      planTier: true,
      createdAt: true,
      _count: { select: { people: true, risks: true, speakUpReports: true, connectorInstallations: true } },
    },
  });
  return orgs;
}

/** Pseudonymous person list for one organisation — role/department/status only, exactly
 * what that org's own leaders would see. No name/email; that only ever resolves through
 * an approved break-glass unlock. */
export async function listPseudonymousPeople(organizationId: string) {
  return platformDb.person.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      status: true,
      department: { select: { name: true } },
      location: { select: { name: true } },
    },
    take: 200,
  });
}

export async function getOrganisationById(organizationId: string) {
  return platformDb.organization.findUnique({ where: { id: organizationId } });
}

// ─────────────────────────────────────────────────────────────────────────
// Break-glass identity unlock — the safety-critical re-identification path.
// Two-person rule: requestedBy and approvedBy must always be different staff members.
// Time-boxed: once accessed, the unlock is only valid for UNLOCK_ACCESS_WINDOW_MINUTES.
// ─────────────────────────────────────────────────────────────────────────

export async function requestBreakGlassUnlock(input: {
  personId: string;
  organizationId: string;
  reason: string;
  requestedById: string;
}) {
  const unlock = await platformDb.breakGlassUnlock.create({
    data: {
      personId: input.personId,
      organizationId: input.organizationId,
      reason: input.reason,
      requestedById: input.requestedById,
      status: 'PENDING_APPROVAL',
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorType: 'PLATFORM_STAFF',
      action: 'break_glass.requested',
      targetType: 'Person',
      targetId: input.personId,
      metadata: { unlockId: unlock.id, requestedById: input.requestedById, reason: input.reason },
    },
  });

  return unlock;
}

export async function approveBreakGlassUnlock(unlockId: string, approvedById: string) {
  const unlock = await platformDb.breakGlassUnlock.findUnique({ where: { id: unlockId } });
  if (!unlock || unlock.status !== 'PENDING_APPROVAL') {
    throw new Error('Unlock request is not pending approval.');
  }
  if (unlock.requestedById === approvedById) {
    throw new Error('Two-person rule: the approver must be a different staff member from the requester.');
  }

  const updated = await platformDb.breakGlassUnlock.update({
    where: { id: unlockId },
    data: { status: 'APPROVED', approvedById, decidedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: unlock.organizationId,
      actorType: 'PLATFORM_STAFF',
      action: 'break_glass.approved',
      targetType: 'Person',
      targetId: unlock.personId,
      metadata: { unlockId, approvedById },
    },
  });

  return updated;
}

export async function denyBreakGlassUnlock(unlockId: string, deniedById: string, denialReason: string) {
  const unlock = await platformDb.breakGlassUnlock.findUnique({ where: { id: unlockId } });
  if (!unlock || unlock.status !== 'PENDING_APPROVAL') {
    throw new Error('Unlock request is not pending approval.');
  }

  const updated = await platformDb.breakGlassUnlock.update({
    where: { id: unlockId },
    data: { status: 'DENIED', approvedById: deniedById, decidedAt: new Date(), denialReason },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: unlock.organizationId,
      actorType: 'PLATFORM_STAFF',
      action: 'break_glass.denied',
      targetType: 'Person',
      targetId: unlock.personId,
      metadata: { unlockId, deniedById, denialReason },
    },
  });

  return updated;
}

/** Actually reveals the identity — only once, starting the time-boxed access window.
 * Requires an APPROVED unlock (i.e. a second staff member already signed off). */
export async function accessBreakGlassUnlock(
  unlockId: string,
  accessedById: string
): Promise<{ identity: IdentityRecordDTO; expiresAt: Date }> {
  const unlock = await platformDb.breakGlassUnlock.findUnique({ where: { id: unlockId } });
  if (!unlock || (unlock.status !== 'APPROVED' && unlock.status !== 'ACTIVE')) {
    throw new Error('Unlock has not been approved.');
  }

  const now = new Date();
  const expiresAt = unlock.expiresAt && unlock.status === 'ACTIVE' ? unlock.expiresAt : new Date(now.getTime() + UNLOCK_ACCESS_WINDOW_MINUTES * 60 * 1000);

  if (unlock.status === 'APPROVED') {
    await platformDb.breakGlassUnlock.update({
      where: { id: unlockId },
      data: { status: 'ACTIVE', accessedAt: now, expiresAt },
    });
  }

  if (expiresAt.getTime() < now.getTime()) {
    await platformDb.breakGlassUnlock.update({ where: { id: unlockId }, data: { status: 'EXPIRED' } });
    throw new Error('This unlock has expired.');
  }

  const identity = await getIdentityByPersonId(unlock.personId);
  if (!identity) throw new Error('No identity record found for this person.');

  await prisma.auditLog.create({
    data: {
      organizationId: unlock.organizationId,
      actorType: 'PLATFORM_STAFF',
      action: 'break_glass.identity_accessed',
      targetType: 'Person',
      targetId: unlock.personId,
      metadata: { unlockId, accessedById, expiresAt: expiresAt.toISOString() },
    },
  });

  return { identity, expiresAt };
}

export async function listBreakGlassUnlocks() {
  return platformDb.breakGlassUnlock.findMany({
    orderBy: { createdAt: 'desc' },
    include: { requestedBy: { select: { name: true } }, approvedBy: { select: { name: true } } },
    take: 100,
  });
}
