import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';
import type {
  PrescriptionDraftForm,
  PrescriptionMedicationItem,
} from './prescription-types';

export function mapPrescriptionItemsToUi(
  prescription?: EncounterPrescriptionRecord | null,
): PrescriptionMedicationItem[] {
  return (prescription?.items ?? [])
    .filter((item) => item._id && item.name?.trim())
    .map((item) => ({
      id: item._id!,
      name: item.name!.trim(),
      dosage: item.dosage?.trim() || '—',
      frequency: item.frequency?.trim() || '—',
      duration: item.duration?.trim() || '—',
    }));
}

export function mapUiItemToApiBody(values: PrescriptionDraftForm) {
  return {
    name: values.name.trim(),
    dosage: values.dosage.trim(),
    frequency: values.frequency.trim(),
    duration: values.duration.trim(),
  };
}

type TFn = (key: string, fallback?: string) => string;

export function resolvePrescriptionStatusLabel(
  status?: string,
  t: TFn = (key) => key,
) {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('final')) return t('doctor.prescriptionStatus.finalized');
  return t('doctor.prescription.defaultStatus');
}

export function isPrescriptionEditable(
  prescription?: EncounterPrescriptionRecord | null,
  encounterStatus?: string,
) {
  if (encounterStatus === 'closed') return false;
  const status = prescription?.status?.toLowerCase() ?? '';
  return !status.includes('final');
}

export function resolvePatientPrescriptionName(
  prescription?: EncounterPrescriptionRecord | null,
  encounterPatientName?: string,
) {
  return (
    prescription?.patient?.user?.fullName?.trim() ??
    encounterPatientName?.trim() ??
    ''
  );
}

export function buildPrescriptionPatientSubtitle(
  patientName?: string,
  t: TFn = (key) => key,
) {
  const name = patientName?.trim();
  if (!name || name === '—') {
    return t('doctor.prescription.defaultTitle');
  }
  return t('doctor.prescription.subtitle.forPatient').replace('{name}', name);
}

export function buildPatientPrescriptionLabel(
  prescription?: EncounterPrescriptionRecord | null,
  encounterPatientName?: string,
  publicId?: string,
) {
  const name =
    resolvePatientPrescriptionName(prescription, encounterPatientName) || '—';
  const file =
    prescription?.patient?.publicId?.trim() ??
    publicId?.trim() ??
    '';
  const fileLabel = file
    ? file.startsWith('P-') || file.startsWith('#')
      ? file
      : `P-${file}`
    : '';
  return fileLabel ? `${name} — ${fileLabel}` : name;
}
