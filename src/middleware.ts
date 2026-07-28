import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';
import { isLeaderRole } from '@/lib/rbac';

// Middleware runs on the Edge runtime, so it uses the provider-less, Prisma/bcrypt-free
// auth config purely to read and validate the session JWT — the full config with the
// Credentials provider (auth.ts) only ever runs in the Node.js runtime.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/speak-up/submit') || // anonymous reporting entry point stays reachable unauthenticated
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
