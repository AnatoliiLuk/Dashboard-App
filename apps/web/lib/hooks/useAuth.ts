'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginDto, RegisterDto } from '@repo/types';
import { useSyncExternalStore } from 'react';

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

export function useAuth() {
  const queryClient = useQueryClient();
  const token = useAuthToken();
  const isAuthenticated = Boolean(token);

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.auth.me(),
    enabled: isAuthenticated,
  });

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
    token,
    isAuthenticated,
    user: meQuery.data ?? null,
    isLoadingUser: meQuery.isLoading,
    userError: meQuery.error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginMutation,
    registerMutation,
    logout,
  };
}
