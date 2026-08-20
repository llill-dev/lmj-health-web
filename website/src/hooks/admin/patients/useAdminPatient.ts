'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { ApiError } from '@/lib/api';
import type { AdminPatientSummary } from '@/lib/admin/types';

export function useAdminPatient(
  patientId?: string,
  initialPatient?: AdminPatientSummary | null,
) {
  const detailsQuery = useQuery({
    queryKey: ['admin-patient', patientId, 'details'],
    queryFn: () => adminApi.patients.getById(patientId as string),
    enabled: Boolean(patientId) && !initialPatient,
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });

  const fallbackQuery = useQuery({
    queryKey: ['admin-patient', patientId, 'fallback-list'],
    queryFn: () =>
      adminApi.patients.list({
        search: patientId,
        includeDeleted: true,
        page: 1,
        limit: 100,
      }),
    enabled:
      Boolean(patientId) &&
      !initialPatient &&
      detailsQuery.isError &&
      detailsQuery.error instanceof ApiError &&
      detailsQuery.error.status === 404,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const patient = useMemo<AdminPatientSummary | null>(() => {
    if (initialPatient) return initialPatient;
    if (!patientId) return null;
    if (detailsQuery.data?.patient) return detailsQuery.data.patient;
    return (
      fallbackQuery.data?.patients?.find(
        (p) => p._id === patientId || p.publicId === patientId,
      ) ?? null
    );
  }, [detailsQuery.data?.patient, fallbackQuery.data?.patients, initialPatient, patientId]);

  return {
    patient,
    isAwaitingData: initialPatient
      ? false
      : detailsQuery.isLoading ||
          (fallbackQuery.isFetching && !detailsQuery.data?.patient),
    error: detailsQuery.error ?? fallbackQuery.error,
    refetch: async () => {
      await detailsQuery.refetch();
      await fallbackQuery.refetch();
    },
  };
}

