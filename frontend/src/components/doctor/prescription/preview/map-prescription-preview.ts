import type { DoctorEncounterSummary } from '@/lib/doctor/types';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';
import type { PrescriptionPreviewVm } from './prescription-preview-types';

type TFn = (key: string, fallback?: string) => string;

function formatPrescriptionCode(prescriptionId: string) {
  const year = new Date().getFullYear();
  const suffix = prescriptionId.slice(-3).toUpperCase();
  return `RX-${year}-${suffix.padStart(3, '0')}`;
}

function formatPatientMeta(
  encounter: DoctorEncounterSummary | null | undefined,
  publicProfile:
    | {
        user?: { dateOfBirth?: string; phone?: string; fullName?: string };
        dateOfBirth?: string;
      }
    | null
    | undefined,
  t: TFn,
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
      if (years > 0)
        ageLabel = t('doctor.prescriptionPreview.ageYears').replace(
          '{years}',
          String(years),
        );
    }
  }
  return `${ageLabel} • ${t('doctor.prescriptionPreview.genderMale')}`;
}

export function mapPrescriptionPreviewVm({
  prescription,
  encounter,
  publicProfile,
  doctorName,
  t,
}: {
  prescription: EncounterPrescriptionRecord;
  encounter?: DoctorEncounterSummary | null;
  publicProfile?: {
    user?: { fullName?: string; dateOfBirth?: string };
    dateOfBirth?: string;
  } | null;
  doctorName: string;
  t: TFn;
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
      usage: item.route?.trim() || t('doctor.prescriptionPreview.usageOral'),
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
    patientMeta: formatPatientMeta(encounter, publicProfile, t),
    patientPhone,
    doctorName: doctorName.trim()
      ? `${t('doctor.prescriptionPreview.doctorTitlePrefix')}${doctorName.trim()}`
      : t('doctor.prescriptionPreview.defaultDoctorName'),
    generalInstructions: prescription.generalInstructions?.trim(),
    medications,
    statusLabel: status.includes('final')
      ? t('doctor.prescriptionStatus.finalized')
      : t('doctor.prescriptionStatus.draft'),
    canFinalize,
    raw: prescription,
  };
}
