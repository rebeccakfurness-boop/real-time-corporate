'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ComplianceBarChart({
  data,
  dataKey,
  labelKey,
  labels,
  colors,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  labelKey: string;
  labels?: Record<string, string>;
  colors?: Record<string, string>;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey={labelKey}
          width={110}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v: string) => labels?.[v] ?? v.replaceAll('_', ' ')}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number) => [value, 'Risks']}
          labelFormatter={(v: string) => labels?.[v] ?? v.replaceAll('_', ' ')}
        />
        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
          {data.map((row, i) => (
            <Cell key={i} fill={colors?.[String(row[labelKey])] ?? 'hsl(var(--primary))'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
