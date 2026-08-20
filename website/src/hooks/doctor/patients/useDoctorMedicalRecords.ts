"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { doctorApi, doctorPatientsQueryKeys } from "@/lib/doctor/client";
import type {
  DoctorCreateMedicalRecordBody,
  DoctorUpdateMedicalRecordBody,
} from "@/lib/doctor/types";

export function useDoctorMedicalRecords(
  doctorId: string,
  patientId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.medicalRecords(doctorId, patientId),
    queryFn: () => doctorApi.patients.listMedicalRecords(doctorId, patientId),
    enabled: enabled && Boolean(doctorId) && Boolean(patientId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    records: query.data?.records ?? [],
    isAwaitingData:
      enabled &&
      Boolean(doctorId) &&
      Boolean(patientId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorMedicalRecord(
  doctorId: string,
  patientId: string,
  recordId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.medicalRecord(
      doctorId,
      patientId,
      recordId,
    ),
    queryFn: () =>
      doctorApi.patients.getMedicalRecord(doctorId, patientId, recordId),
    enabled:
      enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(recordId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    record: query.data?.record,
  };
}

export function useCreateDoctorMedicalRecord(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      body,
    }: {
      patientId: string;
      body: DoctorCreateMedicalRecordBody;
    }) => doctorApi.patients.createMedicalRecord(doctorId, patientId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.medicalRecords(
          doctorId,
          variables.patientId,
        ),
      });
    },
  });
}

export function useUpdateDoctorMedicalRecord(
  doctorId: string,
  patientId: string,
  recordId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DoctorUpdateMedicalRecordBody) =>
      doctorApi.patients.updateMedicalRecord(
        doctorId,
        patientId,
        recordId,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.medicalRecords(doctorId, patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.medicalRecord(
          doctorId,
          patientId,
          recordId,
        ),
      });
    },
  });
}
