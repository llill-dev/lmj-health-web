"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import {
  doctorAppointmentsApi,
  doctorAppointmentsQueryKeys,
} from "@/lib/doctor/client";
import type {
  DoctorAppointmentListParams,
  DoctorBookAppointmentBody,
  DoctorCancelAppointmentBody,
  DoctorCompleteAppointmentBody,
  DoctorNoShowAppointmentBody,
  DoctorRescheduleAppointmentBody,
} from "@/lib/doctor/types";

export function useDoctorAppointmentsApi(
  params: DoctorAppointmentListParams,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorAppointmentsQueryKeys.list(params),
    queryFn: () => doctorAppointmentsApi.list(params),
    enabled,
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    appointments: query.data?.appointments ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 10,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
    isAwaitingData:
      enabled && isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorAppointmentDetailsApi(appointmentId: string) {
  const query = useQuery({
    queryKey: doctorAppointmentsQueryKeys.detail(appointmentId),
    queryFn: () => doctorAppointmentsApi.getById(appointmentId),
    enabled: Boolean(appointmentId),
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    appointment: query.data?.appointment,
    files: query.data?.files ?? [],
    isAwaitingData:
      Boolean(appointmentId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

function invalidateDoctorAppointments(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({
    queryKey: doctorAppointmentsQueryKeys.all,
  });
}

export function useBookDoctorAppointmentApi() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: DoctorBookAppointmentBody) =>
      doctorAppointmentsApi.book(body),
    onSuccess: () => invalidateDoctorAppointments(queryClient),
  });
}

export function useCancelDoctorAppointmentApi(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorCancelAppointmentBody;
    }) => doctorAppointmentsApi.cancel(id ?? appointmentId ?? "", body),
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorRescheduleAppointmentBody;
    }) => doctorAppointmentsApi.reschedule(id ?? appointmentId ?? "", body),
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorCompleteAppointmentBody;
    }) => doctorAppointmentsApi.complete(id ?? appointmentId ?? "", body),
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: DoctorNoShowAppointmentBody;
    }) => doctorAppointmentsApi.markNoShow(id ?? appointmentId ?? "", body),
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

export function useDoctorAppointmentFilesApi(
  appointmentId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorAppointmentsQueryKeys.files(appointmentId),
    queryFn: () => doctorAppointmentsApi.listFiles(appointmentId),
    enabled: enabled && Boolean(appointmentId),
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    files: query.data?.items ?? [],
    isAwaitingData:
      enabled &&
      Boolean(appointmentId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useUploadDoctorAppointmentFileApi(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({
      file,
      note,
      tags,
    }: {
      file: File;
      note?: string;
      tags?: string[];
    }) => doctorAppointmentsApi.uploadFile(appointmentId, file, note, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentsQueryKeys.files(appointmentId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentsQueryKeys.detail(appointmentId),
      });
    },
  });
}

export function useUnlinkDoctorAppointmentFileApi(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (fileId: string) =>
      doctorAppointmentsApi.unlinkFile(appointmentId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentsQueryKeys.files(appointmentId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorAppointmentsQueryKeys.detail(appointmentId),
      });
    },
  });
}
