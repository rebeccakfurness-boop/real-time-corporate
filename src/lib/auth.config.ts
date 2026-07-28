import type { NextAuthConfig } from 'next-auth';
import type { PlatformRole } from '@prisma/client';

/**
 * Edge-safe NextAuth config (no providers, no bcrypt/Prisma). Used by middleware for
 * session/route protection. The full config with the Credentials provider lives in
 * `auth.ts` and only runs in the Node.js runtime (API routes, server components).
 */
export const authConfig = {
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.organizationId = (user as { organizationId: string }).organizationId;
        token.role = (user as { role: PlatformRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      const appToken = token as unknown as { id: string; organizationId: string; role: PlatformRole };
      session.user.id = appToken.id;
      session.user.organizationId = appToken.organizationId;
      session.user.role = appToken.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
