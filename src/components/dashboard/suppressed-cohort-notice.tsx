import { ShieldAlert } from 'lucide-react';

export function SuppressedCohortNotice({ respondentCount, reason }: { respondentCount: number; reason: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">This view is hidden to protect anonymity</p>
        <p className="text-warning-foreground/80">
          {reason} Only {respondentCount} {respondentCount === 1 ? 'person matches' : 'people match'} the current
          filters — broaden a filter (department, team, location or date range) to see this data again.
        </p>
      </div>
    </div>
  );
}
