import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SignInForm } from './sign-in-form';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Realtime</h1>
          <p className="text-sm text-muted-foreground">Psychological safety &amp; wellbeing intelligence</p>
        </div>

        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need to raise a concern anonymously?{' '}
          <a href="/speak-up/submit" className="font-medium text-primary hover:underline">
            Speak Up without signing in
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <a href="/privacy" className="hover:underline">
            How Realtime protects your privacy
          </a>
        </p>
      </div>
    </div>
  );
}
