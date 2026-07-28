'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateReportAction } from './actions';
import type { ReportType } from '@prisma/client';

const REPORT_TYPES: { type: ReportType; title: string; description: string }[] = [
  { type: 'EXECUTIVE_SUMMARY', title: 'Executive Summary', description: 'One-page organisational overview with headline scores and priority actions.' },
  { type: 'ORGANISATION_HEALTH', title: 'Organisation Health', description: 'Full breakdown by department, team, location and seniority.' },
  { type: 'PSYCHOSOCIAL_RISK', title: 'Psychosocial Risk', description: 'Risk register, risk matrix, trends and recommended actions.' },
  { type: 'PSYCHOLOGICAL_SAFETY', title: 'Psychological Safety', description: 'Safety scores, trends and workshop recommendations.' },
  { type: 'BOARD_REPORT', title: 'Board Report', description: 'Governance-ready summary for Boards and H&S Committees.' },
];

export function ReportGenerator() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {REPORT_TYPES.map((r) => (
        <Card key={r.type}>
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-semibold">{r.title}</CardTitle>
            <CardDescription>{r.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(() => generateReportAction(r.type))}
            >
              Generate
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
