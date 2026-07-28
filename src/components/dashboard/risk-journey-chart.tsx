'use client';

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface RiskStateChangePoint {
  stateType: 'INHERENT' | 'CURRENT' | 'RESIDUAL' | 'TARGET';
  score: number;
  recordedAt: string;
}

const STATE_COLOR: Record<RiskStateChangePoint['stateType'], string> = {
  INHERENT: 'hsl(var(--muted-foreground))',
  CURRENT: 'hsl(var(--destructive))',
  RESIDUAL: 'hsl(var(--warning))',
  TARGET: 'hsl(var(--success))',
};

const STATE_LABEL: Record<RiskStateChangePoint['stateType'], string> = {
  INHERENT: 'Inherent (before controls)',
  CURRENT: 'Current',
  RESIDUAL: 'Residual (with controls)',
  TARGET: 'Target',
};

/** Plots the four Risk Journey states over time from the append-only RiskStateChange log,
 * plus horizontal reference lines for target/inherent snapshot values when there isn't
 * enough history yet to draw a full line for them. */
export function RiskJourneyChart({
  stateChanges,
  targetScore,
  inherentScore,
}: {
  stateChanges: RiskStateChangePoint[];
  targetScore?: number | null;
  inherentScore?: number | null;
}) {
  if (stateChanges.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No risk journey history recorded yet.
      </div>
    );
  }

  const dates = [...new Set(stateChanges.map((s) => s.recordedAt.slice(0, 10)))].sort();
  const data = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const type of ['INHERENT', 'CURRENT', 'RESIDUAL', 'TARGET'] as const) {
      const point = stateChanges.find((s) => s.recordedAt.slice(0, 10) === date && s.stateType === type);
      if (point) row[type] = point.score;
    }
    return row;
  });

  const presentTypes = [...new Set(stateChanges.map((s) => s.stateType))];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(v: string) => new Date(v).toLocaleDateString()}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => STATE_LABEL[value as RiskStateChangePoint['stateType']] ?? value} />
        {presentTypes.map((type) => (
          <Line key={type} type="monotone" dataKey={type} stroke={STATE_COLOR[type]} strokeWidth={2} connectNulls dot={{ r: 3 }} />
        ))}
        {targetScore != null && !presentTypes.includes('TARGET') && (
          <ReferenceLine y={targetScore} stroke={STATE_COLOR.TARGET} strokeDasharray="4 4" label={{ value: 'Target', fontSize: 11, fill: STATE_COLOR.TARGET }} />
        )}
        {inherentScore != null && !presentTypes.includes('INHERENT') && (
          <ReferenceLine y={inherentScore} stroke={STATE_COLOR.INHERENT} strokeDasharray="4 4" label={{ value: 'Inherent', fontSize: 11, fill: STATE_COLOR.INHERENT }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
