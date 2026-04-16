'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminPatientSummary } from '@/lib/admin/types';

export function useAdminPatient(
  patientId?: string,
  initialPatient?: AdminPatientSummary | null,
) {
  // NOTE:
  // Backend currently exposes admin patient LIST + actions, but not a reliable
  // details endpoint in this environment. We intentionally avoid /admin/patients/:id
  // to prevent 404 noise and use list-based fallback for direct-link visits.

  const fallbackQuery = useQuery({
    queryKey: ['admin-patient', patientId, 'fallback-list'],
    queryFn: () =>
      adminApi.patients.list({
        search: patientId,
        includeDeleted: true,
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(patientId) && !initialPatient,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const patient = useMemo<AdminPatientSummary | null>(() => {
    if (initialPatient) return initialPatient;
    if (!patientId) return null;
    return (
      fallbackQuery.data?.patients?.find(
        (p) => p._id === patientId || p.publicId === patientId,
      ) ?? null
    );
  }, [fallbackQuery.data?.patients, initialPatient, patientId]);

  return {
    patient,
    isLoading: fallbackQuery.isLoading,
    error: fallbackQuery.error,
    refetch: async () => {
      await fallbackQuery.refetch();
    },
  };
}

