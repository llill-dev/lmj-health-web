import { QueryClient } from "@tanstack/react-query";

const DEFAULT_QUERY_STALE_MS = 15_000;
const DEFAULT_QUERY_GC_MS = 5 * 60_000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_MS,
        gcTime: DEFAULT_QUERY_GC_MS,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}

/** Shared React Query client for the SPA. */
export const queryClient = createAppQueryClient();
