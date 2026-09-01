import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';
import type { DoctorEncounterSummary, DoctorPatientListItem } from '@/lib/doctor/types';

export type PrescriptionHubStatusKey =
  | 'active'
  | 'emergency'
  | 'follow_up'
  | 'closed'
  | 'archived';

export type PrescriptionHubRowVm = {
  id: string;
  systemId: string;
  patientId: string;
  encounterId: string;
  prescriptionId?: string;
  patientName: string;
  patientPhone: string;
  facilityLabel: string;
  dateLabel: string;
  statusKey: PrescriptionHubStatusKey;
  statusLabel: string;
  sortAt: string;
};

export type PrescriptionHubEncounterRef = {
  encounterId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientPublicId: string;
  encounterStatus: string;
  encounterOrigin?: string;
  startedAt?: string;
};

export function formatPrescriptionHubDate(value?: string | null): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPrescriptionHubSystemId(input: {
  prescriptionId: string;
  patientPublicId?: string;
  date?: string | null;
}): string {
  const year = input.date
    ? new Date(input.date).getFullYear()
    : new Date().getFullYear();

  const publicId = input.patientPublicId?.trim();
  if (publicId) {
    const normalized =
      publicId.startsWith('P-') || publicId.startsWith('PAT-')
        ? publicId
        : `P-${publicId}`;
    const suffix = normalized.replace(/^(P|PAT)-?/i, '');
    return `MR-SY-${year}-${suffix.padStart(8, '0').slice(-8)}`;
  }

  const tail = input.prescriptionId
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .toUpperCase();
  return `MR-SY-${year}-${tail || '00000000'}`;
}

type TFn = (key: string, fallback?: string) => string;

export function resolvePrescriptionHubFacilityLabel(
  profile: { locationCity?: string; clinicAddress?: string } | undefined,
  t: TFn,
): string {
  const city = profile?.locationCity?.trim();
  const address = profile?.clinicAddress?.trim();
  if (city && address) {
    return address.length > 48 ? `${city} — ${address.slice(0, 48)}…` : `${city} — ${address}`;
  }
  if (city) return city;
  if (address) return address.length > 60 ? `${address.slice(0, 60)}…` : address;
  return t('doctor.prescriptionsHub.defaultFacility');
}

export function resolvePrescriptionHubStatus(
  input: {
    prescriptionStatus?: string;
    encounterStatus?: string;
    encounterOrigin?: string;
  },
  t: TFn,
): { key: PrescriptionHubStatusKey; label: string } {
  const prescriptionStatus = (input.prescriptionStatus ?? '').toLowerCase();
  const encounterStatus = (input.encounterStatus ?? '').toLowerCase();

  if (
    prescriptionStatus.includes('archiv') ||
    encounterStatus.includes('archiv')
  ) {
    return { key: 'archived', label: t('doctor.prescriptionsHub.status.archived') };
  }

  if (encounterStatus === 'closed') {
    return { key: 'closed', label: t('doctor.prescriptionsHub.status.closed') };
  }

  if (
    input.encounterOrigin === 'walk_in' &&
    (prescriptionStatus === 'draft' || !prescriptionStatus.includes('final'))
  ) {
    return { key: 'emergency', label: t('doctor.prescriptionsHub.status.emergency') };
  }

  if (
    prescriptionStatus === 'draft' ||
    prescriptionStatus.includes('draft') ||
    (!prescriptionStatus.includes('final') && prescriptionStatus !== 'active')
  ) {
    return { key: 'follow_up', label: t('doctor.prescriptionsHub.status.followUp') };
  }

  return { key: 'active', label: t('doctor.prescriptionsHub.status.active') };
}

export function buildEncounterRef(
  encounter: DoctorEncounterSummary,
  patient: Pick<DoctorPatientListItem, '_id' | 'publicId' | 'user'>,
  t: TFn,
): PrescriptionHubEncounterRef {
  return {
    encounterId: encounter._id,
    patientId: patient._id,
    patientName: patient.user?.fullName?.trim() || t('doctor.prescriptionsHub.defaultPatientName'),
    patientPhone: patient.user?.phone?.trim() || '—',
    patientPublicId: patient.publicId ?? '',
    encounterStatus: encounter.status ?? 'open',
    encounterOrigin: encounter.origin,
    startedAt: encounter.startedAt ?? encounter.createdAt,
  };
}

export function mapPrescriptionToHubRow(
  ref: PrescriptionHubEncounterRef,
  prescription: EncounterPrescriptionRecord,
  facilityLabel: string,
  t: TFn,
): PrescriptionHubRowVm {
  const dateSource =
    prescription.finalizedAt ??
    ref.startedAt ??
    prescription.items?.[0]?.startDate;
  const status = resolvePrescriptionHubStatus({
    prescriptionStatus: prescription.status,
    encounterStatus: ref.encounterStatus,
    encounterOrigin: ref.encounterOrigin,
  }, t);

  return {
    id: prescription._id,
    systemId: formatPrescriptionHubSystemId({
      prescriptionId: prescription._id,
      patientPublicId: ref.patientPublicId,
      date: dateSource,
    }),
    patientId: ref.patientId,
    encounterId: ref.encounterId,
    prescriptionId: prescription._id,
    patientName: ref.patientName,
    patientPhone: ref.patientPhone,
    facilityLabel,
    dateLabel: formatPrescriptionHubDate(dateSource),
    statusKey: status.key,
    statusLabel: status.label,
    sortAt: dateSource ?? ref.startedAt ?? '',
  };
}

export function mapEncounterDraftToHubRow(
  ref: PrescriptionHubEncounterRef,
  facilityLabel: string,
  t: TFn,
): PrescriptionHubRowVm {
  const status = resolvePrescriptionHubStatus({
    prescriptionStatus: 'draft',
    encounterStatus: ref.encounterStatus,
    encounterOrigin: ref.encounterOrigin,
  }, t);

  return {
    id: `${ref.encounterId}-draft`,
    systemId: formatPrescriptionHubSystemId({
      prescriptionId: ref.encounterId,
      patientPublicId: ref.patientPublicId,
      date: ref.startedAt,
    }),
    patientId: ref.patientId,
    encounterId: ref.encounterId,
    patientName: ref.patientName,
    patientPhone: ref.patientPhone,
    facilityLabel,
    dateLabel: formatPrescriptionHubDate(ref.startedAt),
    statusKey: status.key,
    statusLabel: status.label,
    sortAt: ref.startedAt ?? '',
  };
}

export function matchesPrescriptionHubSearch(
  row: PrescriptionHubRowVm,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    row.systemId,
    row.patientName,
    row.patientPhone,
    row.facilityLabel,
    row.dateLabel,
    row.statusLabel,
  ].some((value) => value.toLowerCase().includes(q));
}
