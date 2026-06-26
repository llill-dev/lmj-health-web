import type { DoctorEncounterSummary } from '@/lib/doctor/types';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';
import type { PrescriptionPreviewVm } from './prescription-preview-types';
import { resolvePrescriptionStatusLabel } from '../map-prescription-ui';

function formatPrescriptionCode(prescriptionId: string) {
  const year = new Date().getFullYear();
  const suffix = prescriptionId.slice(-3).toUpperCase();
  return `RX-${year}-${suffix.padStart(3, '0')}`;
}

function formatPatientMeta(
  encounter?: DoctorEncounterSummary | null,
  publicProfile?: {
    user?: { dateOfBirth?: string; phone?: string; fullName?: string };
    dateOfBirth?: string;
  } | null,
) {
  const dob =
    encounter?.patient?.dateOfBirth ??
    encounter?.patient?.user?.dateOfBirth ??
    publicProfile?.dateOfBirth;
  let ageLabel = '—';
  if (dob) {
    const birth = new Date(dob);
    if (!Number.isNaN(birth.getTime())) {
      const years = Math.floor(
        (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (years > 0) ageLabel = `${years} سنة`;
    }
  }
  return `${ageLabel} • ذكر`;
}

export function mapPrescriptionPreviewVm({
  prescription,
  encounter,
  publicProfile,
  doctorName,
}: {
  prescription: EncounterPrescriptionRecord;
  encounter?: DoctorEncounterSummary | null;
  publicProfile?: {
    user?: { fullName?: string; dateOfBirth?: string };
    dateOfBirth?: string;
  } | null;
  doctorName: string;
}): PrescriptionPreviewVm {
  const patientName =
    prescription.patient?.user?.fullName?.trim() ??
    encounter?.patient?.user?.fullName?.trim() ??
    publicProfile?.user?.fullName?.trim() ??
    '—';

  const patientPhone = '—';

  const medications = (prescription.items ?? []).map((item, index) => {
    const instructions =
      item.instructions?.trim() || item.notes?.trim() || undefined;
    return {
      id: item._id ?? `item-${index}`,
      index: index + 1,
      name: item.name?.trim() || '—',
      concentration: item.dosage?.trim() || '—',
      usage: item.route?.trim() || 'فموي',
      instructions,
      frequency: item.frequency?.trim() || '—',
      duration: item.duration?.trim() || '—',
    };
  });

  const status = prescription.status?.toLowerCase() ?? '';
  const canFinalize =
    !status.includes('final') && medications.length > 0;

  return {
    prescriptionId: prescription._id,
    prescriptionCode: formatPrescriptionCode(prescription._id),
    patientName,
    patientMeta: formatPatientMeta(encounter, publicProfile),
    patientPhone,
    doctorName: doctorName.trim() ? `د.${doctorName.trim()}` : 'الطبيب',
    generalInstructions: prescription.generalInstructions?.trim(),
    medications,
    statusLabel: resolvePrescriptionStatusLabel(prescription.status),
    canFinalize,
    raw: prescription,
  };
}
