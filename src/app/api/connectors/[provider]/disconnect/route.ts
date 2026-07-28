import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { disconnectInstallation } from '@/lib/data/connectors';
import type { ConnectorProvider } from '@prisma/client';

export async function POST(_request: Request, { params }: { params: { provider: string } }) {
  const session = await auth();
  if (!session || !can(session.user.role, 'integrations:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await disconnectInstallation(session.user.organizationId, params.provider as ConnectorProvider);
  return NextResponse.json({ ok: true });
}
