'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type WorkSchedule } from '@/lib/api/api';

export function useWorkSchedule() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['work-schedule'],
    queryFn: () => api.getWorkSchedule(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    workSchedule: data?.data,
    isLoading,
    error,
    refetch,
  };
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: WorkSchedule) => api.updateWorkSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedule'] });
    },
  });

  return {
    updateWorkSchedule: mutation.mutate,
    updateWorkScheduleAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
