import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import { signConnectorState } from '@/lib/connectors/state';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  const session = await auth();
  if (!session || !can(session.user.role, 'integrations:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const def = getConnectorDefinition(params.provider);
  if (!def || !def.implemented || def.authType !== 'oauth2' || !def.getAuthorizeUrl) {
    return NextResponse.json({ error: 'This connector is not yet available.' }, { status: 400 });
  }

  const redirectUri = new URL(`/api/connectors/${params.provider}/callback`, request.url).toString();
  const state = await signConnectorState({ organizationId: session.user.organizationId, provider: params.provider });

  const authorizeUrl = def.getAuthorizeUrl({ organizationId: session.user.organizationId, state, redirectUri });
  return NextResponse.redirect(authorizeUrl);
}
