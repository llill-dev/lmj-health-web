import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  isAwaitingAnyQueryResults,
  isAwaitingInitialQueryData,
} from '@/lib/query/queryUi';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import {
  buildEncounterRef,
  mapEncounterDraftToHubRow,
  mapPrescriptionToHubRow,
  matchesPrescriptionHubSearch,
  resolvePrescriptionHubFacilityLabel,
  type PrescriptionHubEncounterRef,
  type PrescriptionHubRowVm,
} from '@/components/doctor/prescription/hub';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { useDoctorPatients } from '@/hooks/doctor/patients/useDoctorPatients';
import { useDoctorProfile } from '@/hooks/doctor/profile/useDoctorProfile';
import { useI18n } from '@/i18n/provider';

const MAX_PATIENTS = 100;
const MAX_ENCOUNTERS_PER_PATIENT = 20;
const MAX_ENCOUNTERS_FOR_PRESCRIPTIONS = 80;

export type PrescriptionsHubFilters = {
  search: string;
  page: number;
  limit: number;
};

function sortEncounterRefs(refs: PrescriptionHubEncounterRef[]) {
  return [...refs].sort((a, b) => {
    const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function sortRows(rows: PrescriptionHubRowVm[]) {
  return [...rows].sort((a, b) => {
    const aTime = a.sortAt ? new Date(a.sortAt).getTime() : 0;
    const bTime = b.sortAt ? new Date(b.sortAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function useDoctorPrescriptionsHub(
  doctorId: string,
  filters: PrescriptionsHubFilters,
) {
  const { t } = useI18n();
  const patientsQuery = useDoctorPatients({
    page: 1,
    limit: MAX_PATIENTS,
  });
  const profileQuery = useDoctorProfile();

  const patients = patientsQuery.patients;

  const encounterQueries = useQueries({
    queries: patients.map((patient) => ({
      queryKey: doctorPatientsQueryKeys.encounters(doctorId, patient._id, {
        page: 1,
        limit: MAX_ENCOUNTERS_PER_PATIENT,
        sortBy: 'startedAt',
        sortOrder: 'desc',
      }),
      queryFn: () =>
        doctorApi.patients.listEncounters(doctorId, patient._id, {
          page: 1,
          limit: MAX_ENCOUNTERS_PER_PATIENT,
          sortBy: 'startedAt',
          sortOrder: 'desc',
        }),
      enabled: Boolean(doctorId && patient._id),
      staleTime: 30_000,
    })),
  });

  const encounterRefs = useMemo(() => {
    const refs: PrescriptionHubEncounterRef[] = [];
    encounterQueries.forEach((query, index) => {
      const patient = patients[index];
      if (!patient || !query.data?.encounters?.length) return;
      for (const encounter of query.data.encounters) {
        refs.push(buildEncounterRef(encounter, patient, t));
      }
    });
    return sortEncounterRefs(refs).slice(0, MAX_ENCOUNTERS_FOR_PRESCRIPTIONS);
  }, [encounterQueries, patients, t]);

  const prescriptionQueries = useQueries({
    queries: encounterRefs.map((ref) => ({
      queryKey: doctorPatientsQueryKeys.encounterPrescription(
        doctorId,
        ref.patientId,
        ref.encounterId,
      ),
      queryFn: () =>
        doctorApi.patients.listEncounterPrescriptions(
          doctorId,
          ref.patientId,
          ref.encounterId,
        ),
      enabled: Boolean(doctorId && ref.patientId && ref.encounterId),
      staleTime: 30_000,
    })),
  });

  const facilityLabel = useMemo(
    () => resolvePrescriptionHubFacilityLabel(profileQuery.data?.doctor, t),
    [profileQuery.data?.doctor, t],
  );

  const allRows = useMemo(() => {
    const rows: PrescriptionHubRowVm[] = [];

    encounterRefs.forEach((ref, index) => {
      const query = prescriptionQueries[index];
      const prescriptions = query?.data?.prescriptions ?? [];

      if (prescriptions.length > 0) {
        for (const prescription of prescriptions) {
          rows.push(mapPrescriptionToHubRow(ref, prescription, facilityLabel, t));
        }
        return;
      }

      if (ref.encounterStatus !== 'closed') {
        rows.push(mapEncounterDraftToHubRow(ref, facilityLabel, t));
      }
    });

    return sortRows(rows);
  }, [encounterRefs, prescriptionQueries, facilityLabel, t]);

  const filteredRows = useMemo(
    () =>
      allRows.filter((row) =>
        matchesPrescriptionHubSearch(row, filters.search),
      ),
    [allRows, filters.search],
  );

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const safePage = Math.min(filters.page, totalPages);
  const startIndex = (safePage - 1) * filters.limit;
  const rows = filteredRows.slice(startIndex, startIndex + filters.limit);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = total === 0 ? 0 : Math.min(startIndex + filters.limit, total);

  const firstEncounterError =
    encounterQueries.find((query) => query.isError)?.error ?? null;
  const firstPrescriptionError =
    prescriptionQueries.find((query) => query.isError)?.error ?? null;

  const isAwaitingData =
    patientsQuery.isAwaitingData ||
    isAwaitingInitialQueryData(profileQuery.data, profileQuery.isError) ||
    isAwaitingAnyQueryResults(encounterQueries) ||
    (encounterRefs.length > 0 &&
      isAwaitingAnyQueryResults(prescriptionQueries));

  const isError =
    patientsQuery.isError ||
    Boolean(firstEncounterError) ||
    Boolean(firstPrescriptionError);

  const error =
    patientsQuery.error ?? firstEncounterError ?? firstPrescriptionError;

  return {
    rows,
    total,
    page: safePage,
    totalPages,
    showingFrom,
    showingTo,
    isAwaitingData,
    isError,
    error,
    refetch: () => {
      void patientsQuery.refetch();
      void profileQuery.refetch();
      encounterQueries.forEach((query) => void query.refetch());
      prescriptionQueries.forEach((query) => void query.refetch());
    },
  };
}
