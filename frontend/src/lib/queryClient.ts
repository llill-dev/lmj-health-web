import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import {
  getGlobalErrorToastOptions,
  notifyGlobalQueryError,
  shouldHandleMutationErrorGlobally,
  shouldHandleQueryErrorGlobally,
} from "@/lib/queryErrorHandling";

const DEFAULT_QUERY_STALE_MS = 15_000;
const DEFAULT_QUERY_GC_MS = 5 * 60_000;

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!shouldHandleQueryErrorGlobally(query)) return;
        notifyGlobalQueryError(
          error,
          getGlobalErrorToastOptions(query.meta, error),
        );
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!shouldHandleMutationErrorGlobally(mutation)) return;
        notifyGlobalQueryError(
          error,
          getGlobalErrorToastOptions(mutation.meta, error),
        );
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_MS,
        gcTime: DEFAULT_QUERY_GC_MS,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Shared React Query client for the SPA. */
export const queryClient = createAppQueryClient();
