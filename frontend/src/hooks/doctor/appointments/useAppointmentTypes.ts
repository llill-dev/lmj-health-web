'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, doctorAppointmentTypesQueryKeys } from '@/lib/doctor/client';
import type {
  CreateAppointmentTypeBody,
  UpdateAppointmentTypeBody,
} from '@/lib/doctor/types';
import { readAuthUser } from '@/lib/cookies';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

function getDoctorIdFromAuth(): string {
  const user = readAuthUser();
  return user?.actorIds?.doctorId ?? '';
}

/**
 * Hook to fetch available appointment types for booking
 * (patient-facing types with visible prices)
 */
export function useAvailableAppointmentTypes(doctorId?: string) {
  const actualDoctorId = doctorId || getDoctorIdFromAuth();

  const query = useQuery({
    queryKey: doctorAppointmentTypesQueryKeys.available(actualDoctorId),
    queryFn: () => doctorApi.appointmentTypes.getAvailableTypes(actualDoctorId),
    enabled: !!actualDoctorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    appointmentTypes: query.data?.appointmentTypes || [],
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch all appointment types for management
 * (doctor-facing, includes inactive types)
 */
export function useAppointmentTypes(doctorId?: string) {
  const actualDoctorId = doctorId || getDoctorIdFromAuth();

  const query = useQuery({
    queryKey: doctorAppointmentTypesQueryKeys.list(actualDoctorId),
    queryFn: () => doctorApi.appointmentTypes.listTypes(actualDoctorId),
    enabled: !!actualDoctorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    appointmentTypes: query.data?.appointmentTypes || [],
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to create a new appointment type
 */
export function useCreateAppointmentType() {
  const queryClient = useQueryClient();
  const doctorId = getDoctorIdFromAuth();

  const mutation = useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (data: CreateAppointmentTypeBody) =>
      doctorApi.appointmentTypes.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentTypesQueryKeys.all,
      });
    },
  });

  return {
    createType: mutation.mutate,
    createTypeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/**
 * Hook to update an appointment type
 */
export function useUpdateAppointmentType() {
  const queryClient = useQueryClient();
  const doctorId = getDoctorIdFromAuth();

  const mutation = useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      typeId,
      data,
    }: {
      typeId: string;
      data: UpdateAppointmentTypeBody;
    }) => doctorApi.appointmentTypes.updateType(typeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentTypesQueryKeys.all,
      });
    },
  });

  return {
    updateType: mutation.mutate,
    updateTypeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/**
 * Hook to delete an appointment type (soft delete)
 */
export function useDeleteAppointmentType() {
  const queryClient = useQueryClient();
  const doctorId = getDoctorIdFromAuth();

  const mutation = useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (typeId: string) =>
      doctorApi.appointmentTypes.deleteType(typeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentTypesQueryKeys.all,
      });
    },
  });

  return {
    deleteType: mutation.mutate,
    deleteTypeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
