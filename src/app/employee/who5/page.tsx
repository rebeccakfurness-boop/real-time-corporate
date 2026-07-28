import { Who5Form } from './who5-form';

export default function Who5Page() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">WHO-5 Wellbeing Assessment</h1>
        <p className="text-sm text-muted-foreground">A short, validated wellbeing screening tool. Your individual answers are never shared with your manager or organisation.</p>
      </div>
      <Who5Form />
    </div>
  );
}
