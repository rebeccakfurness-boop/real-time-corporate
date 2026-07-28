'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function RiskHistoryChart({ data }: { data: { recordedAt: string; score: number }[] }) {
  if (data.length < 2) {
    return <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Not enough history yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="recordedAt"
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
        <Line type="monotone" dataKey="score" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
