'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assertPermission } from '@/lib/rbac';
import type { ReportType } from '@prisma/client';

const REPORT_TITLES: Record<ReportType, string> = {
  EXECUTIVE_SUMMARY: 'Executive Summary',
  ORGANISATION_HEALTH: 'Organisation Health Report',
  PSYCHOSOCIAL_RISK: 'Psychosocial Risk Report',
  PSYCHOLOGICAL_SAFETY: 'Psychological Safety Report',
  BOARD_REPORT: 'Board Report',
  CUSTOM: 'Custom Report',
};

export async function generateReportAction(type: ReportType) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  assertPermission(session.user.role, 'reports:generate');

  await prisma.report.create({
    data: {
      organizationId: session.user.organizationId,
      type,
      title: REPORT_TITLES[type],
      status: 'READY',
      generatedById: session.user.id,
    },
  });

  revalidatePath('/leader/reports');
}
