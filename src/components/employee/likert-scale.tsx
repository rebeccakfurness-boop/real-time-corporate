'use client';

import { cn } from '@/lib/utils';

export function LikertScale({
  value,
  onChange,
  min = 1,
  max = 5,
  labels,
}: {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labels?: [string, string];
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex h-10 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors',
              value === opt
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {labels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}
