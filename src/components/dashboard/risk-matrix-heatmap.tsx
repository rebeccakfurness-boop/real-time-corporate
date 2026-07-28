'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RISK_CATEGORY_LABELS } from '@/lib/labels';

export interface MatrixRisk {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  currentScore: number;
  trend: string;
  confidence: number;
  priority: string;
}

function ratingBand(likelihood: number, impact: number): 'green' | 'yellow' | 'orange' | 'red' {
  const product = likelihood * impact;
  if (product >= 20) return 'red';
  if (product >= 12) return 'orange';
  if (product >= 6) return 'yellow';
  return 'green';
}

const BAND_CLASS: Record<string, string> = {
  green: 'bg-risk-low/15 hover:bg-risk-low/25',
  yellow: 'bg-risk-moderate/15 hover:bg-risk-moderate/25',
  orange: 'bg-risk-high/15 hover:bg-risk-high/25',
  red: 'bg-risk-critical/20 hover:bg-risk-critical/30',
};

const DOT_CLASS: Record<string, string> = {
  green: 'bg-risk-low',
  yellow: 'bg-risk-moderate',
  orange: 'bg-risk-high',
  red: 'bg-risk-critical',
};

/** Likelihood x Consequence heat map. Consequence (impact) descends top-to-bottom (5 at
 * top), Likelihood ascends left-to-right (1 to 5) — the conventional risk matrix layout.
 * Every point is clickable through to the risk detail page. */
export function RiskMatrixHeatmap({ risks }: { risks: MatrixRisk[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const impactLevels = [5, 4, 3, 2, 1];
  const likelihoodLevels = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <div className="flex w-10 shrink-0 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-medium text-muted-foreground">Consequence</span>
        </div>
        <div className="grid flex-1 grid-cols-5 gap-1">
          {impactLevels.map((impact) =>
            likelihoodLevels.map((likelihood) => {
              const cellRisks = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
              const band = ratingBand(likelihood, impact);
              return (
                <div
                  key={`${impact}-${likelihood}`}
                  className={cn('relative flex min-h-[72px] flex-wrap content-start gap-1 rounded-md p-1.5 transition-colors', BAND_CLASS[band])}
                >
                  {cellRisks.map((r) => (
                    <Link
                      key={r.id}
                      href={`/leader/risks/${r.id}`}
                      onMouseEnter={() => setHovered(r.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-sm ring-2 ring-white/60 transition-transform hover:scale-110',
                        DOT_CLASS[band]
                      )}
                      title={r.title}
                    >
                      {Math.round(r.currentScore)}
                    </Link>
                  ))}
                  {hovered && cellRisks.some((r) => r.id === hovered) && (
                    <div className="absolute left-1/2 top-full z-10 mt-1 w-56 -translate-x-1/2 rounded-md border border-border bg-popover p-2 text-xs shadow-md">
                      {(() => {
                        const r = cellRisks.find((rr) => rr.id === hovered)!;
                        return (
                          <>
                            <p className="font-medium">{r.title}</p>
                            <p className="text-muted-foreground">{RISK_CATEGORY_LABELS[r.category] ?? r.category}</p>
                            <p className="mt-1 text-muted-foreground">
                              Trend: {r.trend.toLowerCase()} · Confidence: {r.confidence}%
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex">
        <div className="w-10 shrink-0" />
        <div className="grid flex-1 grid-cols-5 gap-1">
          {likelihoodLevels.map((l) => (
            <div key={l} className="text-center text-xs text-muted-foreground">
              {l}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs font-medium text-muted-foreground">Likelihood</p>
    </div>
  );
}
