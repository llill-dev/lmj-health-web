'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mapPrescriptionPreviewVm } from '@/components/doctor/prescription/preview/map-prescription-preview';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { loadEncounterPrescriptionForPreview } from '@/lib/doctor/encounterPrescriptionLoad';
import { useDoctorProfile } from './useDoctorProfile';

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
    staleTime: 1000 * 15,
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

  return {
    previewVm,
    prescription: prescriptionQuery.data,
    encounter: encounterQuery.data?.encounter,
    isLoading:
      encounterQuery.isLoading ||
      prescriptionQuery.isLoading ||
      publicProfileQuery.isLoading,
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
    isFetching:
      encounterQuery.isFetching || prescriptionQuery.isFetching,
  };
}
