import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';
import { isLeaderRole } from '@/lib/rbac';
import { PLATFORM_SESSION_COOKIE, verifyPlatformSessionToken } from '@/lib/platform/session';

// Middleware runs on the Edge runtime, so it uses the provider-less, Prisma/bcrypt-free
// auth config purely to read and validate the session JWT — the full config with the
// Credentials provider (auth.ts) only ever runs in the Node.js runtime.
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // /platform/* is a wholly separate, cross-tenant identity space — checked against its
  // own signed cookie, never the tenant Auth.js session above.
  if (pathname.startsWith('/platform')) {
    if (pathname.startsWith('/platform/sign-in')) return NextResponse.next();

    const token = req.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
    const payload = token ? await verifyPlatformSessionToken(token) : null;
    if (!payload) return NextResponse.redirect(new URL('/platform/sign-in', req.url));
    return NextResponse.next();
  }

  const session = req.auth;

  const isPublic =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/speak-up/submit') || // anonymous reporting entry point stays reachable unauthenticated
    pathname.startsWith('/privacy') ||
    pathname === '/';

  if (isPublic) return NextResponse.next();

  if (!session) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/leader') && !isLeaderRole(session.user.role)) {
    return NextResponse.redirect(new URL('/employee/home', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
