import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RISK_CATEGORY_LABELS, PRIORITY_BADGE } from '@/lib/labels';
import type { RiskSummary } from '@/lib/data/dashboard';

const TREND_ICON = { WORSENING: ArrowUpRight, IMPROVING: ArrowDownRight, STABLE: Minus };

export function RiskList({ risks, emptyLabel }: { risks: RiskSummary[]; emptyLabel: string }) {
  if (risks.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {risks.map((risk) => {
        const TrendIcon = TREND_ICON[risk.trend as keyof typeof TREND_ICON] ?? Minus;
        return (
          <li key={risk.id}>
            <Link
              href={`/leader/risks/${risk.id}`}
              className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-secondary/40 rounded-md px-2 -mx-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{risk.title}</p>
                <p className="text-xs text-muted-foreground">
                  {RISK_CATEGORY_LABELS[risk.category] ?? risk.category}
                  {risk.departmentScope ? ` · ${risk.departmentScope}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <TrendIcon
                  className={
                    'h-3.5 w-3.5 ' +
                    (risk.trend === 'WORSENING' ? 'text-destructive' : risk.trend === 'IMPROVING' ? 'text-success' : 'text-muted-foreground')
                  }
                />
                <span className="w-9 text-right text-sm font-semibold tabular-nums">{Math.round(risk.currentScore)}</span>
                <Badge variant={PRIORITY_BADGE[risk.priority] ?? 'moderate'}>{risk.priority}</Badge>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
