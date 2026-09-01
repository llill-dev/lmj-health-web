'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import {
  getEncounterOrderConfig,
  type CatalogOrderCategory,
} from '@/components/doctor/encounters/orders/encounter-order-config';
import { mapRadiologyPreviewVm } from '@/components/doctor/radiology/preview/map-radiology-preview';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { loadEncounterOrderForPreview } from '@/lib/doctor/encounters/encounterOrderLoad';
import { useI18n } from '@/i18n/provider';

export function useEncounterOrderPreviewPage(
  category: CatalogOrderCategory,
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const { locale, t } = useI18n();
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
    staleTime: 1000 * 30,
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
    staleTime: 1000 * 30,
  });

  const publicProfileQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
    queryFn: () => doctorApi.patients.getPublicProfile(patientId),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  });

  const previewVm = useMemo(() => {
    if (!orderQuery.data) return null;
    return mapRadiologyPreviewVm({
      order: orderQuery.data,
      encounter: encounterQuery.data?.encounter,
      publicProfile: publicProfileQuery.data?.patient,
      locale,
      t,
    });
  }, [
    orderQuery.data,
    encounterQuery.data?.encounter,
    publicProfileQuery.data?.patient,
    locale,
    t,
  ]);

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: orderQuery.data, isError: orderQuery.isError },
    { data: publicProfileQuery.data, isError: publicProfileQuery.isError },
  ]);

  return {
    config: getEncounterOrderConfig(t)[category],
    previewVm,
    order: orderQuery.data,
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
