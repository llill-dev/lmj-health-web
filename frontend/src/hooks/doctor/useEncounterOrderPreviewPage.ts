'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  ENCOUNTER_ORDER_CONFIG,
  type CatalogOrderCategory,
} from '@/components/doctor/encounters/orders/encounter-order-config';
import { mapRadiologyPreviewVm } from '@/components/doctor/radiology/preview/map-radiology-preview';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { loadEncounterOrderForPreview } from '@/lib/doctor/encounterOrderLoad';

export function useEncounterOrderPreviewPage(
  category: CatalogOrderCategory,
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const orderKeyBase =
    category === 'radiology'
      ? doctorPatientsQueryKeys.encounterRadiologyOrder(
          doctorId,
          patientId,
          encounterId,
        )
      : category === 'lab'
        ? doctorPatientsQueryKeys.encounterLabOrder(
            doctorId,
            patientId,
            encounterId,
          )
        : doctorPatientsQueryKeys.encounterProcedureOrder(
            doctorId,
            patientId,
            encounterId,
          );

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
    queryKey: [...orderKeyBase, 'preview'],
    queryFn: () =>
      loadEncounterOrderForPreview(
        doctorId,
        patientId,
        encounterId,
        category,
      ),
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

  return {
    config: ENCOUNTER_ORDER_CONFIG[category],
    previewVm,
    order: orderQuery.data,
    isLoading:
      encounterQuery.isLoading ||
      orderQuery.isLoading ||
      publicProfileQuery.isLoading,
    isError: orderQuery.isError || !orderQuery.data,
    error: orderQuery.error,
    refetch: () => {
      void encounterQuery.refetch();
      void orderQuery.refetch();
      void publicProfileQuery.refetch();
    },
  };
}
