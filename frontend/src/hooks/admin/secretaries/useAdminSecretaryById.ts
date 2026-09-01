'use client';

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminSecretariesList } from '@/hooks/admin/secretaries/useAdminSecretaries';
import type { AdminSecretarySummary } from '@/lib/admin/types';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useAdminSecretaryById(
  secretaryId: string | undefined,
  t?: (key: string, paramsOrFallback?: Record<string, unknown> | string) => string,
) {
  const location = useLocation();
  const locationSecretary = (
    location.state as { secretary?: AdminSecretarySummary } | null
  )?.secretary;

  const listQuery = useAdminSecretariesList(
    secretaryId && !locationSecretary?.doctor
      ? { limit: 100 }
      : { limit: 1 },
  );

  const secretary = useMemo(() => {
    if (locationSecretary?._id === secretaryId) return locationSecretary;
    return listQuery.data?.secretaries.find((row) => row._id === secretaryId);
  }, [listQuery.data?.secretaries, locationSecretary, secretaryId]);

  const assignedDoctorId =
    secretary?.doctor?._id ?? secretary?.assignedDoctor ?? undefined;

  const doctorName =
    secretary?.doctor?.user?.fullName?.trim() ||
    (assignedDoctorId
      ? t
        ? t('admin.secretary.doctorFallbackWithId', { id: assignedDoctorId })
        : `طبيب (${assignedDoctorId})`
      : '—');

  return {
    secretary,
    assignedDoctorId,
    doctorName,
    secretaryName: secretary?.user?.fullName?.trim() ?? '—',
    isAwaitingData:
      !secretary &&
      isAwaitingInitialQueryData(listQuery.data, listQuery.isError),
    isError: listQuery.isError,
    refetch: listQuery.refetch,
  };
}
