import type {
  OAuthConsentDecisionDto,
  OAuthConsentRequest,
  OAuthConsentResult,
} from '@repo/types';

import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

/** The consent step of the MCP OAuth flow (ADR 0004). */
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
}
