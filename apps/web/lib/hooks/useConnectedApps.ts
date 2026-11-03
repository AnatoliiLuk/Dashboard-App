'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OAuthGrant } from '@repo/types';

import { api } from '@/lib/api/client';
import { oauthKeys } from '@/lib/api/query-keys';

/** MCP clients the person allowed on the consent page (ADR 0004). */
export function useConnectedApps() {
  return useQuery({
    queryKey: oauthKeys.grants,
    queryFn: () => api.oauth.listGrants(),
  });
}

export function useDisconnectApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => api.oauth.revokeGrant(clientId),
    // The app's tokens are gone; drop the row without a refetch.
    onSuccess: (_result, clientId) => {
      queryClient.setQueryData<OAuthGrant[]>(oauthKeys.grants, (grants) =>
        grants?.filter((grant) => grant.clientId !== clientId),
      );
    },
  });
}
