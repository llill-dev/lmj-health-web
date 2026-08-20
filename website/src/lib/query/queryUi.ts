/**
 * UI helpers that avoid React Query loading flags (isLoading / isFetching / isPending).
 * Prefer data presence + error state for initial empty views; keep cached data visible on refetch.
 */
export function isAwaitingInitialQueryData(
  data: unknown,
  isError: boolean,
): boolean {
  return data === undefined && !isError;
}

export function isAwaitingInitialQueryDataWithPlaceholder<T>(
  data: T | undefined,
  isError: boolean,
  placeholderData: T | undefined,
): boolean {
  if (isError) return false;
  if (data !== undefined) return false;
  return placeholderData === undefined;
}

export function isAwaitingAnyInitialQueryData(
  items: ReadonlyArray<{ data: unknown; isError: boolean }>,
): boolean {
  return items.some(({ data, isError }) =>
    isAwaitingInitialQueryData(data, isError),
  );
}

export function isAwaitingAnyQueryResults(
  queries: ReadonlyArray<{ data: unknown; isError: boolean }>,
): boolean {
  return queries.some((query) =>
    isAwaitingInitialQueryData(query.data, query.isError),
  );
}
