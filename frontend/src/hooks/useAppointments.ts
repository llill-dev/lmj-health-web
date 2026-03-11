'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Appointment } from '@/lib/api/api';

export function useAppointments(
  page = 1,
  limit = 10,
  date?: string,
  status?: Appointment['status'],
  search?: string,
) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments', page, limit, date, status, search],
    queryFn: () => api.getAppointments(page, limit, date, status, search),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    appointments: response?.data || [],
    total: response?.total || 0,
    currentPage: response?.page || page,
    totalPages: response?.totalPages || 0,
    isLoading,
    error,
    refetch,
    hasMore: response ? response.page < response.totalPages : false,
  };
}

export function useAppointment(id: string) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.getAppointmentById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    appointment: response?.data,
    isLoading,
    error,
  };
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (appointmentData: Omit<Appointment, 'id'>) =>
      api.createAppointment(appointmentData),
    onSuccess: (response) => {
      // Invalidate appointments list to refresh
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    },
  });

  return {
    createAppointment: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Appointment['status'];
    }) => api.updateAppointmentStatus(id, status),
    onSuccess: (response, variables) => {
      // Invalidate specific appointment and list
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Failed to update appointment status:', error);
    },
  });

  return {
    updateStatus: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.cancelAppointment(id),
    onSuccess: () => {
      // Invalidate appointments list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to cancel appointment:', error);
    },
  });

  return {
    cancelAppointment: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.completeAppointment(id),
    onSuccess: () => {
      // Invalidate appointments list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to complete appointment:', error);
    },
  });

  return {
    completeAppointment: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
