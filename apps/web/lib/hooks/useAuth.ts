'use client';

import { ApiError } from '@repo/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginDto, RegisterDto } from '@repo/types';
import { useEffect, useSyncExternalStore } from 'react';

import { api } from '@/lib/api/client';
import {
  authKeys,
  coachKeys,
  completionKeys,
  goalKeys,
  habitKeys,
} from '@/lib/api/query-keys';
import { getSignedIn, setSignedIn, subscribeSession } from '@/lib/api/session';

/** False on the server / first hydrate; true once the client store is active. */
function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useSignedIn() {
  return useSyncExternalStore(subscribeSession, getSignedIn, () => null);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const isClientReady = useClientReady();
  const signedIn = useSignedIn();
  const isAuthenticated = signedIn === true;
  const isAuthReady = isClientReady && signedIn !== null;

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => api.auth.me(signal),
    enabled: isClientReady && signedIn !== false,
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isSuccess) {
      return;
    }

    setSignedIn(true);
  }, [meQuery.isSuccess]);

  // A rejected session check means the cookie is missing or no longer valid.
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

    setSignedIn(false);
  }, [meQuery.isError, meQuery.error]);

  useEffect(() => {
    if (signedIn !== false) {
      return;
    }

    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: habitKeys.all });
    queryClient.removeQueries({ queryKey: completionKeys.all });
    queryClient.removeQueries({ queryKey: goalKeys.all });
    // The coach chat is personal; never show it to the next person.
    queryClient.removeQueries({ queryKey: coachKeys.conversation });
  }, [queryClient, signedIn]);

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => api.auth.login(dto),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.me });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user);
      setSignedIn(true);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => api.auth.register(dto),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.me });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user);
      setSignedIn(true);
    },
  });

  function logout() {
    setSignedIn(false);
    void api.auth.logout();
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
