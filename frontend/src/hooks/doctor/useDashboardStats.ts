"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api_mock";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats: query.data?.data,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}
