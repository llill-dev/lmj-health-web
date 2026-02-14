'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Patient } from '@/lib/api/api';

export function usePatients(
  page = 1,
  limit = 10,
  search = '',
  status?: Patient['status'],
) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patients', page, limit, search, status],
    queryFn: () => api.getPatients(page, limit, search, status),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    patients: response?.data || [],
    total: response?.total || 0,
    currentPage: response?.page || page,
    totalPages: response?.totalPages || 0,
    isLoading,
    error,
    refetch,
    hasMore: response ? response.page < response.totalPages : false,
  };
}

export function usePatient(id: string) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.getPatientById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    patient: response?.data,
    isLoading,
    error,
  };
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (patientData: Omit<Patient, 'id'>) =>
      api.createPatient(patientData),
    onSuccess: (response) => {
      // Invalidate patients list to refresh
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Failed to create patient:', error);
    },
  });

  return {
    createPatient: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Patient> }) =>
      api.updatePatient(id, updates),
    onSuccess: (response, variables) => {
      // Invalidate specific patient and list
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Failed to update patient:', error);
    },
  });

  return {
    updatePatient: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.deletePatient(id),
    onSuccess: () => {
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Failed to delete patient:', error);
    },
  });

  return {
    deletePatient: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useUpdatePatientStatus() {
  const { updatePatient } = useUpdatePatient();

  return {
    updateStatus: (id: string, status: Patient['status']) =>
      updatePatient({ id, updates: { status } }),
  };
}
