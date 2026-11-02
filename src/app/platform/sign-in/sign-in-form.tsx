'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { platformSignInAction, type PlatformSignInState } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="secondary" className="mt-1">
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export function PlatformSignInForm() {
  const [state, formAction] = useFormState<PlatformSignInState, FormData>(platformSignInAction, null);

  return (
    <Card className="border-warning/40">
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold">Realtime staff sign in</CardTitle>
        <CardDescription>Internal only. This is a separate identity space from any customer organisation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Staff email</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
