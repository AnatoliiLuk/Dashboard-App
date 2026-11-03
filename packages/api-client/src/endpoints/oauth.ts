import type {
  OAuthConsentDecisionDto,
  OAuthConsentRequest,
  OAuthConsentResult,
  OAuthGrant,
} from '@repo/types';

import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

/** The consent step of the MCP OAuth flow and connected apps (ADR 0004). */
export class OAuthApi {
  constructor(private config: ApiClientConfig) {}

  getConsent(consentRequest: string): Promise<OAuthConsentRequest> {
    return request<OAuthConsentRequest>({
      ...this.config,
      method: 'GET',
      url: `/oauth/consent?request=${encodeURIComponent(consentRequest)}`,
    });
  }

  /** Returns the client redirect; the caller navigates the browser to it. */
  decideConsent(dto: OAuthConsentDecisionDto): Promise<OAuthConsentResult> {
    return request<OAuthConsentResult>({
      ...this.config,
      method: 'POST',
      url: '/oauth/consent',
      data: dto,
    });
  }

  listGrants(): Promise<OAuthGrant[]> {
    return request<OAuthGrant[]>({
      ...this.config,
      method: 'GET',
      url: '/oauth/grants',
    });
  }

  revokeGrant(clientId: string): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: `/oauth/grants/${encodeURIComponent(clientId)}`,
    });
  }
}
