import { ShieldAlert } from 'lucide-react';
import { PlatformSignInForm } from './sign-in-form';

export default function PlatformSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-warning/10 to-background px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Realtime Platform</h1>
          <p className="text-sm text-muted-foreground">Cross-tenant staff console</p>
        </div>
        <PlatformSignInForm />
      </div>
    </div>
  );
}
