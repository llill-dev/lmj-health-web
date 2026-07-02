'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  isAwaitingAnyInitialQueryData,
} from '@/lib/query/queryUi';
import { mapEncounterSummaryFromApi } from '@/components/doctor/encounters/summary/map-encounter-summary-api';
import type { EncounterSummaryViewModel } from '@/components/doctor/encounters/summary/encounter-summary-types';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { normalizeEncounterOrdersList } from '@/lib/doctor/encounters/encounterOrderLoad';
import { loadEncounterPrescriptionsForSummary } from '@/lib/doctor/encounters/encounterPrescriptionLoad';
import { resolveEncounterSummaryPdfSource } from '@/lib/doctor/encounters/encounterSummaryPdf';
import type { EncounterDocumentLinkBody } from '@/lib/doctor/encounters/encounterDocumentsTypes';
import {
  normalizeEncounterOrderCategory,
} from '@/lib/doctor/encounters/encounterOrderCategories';

export function useDoctorEncounterSummary(
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
    recordsQuery,
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
        staleTime: 1000 * 30,
      },
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterSummary(
            doctorId,
            patientId,
            encounterId,
          ),
          'prescriptions',
        ],
        queryFn: async () => {
          const prescriptions = await loadEncounterPrescriptionsForSummary(
            doctorId,
            patientId,
            encounterId,
          );
          return { prescriptions, total: prescriptions.length };
        },
        enabled: isEnabled,
        staleTime: 1000 * 60,
      },
      {
        queryKey: [
          ...doctorPatientsQueryKeys.encounterSummary(
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
        staleTime: 1000 * 60,
      },
      {
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
        queryFn: () =>
          doctorApi.patients.getFullProfileResult(doctorId, patientId),
        enabled: isEnabled,
        retry: false,
        staleTime: 1000 * 30,
      },
      {
        queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
        queryFn: () => doctorApi.patients.getPublicProfile(patientId),
        enabled: isEnabled,
        staleTime: 1000 * 30,
      },
      {
        queryKey: doctorPatientsQueryKeys.medicalRecords(doctorId, patientId),
        queryFn: () =>
          doctorApi.patients.listMedicalRecords(doctorId, patientId),
        enabled: isEnabled,
        staleTime: 1000 * 30,
      },
    ],
  });

  const profileResult = profileQuery.data;
  const profile =
    profileResult && 'ok' in profileResult && profileResult.ok
      ? profileResult.data.patient
      : undefined;

  const encounterOrders = useMemo(
    () => normalizeEncounterOrdersList(ordersQuery.data),
    [ordersQuery.data],
  );

  const summary: EncounterSummaryViewModel | null = useMemo(() => {
    if (!encounterQuery.data?.encounter) return null;
    return mapEncounterSummaryFromApi({
      encounter: encounterQuery.data.encounter,
      profile,
      publicProfile: publicProfileQuery.data?.patient,
      prescriptions: prescriptionsQuery.data?.prescriptions ?? [],
      orders: encounterOrders,
      medicalRecords: recordsQuery.data?.records ?? [],
    });
  }, [
    encounterQuery.data?.encounter,
    profile,
    publicProfileQuery.data?.patient,
    prescriptionsQuery.data?.prescriptions,
    encounterOrders,
    recordsQuery.data?.records,
  ]);

  const exportPdfSource = useMemo(
    () =>
      resolveEncounterSummaryPdfSource({
        prescriptions: prescriptionsQuery.data?.prescriptions ?? [],
        orders: encounterOrders,
      }),
    [prescriptionsQuery.data?.prescriptions, encounterOrders],
  );

  const documentLinkCandidates = useMemo(() => {
    const candidates: Array<{
      label: string;
      body: EncounterDocumentLinkBody;
    }> = [];

    for (const prescription of prescriptionsQuery.data?.prescriptions ?? []) {
      if (!prescription._id) continue;
      candidates.push({
        label: 'وصفة',
        body: { sourceType: 'prescription', sourceId: prescription._id },
      });
    }

    for (const order of encounterOrders) {
      if (!order._id) continue;
      const category = normalizeEncounterOrderCategory(order);
      if (category === 'radiology') {
        candidates.push({
          label: 'طلب أشعة',
          body: { sourceType: 'imaging_order', sourceId: order._id },
        });
      } else if (category === 'lab' || category === 'procedure') {
        candidates.push({
          label: category === 'lab' ? 'طلب مختبر' : 'طلب إجراء',
          body: { sourceType: 'order', sourceId: order._id },
        });
      }
    }

    return candidates.filter(
      (candidate, index, array) =>
        array.findIndex(
          (item) =>
            item.body.sourceType === candidate.body.sourceType &&
            item.body.sourceId === candidate.body.sourceId,
        ) === index,
    );
  }, [encounterOrders, prescriptionsQuery.data?.prescriptions]);

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: prescriptionsQuery.data, isError: prescriptionsQuery.isError },
    { data: ordersQuery.data, isError: ordersQuery.isError },
    { data: publicProfileQuery.data, isError: publicProfileQuery.isError },
    { data: recordsQuery.data, isError: recordsQuery.isError },
  ]);

  const isError = encounterQuery.isError;
  const error = encounterQuery.error;

  return {
    summary,
    encounter: encounterQuery.data?.encounter,
    exportPdfSource,
    documentLinkCandidates,
    isAwaitingData,
    isError,
    error,
    profileDenied:
      profileResult && 'ok' in profileResult && profileResult.ok === false,
    refetch: () => {
      void encounterQuery.refetch();
      void prescriptionsQuery.refetch();
      void ordersQuery.refetch();
      void profileQuery.refetch();
      void publicProfileQuery.refetch();
      void recordsQuery.refetch();
    },
  };
}
