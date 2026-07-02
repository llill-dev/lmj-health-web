'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import { mapPrescriptionPreviewVm } from '@/components/doctor/prescription/preview/map-prescription-preview';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { loadEncounterPrescriptionForPreview } from '@/lib/doctor/encounters/encounterPrescriptionLoad';
import { useDoctorProfile } from '@/hooks/doctor/profile/useDoctorProfile';

export function usePrescriptionPreviewPage(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const profileQuery = useDoctorProfile();

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

  const prescriptionQuery = useQuery({
    queryKey: [
      ...doctorPatientsQueryKeys.encounterPrescription(
        doctorId,
        patientId,
        encounterId,
      ),
      'preview',
    ],
    queryFn: () =>
      loadEncounterPrescriptionForPreview(doctorId, patientId, encounterId),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  });

  const publicProfileQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
    queryFn: () => doctorApi.patients.getPublicProfile(patientId),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  });

  const doctorName = useMemo(() => {
    const fullName = profileQuery.data?.doctor?.user?.fullName?.trim();
    if (!fullName) return 'الطبيب';
    return /^د\.?\s/u.test(fullName) ? fullName.replace(/^د\.?\s*/u, '') : fullName;
  }, [profileQuery.data?.doctor?.user?.fullName]);

  const previewVm = useMemo(() => {
    if (!prescriptionQuery.data) return null;
    return mapPrescriptionPreviewVm({
      prescription: prescriptionQuery.data,
      encounter: encounterQuery.data?.encounter,
      publicProfile: publicProfileQuery.data?.patient,
      doctorName,
    });
  }, [
    prescriptionQuery.data,
    encounterQuery.data?.encounter,
    publicProfileQuery.data?.patient,
    doctorName,
  ]);

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: prescriptionQuery.data, isError: prescriptionQuery.isError },
    { data: publicProfileQuery.data, isError: publicProfileQuery.isError },
  ]);

  return {
    previewVm,
    prescription: prescriptionQuery.data,
    encounter: encounterQuery.data?.encounter,
    isAwaitingData,
    isError:
      encounterQuery.isError ||
      prescriptionQuery.isError ||
      !prescriptionQuery.data,
    error: encounterQuery.error ?? prescriptionQuery.error,
    refetch: () => {
      void encounterQuery.refetch();
      void prescriptionQuery.refetch();
      void publicProfileQuery.refetch();
    },
  };
}
