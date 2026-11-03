import type { OAuthScope } from './oauth-consent';

/** An app the person allowed to use their account over MCP (ADR 0004). */
export type OAuthGrant = {
  clientId: string;
  /** As the client registered it; may be missing or misleading. */
  clientName: string | null;
  clientUri: string | null;
  scopes: OAuthScope[];
  /** ISO time the app last signed in or refreshed its access. */
  lastUsedAt: string;
};
