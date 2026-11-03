'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { OAuthConsentDecisionDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { oauthKeys } from '@/lib/api/query-keys';

/** The pending MCP authorization behind the consent page (ADR 0004). */
export function useOAuthConsent(request: string) {
  return useQuery({
    queryKey: oauthKeys.consent(request),
    queryFn: () => api.oauth.getConsent(request),
    enabled: Boolean(request),
    // An expired or edited request will not get better on retry.
    retry: false,
  });
}

export function useDecideConsent() {
  return useMutation({
    mutationFn: (dto: OAuthConsentDecisionDto) => api.oauth.decideConsent(dto),
  });
}
