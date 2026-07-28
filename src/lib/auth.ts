import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { prisma } from '@/lib/prisma';
import { findIdentityByEmail } from '@/lib/identity';
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

        // Step 1: resolve credentials + PII from the identity-scoped store. This is the
        // one legitimate join point — a person authenticating as themselves — and it never
        // crosses into organisation-scoped queries.
        const identity = await findIdentityByEmail(email);
        if (!identity || !identity.passwordHash) return null;

        const validPassword = await bcrypt.compare(password, identity.passwordHash);
        if (!validPassword) return null;

        if (identity.mfaSecret) {
          if (!totp) return null;
          const validTotp = authenticator.check(totp, identity.mfaSecret);
          if (!validTotp) return null;
        }

        // Step 2: resolve tenant/role context from the pseudonymous Person record.
        const person = await prisma.person.findUnique({ where: { id: identity.personId } });
        if (!person || person.status !== 'ACTIVE') return null;

        await prisma.person.update({ where: { id: person.id }, data: { lastLoginAt: new Date() } });
        await prisma.auditLog.create({
          data: {
            organizationId: person.organizationId,
            userId: person.id,
            action: 'auth.sign_in',
            targetType: 'Person',
            targetId: person.id,
          },
        });

        return {
          id: person.id,
          email: identity.email,
          name: identity.name,
          image: identity.avatarUrl,
          organizationId: person.organizationId,
          role: person.role,
        };
      },
    }),
  ],
});
