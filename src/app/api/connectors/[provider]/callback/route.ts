import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import { verifyConnectorState } from '@/lib/connectors/state';
import { upsertConnectedInstallation } from '@/lib/data/connectors';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  const session = await auth();
  if (!session) return NextResponse.redirect(new URL('/sign-in', request.url));

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const providerError = url.searchParams.get('error_description') || url.searchParams.get('error');

  const integrationsUrl = new URL('/leader/integrations', request.url);

  if (providerError) {
    integrationsUrl.searchParams.set('error', providerError);
    return NextResponse.redirect(integrationsUrl);
  }

  if (!code || !state) {
    integrationsUrl.searchParams.set('error', 'Missing authorization code.');
    return NextResponse.redirect(integrationsUrl);
  }

  const statePayload = await verifyConnectorState(state);
  if (!statePayload || statePayload.organizationId !== session.user.organizationId || statePayload.provider !== params.provider) {
    integrationsUrl.searchParams.set('error', 'Invalid or expired authorization state.');
    return NextResponse.redirect(integrationsUrl);
  }

  const def = getConnectorDefinition(params.provider);
  if (!def?.handleOAuthCallback) {
    integrationsUrl.searchParams.set('error', 'This connector is not yet available.');
    return NextResponse.redirect(integrationsUrl);
  }

  try {
    const redirectUri = new URL(`/api/connectors/${params.provider}/callback`, request.url).toString();
    const { encryptedCredentials, config } = await def.handleOAuthCallback({
      organizationId: session.user.organizationId,
      code,
      redirectUri,
    });

    await upsertConnectedInstallation({
      organizationId: session.user.organizationId,
      provider: params.provider as never,
      encryptedCredentials,
      config,
      connectedById: session.user.id,
    });

    integrationsUrl.searchParams.set('connected', params.provider);
  } catch (error) {
    integrationsUrl.searchParams.set('error', error instanceof Error ? error.message : 'Connection failed.');
  }

  return NextResponse.redirect(integrationsUrl);
}
