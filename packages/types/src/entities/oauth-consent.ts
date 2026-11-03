/** Permissions an MCP client can ask for (ADR 0004). */
export type OAuthScope = 'habits:read' | 'habits:write';

/** What the consent page shows for a pending OAuth authorization. */
export type OAuthConsentRequest = {
  /** As the client registered it; may be missing or misleading. */
  clientName: string | null;
  clientUri: string | null;
  /** Host the person is sent back to after deciding. */
  redirectHost: string;
  scopes: OAuthScope[];
};

/** Where the browser goes next: the client's redirect URI with the result. */
export type OAuthConsentResult = {
  redirectTo: string;
};
