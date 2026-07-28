import type { ConnectorCategory, ConnectorProvider, ConnectorInstallation } from '@prisma/client';

export interface SyncResult {
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

/**
 * The plugin interface every connector implements. New connectors are added purely by
 * registering a new ConnectorDefinition (see registry.ts) — nothing in the core platform
 * (data models, API routes, marketplace UI) needs to change. A connector that throws
 * during sync/webhook handling degrades gracefully: the failure is recorded on the
 * installation and surfaced in the UI, and never propagates to break check-ins,
 * dashboards, or any other core feature.
 */
export interface ConnectorDefinition {
  provider: ConnectorProvider;
  category: ConnectorCategory;
  displayName: string;
  description: string;
  /** false = the connector is listed in the marketplace with its real category/description
   * but has no runtime implementation yet ("coming soon"). */
  implemented: boolean;
  authType: 'oauth2' | 'api_key' | 'none';

  /** OAuth2 connectors only: build the provider's consent-screen URL. */
  getAuthorizeUrl?(params: { organizationId: string; state: string; redirectUri: string }): string;

  /** OAuth2 connectors only: exchange the callback code for tokens and return the
   * encrypted-credential payload plus any non-secret config to store. */
  handleOAuthCallback?(params: {
    organizationId: string;
    code: string;
    redirectUri: string;
  }): Promise<{ encryptedCredentials: string; config?: Record<string, unknown> }>;

  /** Pull/push data for a scheduled, manual, or realtime-triggered sync. */
  sync?(installation: ConnectorInstallation): Promise<SyncResult>;

  /** Handle an inbound webhook payload already persisted as a ConnectorWebhookEvent. */
  handleWebhook?(installation: ConnectorInstallation, payload: unknown): Promise<void>;
}
