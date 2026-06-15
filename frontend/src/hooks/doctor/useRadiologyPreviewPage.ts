'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import { mapRadiologyPreviewVm } from '@/components/doctor/radiology/preview/map-radiology-preview';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { loadEncounterImagingOrderForPreview } from '@/lib/doctor/encounterImagingLoad';

export function useRadiologyPreviewPage(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const encounterQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.encounterDetail(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () =>
      doctorApi.patients.getEncounter(doctorId, patientId, encounterId),
    enabled: isEnabled,
  });

  const orderQuery = useQuery({
    queryKey: [
      ...doctorPatientsQueryKeys.encounterRadiologyOrder(
        doctorId,
        patientId,
        encounterId,
      ),
      'preview',
    ],
    queryFn: () =>
      loadEncounterImagingOrderForPreview(doctorId, patientId, encounterId),
    enabled: isEnabled,
  });

  const publicProfileQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
    queryFn: () => doctorApi.patients.getPublicProfile(patientId),
    enabled: isEnabled,
  });

  const previewVm = useMemo(() => {
    if (!orderQuery.data) return null;
    return mapRadiologyPreviewVm({
      order: orderQuery.data,
      encounter: encounterQuery.data?.encounter,
      publicProfile: publicProfileQuery.data?.patient,
    });
  }, [
    orderQuery.data,
    encounterQuery.data?.encounter,
    publicProfileQuery.data?.patient,
  ]);

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: orderQuery.data, isError: orderQuery.isError },
    { data: publicProfileQuery.data, isError: publicProfileQuery.isError },
  ]);

  return {
    previewVm,
    isAwaitingData,
    isError: orderQuery.isError || !orderQuery.data,
    error: orderQuery.error,
    refetch: () => {
      void encounterQuery.refetch();
      void orderQuery.refetch();
      void publicProfileQuery.refetch();
    },
  };
}
