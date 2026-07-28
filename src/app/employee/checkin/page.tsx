import { CheckInForm } from './checkin-form';

export default function CheckInPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily check-in</h1>
        <p className="text-sm text-muted-foreground">This takes under a minute and is completely private to you.</p>
      </div>
      <CheckInForm />
    </div>
  );
}
