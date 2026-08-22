import type { DoctorEncounterSummary } from '@/lib/doctor/types';
import type { EncounterOrder } from '@/lib/doctor/encounters/encounterClinicalTypes';
import {
  formatRadiologyOrderCode,
  mapOrderToClinicalForm,
  mapRadiologyItemsToUi,
  resolveRadiologyStatusLabel,
} from '../map-radiology-ui';
import type { RadiologyPreviewVm } from './radiology-preview-types';

function formatPatientMeta(
  encounter?: DoctorEncounterSummary | null,
  publicProfile?: { user?: { dateOfBirth?: string; fullName?: string } } | null,
) {
  const dob =
    encounter?.patient?.dateOfBirth ??
    encounter?.patient?.user?.dateOfBirth;
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const years = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return years > 0 ? `${years} سنة • ذكر` : '—';
}

export function mapRadiologyPreviewVm({
  order,
  encounter,
  publicProfile,
}: {
  order: EncounterOrder;
  encounter?: DoctorEncounterSummary | null;
  publicProfile?: { user?: { fullName?: string } } | null;
}): RadiologyPreviewVm {
  const items = mapRadiologyItemsToUi(order);
  const status = resolveRadiologyStatusLabel(order);

  return {
    orderId: order._id,
    orderCode: formatRadiologyOrderCode(order._id),
    patientName:
      encounter?.patient?.user?.fullName?.trim() ??
      publicProfile?.user?.fullName?.trim() ??
      '—',
    patientMeta: formatPatientMeta(encounter, publicProfile),
    statusLabel: status,
    clinical: mapOrderToClinicalForm(order),
    items,
    canFinalize: !status.includes('معتمد') && items.length > 0,
    raw: order,
  };
}
