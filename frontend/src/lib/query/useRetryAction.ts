import { useCallback, useState } from 'react';

/**
 * Local retry busy state — use instead of React Query `isFetching` on error retry buttons.
 */
export function useRetryAction(refetch: () => Promise<unknown>) {
  const [retrying, setRetrying] = useState(false);

  const retry = useCallback(async () => {
    setRetrying(true);
    try {
      await refetch();
    } finally {
      setRetrying(false);
    }
  }, [refetch]);

  return { retry, retrying };
}
