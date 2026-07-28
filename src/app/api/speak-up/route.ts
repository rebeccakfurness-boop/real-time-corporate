import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { publishActivityEvent } from '@/lib/activity';
import { generateTrackingCode } from '@/lib/tracking-code';

const CATEGORIES = [
  'BULLYING', 'HARASSMENT', 'UNSAFE_BEHAVIOUR', 'PSYCHOLOGICAL_SAFETY', 'WORKPLACE_ISSUE', 'ETHICAL_CONCERN', 'GENERAL_WELLBEING',
] as const;

const bodySchema = z.object({
  organizationSlug: z.string().min(1).optional(),
  category: z.enum(CATEGORIES),
  description: z.string().min(20).max(5000),
  departmentScope: z.string().max(200).optional(),
  locationScope: z.string().max(200).optional(),
  identifyMe: z.boolean().default(false),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const session = await auth();
  const { organizationSlug, category, description, departmentScope, locationScope, identifyMe } = parsed.data;

  let organizationId = session?.user.organizationId;
  if (!organizationId) {
    if (!organizationSlug) return NextResponse.json({ error: 'Organisation code is required.' }, { status: 400 });
    const org = await prisma.organization.findUnique({ where: { slug: organizationSlug }, select: { id: true } });
    if (!org) return NextResponse.json({ error: 'We could not find that organisation code.' }, { status: 404 });
    organizationId = org.id;
  }

  const trackingCode = generateTrackingCode();
  const report = await prisma.speakUpReport.create({
    data: {
      organizationId,
      trackingCode,
      category,
      description,
      departmentScope,
      locationScope,
      isAnonymous: !(identifyMe && session),
      submittedById: identifyMe && session ? session.user.id : null,
    },
  });

  await publishActivityEvent({
    organizationId,
    type: 'SPEAK_UP_SUBMITTED',
    severity: 'WARNING',
    message: 'New anonymous Speak Up report received',
    departmentScope,
    locationScope,
  });

  return NextResponse.json({ trackingCode: report.trackingCode }, { status: 201 });
}
