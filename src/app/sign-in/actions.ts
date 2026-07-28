'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

export type SignInState = { error?: string } | null;

export async function signInAction(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get('email');
  const password = formData.get('password');
  const totp = formData.get('totp');
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  try {
    await signIn('credentials', {
      email,
      password,
      totp,
      redirectTo: callbackUrl,
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email, password, or authenticator code.' };
    }
    throw error;
  }
}
