import { auth } from '@/lib/auth';
import { ShieldCheck } from 'lucide-react';
import { SpeakUpForm } from './speak-up-form';

export default async function SpeakUpSubmitPage({
  searchParams,
}: {
  searchParams: { org?: string };
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-b from-accent/40 to-background px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Speak Up</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            A confidential, anonymous way to raise concerns about bullying, harassment, unsafe behaviour or anything
            affecting psychological safety at work.
          </p>
        </div>
        <SpeakUpForm isAuthenticated={!!session} defaultOrgSlug={searchParams.org} />
      </div>
    </div>
  );
}
