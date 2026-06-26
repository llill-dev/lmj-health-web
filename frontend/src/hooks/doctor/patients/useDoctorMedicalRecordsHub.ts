import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  isAwaitingAnyQueryResults,
  isAwaitingInitialQueryData,
} from "@/lib/query/queryUi";
import {
  mapMedicalRecordToRow,
  matchesMedicalRecordSearch,
  resolvePrescriptionHubFacilityLabel,
  type MedicalRecordRowVm,
} from "@/components/doctor/medical-records";
import { doctorApi, doctorPatientsQueryKeys } from "@/lib/doctor/client";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useDoctorProfile } from "@/hooks/doctor/profile/useDoctorProfile";

const MAX_PATIENTS = 100;

export type MedicalRecordsHubFilters = {
  search: string;
  page: number;
  limit: number;
};

function sortRows(rows: MedicalRecordRowVm[]) {
  return [...rows].sort((a, b) => {
    const aTime = a.sortAt ? new Date(a.sortAt).getTime() : 0;
    const bTime = b.sortAt ? new Date(b.sortAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function useDoctorMedicalRecordsHub(
  doctorId: string,
  filters: MedicalRecordsHubFilters,
) {
  const patientsQuery = useDoctorPatients({
    page: 1,
    limit: MAX_PATIENTS,
  });
  const profileQuery = useDoctorProfile();
  const patients = patientsQuery.patients;

  const recordQueries = useQueries({
    queries: patients.map((patient) => ({
      queryKey: doctorPatientsQueryKeys.medicalRecords(doctorId, patient._id),
      queryFn: () =>
        doctorApi.patients.listMedicalRecords(doctorId, patient._id),
      enabled: Boolean(doctorId && patient._id),
      staleTime: 30_000,
      retry: false,
    })),
  });

  const facilityLabel = useMemo(
    () => resolvePrescriptionHubFacilityLabel(profileQuery.data?.doctor),
    [profileQuery.data?.doctor],
  );

  const allRows = useMemo(() => {
    const rows: MedicalRecordRowVm[] = [];

    patients.forEach((patient, index) => {
      const records = recordQueries[index]?.data?.records ?? [];
      for (const record of records) {
        rows.push(mapMedicalRecordToRow(patient, record, facilityLabel));
      }
    });

    return sortRows(rows);
  }, [patients, recordQueries, facilityLabel]);

  const filteredRows = useMemo(
    () =>
      allRows.filter((row) => matchesMedicalRecordSearch(row, filters.search)),
    [allRows, filters.search],
  );

  const stats = useMemo(() => {
    let prescriptions = 0;
    let needsFollowUp = 0;
    let active = 0;

    for (const row of allRows) {
      prescriptions += row.raw.prescriptions?.length ?? 0;
      if (row.raw.followUpRequired) needsFollowUp += 1;
      if (row.statusKey === "active") active += 1;
    }

    return {
      totalRecords: allRows.length,
      prescriptions,
      needsFollowUp,
      active,
    };
  }, [allRows]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const safePage = Math.min(filters.page, totalPages);
  const startIndex = (safePage - 1) * filters.limit;
  const rows = filteredRows.slice(startIndex, startIndex + filters.limit);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo =
    total === 0 ? 0 : Math.min(startIndex + filters.limit, total);

  const isAwaitingData =
    patientsQuery.isAwaitingData ||
    isAwaitingInitialQueryData(profileQuery.data, profileQuery.isError) ||
    (patients.length > 0 && isAwaitingAnyQueryResults(recordQueries));

  const isError = patientsQuery.isError;
  const error = patientsQuery.error;

  return {
    rows,
    total,
    stats,
    page: safePage,
    totalPages,
    showingFrom,
    showingTo,
    isAwaitingData,
    isError,
    error,
    patients,
    refetch: async () => {
      await patientsQuery.refetch();
      await profileQuery.refetch();
      await Promise.all(recordQueries.map((query) => query.refetch()));
    },
  };
}
