'use client';

import useSWR from 'swr';

import { fetcherGet } from '@/lib/api/fetcher';
import { swrOptionsDoNotRefetch } from '@/lib/api/swrOptions';
import type { Dashboard } from '@/lib/dashboard';

const fetcher = fetcherGet<Dashboard>();

export function useDashboard() {
  return useSWR('/api/stats', fetcher, swrOptionsDoNotRefetch);
}
