'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorAppointmentsApi,
  doctorAppointmentsQueryKeys,
  normalizeDoctorAppointmentToUi,
} from '@/lib/doctor/client';
import type {
  DoctorAppointmentListParams,
  DoctorBookAppointmentBody,
  DoctorCancelAppointmentBody,
  DoctorCompleteAppointmentBody,
  DoctorNoShowAppointmentBody,
  DoctorRescheduleAppointmentBody,
} from '@/lib/doctor/types';

export function useDoctorAppointmentsApi(params: DoctorAppointmentListParams) {
  const query = useQuery({
    queryKey: doctorAppointmentsQueryKeys.list(params),
    queryFn: () => doctorAppointmentsApi.list(params),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    appointments: (query.data?.appointments ?? []).map((appointment) =>
      normalizeDoctorAppointmentToUi(appointment),
    ),
    rawAppointments: query.data?.appointments ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 10,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
  };
}

export function useDoctorAppointmentDetailsApi(appointmentId: string) {
  const query = useQuery({
    queryKey: doctorAppointmentsQueryKeys.detail(appointmentId),
    queryFn: () => doctorAppointmentsApi.getById(appointmentId),
    enabled: Boolean(appointmentId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    appointment: query.data?.appointment
      ? normalizeDoctorAppointmentToUi(
          query.data.appointment,
          query.data.files ?? [],
        )
      : undefined,
    rawAppointment: query.data?.appointment,
    files: query.data?.files ?? [],
  };
}

function invalidateDoctorAppointments(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    queryKey: doctorAppointmentsQueryKeys.all,
  });
}

export function useBookDoctorAppointmentApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DoctorBookAppointmentBody) => doctorAppointmentsApi.book(body),
    onSuccess: () => invalidateDoctorAppointments(queryClient),
  });
}

export function useCancelDoctorAppointmentApi(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorCancelAppointmentBody;
    }) => doctorAppointmentsApi.cancel(id ?? appointmentId ?? '', body),
    onSuccess: (_, variables) => {
      invalidateDoctorAppointments(queryClient);
      if (variables.id ?? appointmentId) {
        queryClient.invalidateQueries({
          queryKey: doctorAppointmentsQueryKeys.detail(
            String(variables.id ?? appointmentId),
          ),
        });
      }
    },
  });
}

export function useRescheduleDoctorAppointmentApi(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorRescheduleAppointmentBody;
    }) => doctorAppointmentsApi.reschedule(id ?? appointmentId ?? '', body),
    onSuccess: (_, variables) => {
      invalidateDoctorAppointments(queryClient);
      if (variables.id ?? appointmentId) {
        queryClient.invalidateQueries({
          queryKey: doctorAppointmentsQueryKeys.detail(
            String(variables.id ?? appointmentId),
          ),
        });
      }
    },
  });
}

export function useCompleteDoctorAppointmentApi(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorCompleteAppointmentBody;
    }) => doctorAppointmentsApi.complete(id ?? appointmentId ?? '', body),
    onSuccess: (_, variables) => {
      invalidateDoctorAppointments(queryClient);
      if (variables.id ?? appointmentId) {
        queryClient.invalidateQueries({
          queryKey: doctorAppointmentsQueryKeys.detail(
            String(variables.id ?? appointmentId),
          ),
        });
      }
    },
  });
}

export function useNoShowDoctorAppointmentApi(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorNoShowAppointmentBody;
    }) => doctorAppointmentsApi.markNoShow(id ?? appointmentId ?? '', body),
    onSuccess: (_, variables) => {
      invalidateDoctorAppointments(queryClient);
      if (variables.id ?? appointmentId) {
        queryClient.invalidateQueries({
          queryKey: doctorAppointmentsQueryKeys.detail(
            String(variables.id ?? appointmentId),
          ),
        });
      }
    },
  });
}
