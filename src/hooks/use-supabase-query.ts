// ============================================================
// useSupabaseQuery — React Query wrapper for Supabase data
// Handles loading, errors, and refetch with smart defaults.
// ============================================================

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'

/**
 * Standard query hook with 30s stale time and refetch on window focus.
 */
export function useSupabaseQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  opts?: Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error, T, string[]>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 30_000,          // 30s before considered stale
    refetchOnWindowFocus: true,
    retry: 1,
    ...opts,
  })
}

/**
 * Polling query — refetches every `intervalMs` while the component is mounted.
 */
export function usePollingQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  intervalMs = 5000,
  opts?: Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error, T, string[]>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: intervalMs / 2,
    refetchInterval: intervalMs,
    refetchOnWindowFocus: true,
    retry: 1,
    ...opts,
  })
}

/**
 * Mutation wrapper with automatic query invalidation.
 */
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  invalidateKeys?: string[][],
  opts?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  const qc = useQueryClient()
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (...args) => {
      invalidateKeys?.forEach(k => qc.invalidateQueries({ queryKey: k }))
      opts?.onSuccess?.(...args)
    },
    ...opts,
  })
}
