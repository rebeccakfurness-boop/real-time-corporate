import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth.config';
import type { PlatformRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: PlatformRole;
      name: string;
      email: string;
      image?: string | null;
    };
  }
  interface User {
    organizationId: string;
    role: PlatformRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totp: { label: 'Authenticator code', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const totp = credentials?.totp as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.passwordHash || user.status !== 'ACTIVE') return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        if (user.mfaEnabled) {
          if (!totp || !user.mfaSecret) return null;
          const validTotp = authenticator.check(totp, user.mfaSecret);
          if (!validTotp) return null;
        }

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await prisma.auditLog.create({
          data: {
            organizationId: user.organizationId,
            userId: user.id,
            action: 'auth.sign_in',
            targetType: 'User',
            targetId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          organizationId: user.organizationId,
          role: user.role,
        };
      },
    }),
  ],
});
