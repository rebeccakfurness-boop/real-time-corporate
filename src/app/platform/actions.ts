'use server';

import { redirect } from 'next/navigation';
import { verifyStaffCredentials, requestBreakGlassUnlock, approveBreakGlassUnlock, denyBreakGlassUnlock, accessBreakGlassUnlock } from '@/lib/platform';
import { setPlatformSessionCookie, clearPlatformSessionCookie, getPlatformSession } from '@/lib/platform/session';

export type PlatformSignInState = { error?: string } | null;

export async function platformSignInAction(_prev: PlatformSignInState, formData: FormData): Promise<PlatformSignInState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const staff = await verifyStaffCredentials(email, password);
  if (!staff) return { error: 'Invalid email or password.' };

  await setPlatformSessionCookie({ staffId: staff.id, role: staff.role });
  redirect('/platform/dashboard');
}

export async function platformSignOutAction() {
  clearPlatformSessionCookie();
  redirect('/platform/sign-in');
}

export async function requestUnlockAction(input: { personId: string; organizationId: string; reason: string }) {
  const session = await getPlatformSession();
  if (!session) throw new Error('Unauthorized');

  await requestBreakGlassUnlock({
    personId: input.personId,
    organizationId: input.organizationId,
    reason: input.reason,
    requestedById: session.staffId,
  });
}

export async function approveUnlockAction(unlockId: string) {
  const session = await getPlatformSession();
  if (!session) throw new Error('Unauthorized');
  await approveBreakGlassUnlock(unlockId, session.staffId);
}

export async function denyUnlockAction(unlockId: string, reason: string) {
  const session = await getPlatformSession();
  if (!session) throw new Error('Unauthorized');
  await denyBreakGlassUnlock(unlockId, session.staffId, reason);
}

export async function accessUnlockAction(unlockId: string) {
  const session = await getPlatformSession();
  if (!session) throw new Error('Unauthorized');
  return accessBreakGlassUnlock(unlockId, session.staffId);
}
