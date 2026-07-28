import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ScoreDirection = 'up-is-good' | 'down-is-good';

export function ScoreCard({
  label,
  value,
  suffix = '',
  deltaPct,
  direction = 'up-is-good',
  interpretation,
  icon: Icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  deltaPct?: number;
  direction?: ScoreDirection;
  interpretation: string;
  icon: LucideIcon;
}) {
  const hasDelta = typeof deltaPct === 'number' && Math.abs(deltaPct) >= 0.5;
  const isGood = hasDelta ? (direction === 'up-is-good' ? deltaPct! > 0 : deltaPct! < 0) : null;

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">
            {value}
            {suffix}
          </span>
          {hasDelta && (
            <span
              className={cn(
                'mb-1 flex items-center gap-0.5 text-xs font-medium',
                isGood ? 'text-success' : 'text-destructive'
              )}
            >
              {deltaPct! > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(deltaPct!).toFixed(1)}%
            </span>
          )}
          {!hasDelta && (
            <span className="mb-1 flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
              <Minus className="h-3.5 w-3.5" /> flat
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{interpretation}</p>
      </CardContent>
    </Card>
  );
}
