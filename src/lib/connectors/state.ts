import { SignJWT, jwtVerify } from 'jose';

/** Short-lived signed state param for the OAuth authorize→callback round trip — binds the
 * callback back to the organisation and staff member who initiated it (CSRF protection). */

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET must be set');
  return new TextEncoder().encode(secret);
}

export async function signConnectorState(payload: { organizationId: string; provider: string }): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('10m').sign(getSecret());
}

export async function verifyConnectorState(token: string): Promise<{ organizationId: string; provider: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.organizationId !== 'string' || typeof payload.provider !== 'string') return null;
    return { organizationId: payload.organizationId, provider: payload.provider };
  } catch {
    return null;
  }
}
