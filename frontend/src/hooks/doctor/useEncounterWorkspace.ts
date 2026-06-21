'use client';

import { useQueries, type QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  isAwaitingAnyInitialQueryData,
  isAwaitingInitialQueryData,
} from '@/lib/query/queryUi';
import {
  mapEncounterWorkspacePatient,
  mapEncounterWorkspaceSections,
} from '@/components/doctor/encounters/workspace/map-encounter-workspace';
import type { EncounterWorkspaceSectionViewModel } from '@/components/doctor/encounters/workspace/encounter-workspace-types';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { normalizeEncounterOrdersList } from '@/lib/doctor/encounterOrderLoad';

const ENCOUNTER_WORKSPACE_STALE_MS = 1000 * 30;

export function prefetchEncounterWorkspace(
  queryClient: QueryClient,
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  if (!doctorId || !patientId || !encounterId) return;

  const staleTime = ENCOUNTER_WORKSPACE_STALE_MS;

  void queryClient.prefetchQuery({
    queryKey: doctorPatientsQueryKeys.encounterDetail(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () =>
      doctorApi.patients.getEncounter(doctorId, patientId, encounterId),
    staleTime,
  });

  void queryClient.prefetchQuery({
    queryKey: [
      ...doctorPatientsQueryKeys.encounterWorkspace(
        doctorId,
        patientId,
        encounterId,
      ),
      'prescriptions',
    ],
    queryFn: () =>
      doctorApi.patients.listEncounterPrescriptions(
        doctorId,
        patientId,
        encounterId,
        { limit: 100, page: 1 },
      ),
    staleTime,
  });

  void queryClient.prefetchQuery({
    queryKey: [
      ...doctorPatientsQueryKeys.encounterWorkspace(
        doctorId,
        patientId,
        encounterId,
      ),
      'orders',
    ],
    queryFn: () =>
      doctorApi.patients.listEncounterOrders(
        doctorId,
        patientId,
        encounterId,
        { limit: 100, page: 1 },
      ),
    staleTime,
  });
}

export function useEncounterWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const [
    encounterQuery,
    prescriptionsQuery,
    ordersQuery,
    profileQuery,
    publicProfileQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: doctorPatientsQueryKeys.encounterDetail(
          doctorId,
          patientId,
          encounterId,
        ),
        queryFn: () =>
          doctorApi.patients.getEncounter(doctorId, patientId, encounterId),
        enabled: isEnabled,
        staleTime: ENCOUNTER_WORKSPACE_STALE_MS,
      },
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterWorkspace(
            doctorId,
            patientId,
            encounterId,
          ),
          'prescriptions',
        ],
        queryFn: () =>
          doctorApi.patients.listEncounterPrescriptions(
            doctorId,
            patientId,
            encounterId,
            { limit: 100, page: 1 },
          ),
        enabled: isEnabled,
        staleTime: ENCOUNTER_WORKSPACE_STALE_MS,
      },
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterWorkspace(
            doctorId,
            patientId,
            encounterId,
          ),
          'orders',
        ],
        queryFn: () =>
          doctorApi.patients.listEncounterOrders(
            doctorId,
            patientId,
            encounterId,
            { limit: 100, page: 1 },
          ),
        enabled: isEnabled,
        staleTime: ENCOUNTER_WORKSPACE_STALE_MS,
      },
      {
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
        queryFn: () =>
          doctorApi.patients.getFullProfileResult(doctorId, patientId),
        enabled: isEnabled,
        retry: false,
        staleTime: ENCOUNTER_WORKSPACE_STALE_MS,
      },
      {
        queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
        queryFn: () => doctorApi.patients.getPublicProfile(patientId),
        enabled: isEnabled,
        staleTime: ENCOUNTER_WORKSPACE_STALE_MS,
      },
    ],
  });

  const profileResult = profileQuery.data;
  const profile =
    profileResult && 'ok' in profileResult && profileResult.ok
      ? profileResult.data.patient
      : undefined;

  const publicId =
    profile?.patientId ??
    profile?._id;

  const sections: EncounterWorkspaceSectionViewModel[] = useMemo(
    () =>
      mapEncounterWorkspaceSections({
        prescriptions: prescriptionsQuery.data?.prescriptions ?? [],
        orders: normalizeEncounterOrdersList(ordersQuery.data),
      }),
    [prescriptionsQuery.data?.prescriptions, ordersQuery.data],
  );

  const patientVm = useMemo(() => {
    if (!encounterQuery.data?.encounter) return null;
    return mapEncounterWorkspacePatient(
      encounterQuery.data.encounter,
      profile,
      publicId,
    );
  }, [encounterQuery.data?.encounter, profile, publicId]);

  /** يمنع عرض الصفحة — فقط تفاصيل الزيارة (الأساس) */
  const isAwaitingEncounterData = isAwaitingInitialQueryData(
    encounterQuery.data,
    encounterQuery.isError,
  );

  /** أقسام الوصفة والطلبات — تُعرض بـ skeleton بعد ظهور الهيكل */
  const isAwaitingSectionsData = isAwaitingAnyInitialQueryData([
    { data: prescriptionsQuery.data, isError: prescriptionsQuery.isError },
    { data: ordersQuery.data, isError: ordersQuery.isError },
  ]);

  const isAwaitingPatientEnrichment =
    (isAwaitingInitialQueryData(profileResult, profileQuery.isError) &&
      !profile) ||
    (isAwaitingInitialQueryData(
      publicProfileQuery.data,
      publicProfileQuery.isError,
    ) &&
      !publicId);

  return {
    encounter: encounterQuery.data?.encounter,
    sections,
    patientVm,
    profileDenied:
      profileResult && 'ok' in profileResult && profileResult.ok === false,
    isAwaitingEncounterData,
    isAwaitingSectionsData,
    isAwaitingPatientEnrichment,
    isError: encounterQuery.isError,
    error: encounterQuery.error,
    refetch: () => {
      void encounterQuery.refetch();
      void prescriptionsQuery.refetch();
      void ordersQuery.refetch();
      void profileQuery.refetch();
      void publicProfileQuery.refetch();
    },
  };
}
