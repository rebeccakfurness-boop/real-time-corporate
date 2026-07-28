import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { PlatformStaffRole } from '@prisma/client';

/**
 * A deliberately separate session mechanism from the tenant Auth.js session — see the
 * module doc comment at the top of prisma/schema.prisma. Platform staff are a structurally
 * distinct identity space (never an organisation-side role), so they get their own short-
 * lived, signed cookie rather than being shoehorned into the tenant PlatformRole session
 * shape. Same primitives as the rest of the app (jose for JWT, same pattern Auth.js itself
 * uses under the hood) — not a second auth *system*, just a second, appropriately-scoped
 * session for a genuinely separate identity.
 */

export const PLATFORM_SESSION_COOKIE = 'chnnl_platform_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 4; // 4 hours — shorter than tenant sessions, internal admin tool

export interface PlatformSessionPayload {
  staffId: string;
  role: PlatformStaffRole;
}

function getSecret() {
  const secret = process.env.PLATFORM_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) throw new Error('PLATFORM_AUTH_SECRET (or AUTH_SECRET) must be set');
  return new TextEncoder().encode(secret);
}

export async function createPlatformSessionToken(payload: PlatformSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyPlatformSessionToken(token: string): Promise<PlatformSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.staffId !== 'string' || typeof payload.role !== 'string') return null;
    return { staffId: payload.staffId, role: payload.role as PlatformStaffRole };
  } catch {
    return null;
  }
}

export async function setPlatformSessionCookie(payload: PlatformSessionPayload) {
  const token = await createPlatformSessionToken(payload);
  cookies().set(PLATFORM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/platform',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getPlatformSession(): Promise<PlatformSessionPayload | null> {
  const token = cookies().get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyPlatformSessionToken(token);
}

export function clearPlatformSessionCookie() {
  cookies().delete(PLATFORM_SESSION_COOKIE);
}
