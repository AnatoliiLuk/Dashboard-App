'use client';

import { ApiError } from '@repo/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginDto, RegisterDto } from '@repo/types';
import { useEffect, useSyncExternalStore } from 'react';

import { api } from '@/lib/api/client';
import { authKeys, completionKeys, habitKeys } from '@/lib/api/query-keys';
import {
  clearToken,
  getToken,
  setToken,
  subscribeToken,
} from '@/lib/api/token';

export function useAuthToken() {
  return useSyncExternalStore(subscribeToken, getToken, () => null);
}

/** False on the server / first hydrate; true once the client store is active. */
function useAuthReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useAuth() {
  const queryClient = useQueryClient();
  const token = useAuthToken();
  const isAuthReady = useAuthReady();
  const isAuthenticated = Boolean(token);

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.auth.me(),
    enabled: isAuthReady && isAuthenticated,
    retry: false,
  });

  // Stale JWT after DB wipe / deleted user — drop the session.
  useEffect(() => {
    if (!meQuery.isError) {
      return;
    }

    const error = meQuery.error;
    if (
      !(error instanceof ApiError) ||
      (error.status !== 401 && error.status !== 404)
    ) {
      return;
    }

    clearToken();
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: habitKeys.all });
    queryClient.removeQueries({ queryKey: completionKeys.all });
  }, [meQuery.isError, meQuery.error, queryClient]);

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => api.auth.login(dto),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => api.auth.register(dto),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });

  function logout() {
    clearToken();
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: habitKeys.all });
    queryClient.removeQueries({ queryKey: completionKeys.all });
  }

  return {
    isAuthReady,
    isAuthenticated,
    user: meQuery.data ?? null,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginMutation,
    registerMutation,
    logout,
  };
}
