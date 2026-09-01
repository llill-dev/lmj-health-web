import type { DoctorEncounterSummary } from '@/lib/doctor/types';
import type { EncounterOrder } from '@/lib/doctor/encounters/encounterClinicalTypes';
import { isFinalizedEncounterOrder } from '@/lib/doctor/encounters/encounterOrderCategories';
import {
  formatRadiologyOrderCode,
  mapOrderToClinicalForm,
  mapRadiologyItemsToUi,
  resolveRadiologyStatusLabel,
} from '../map-radiology-ui';
import type { RadiologyPreviewVm } from './radiology-preview-types';

type TFn = (key: string, fallback?: string) => string;

function formatPatientMeta(
  encounter: DoctorEncounterSummary | null | undefined,
  publicProfile:
    | { user?: { dateOfBirth?: string; fullName?: string } }
    | null
    | undefined,
  t?: TFn,
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
  if (years <= 0) return '—';
  return t
    ? t('doctor.radiologyPreview.ageYears').replace('{years}', String(years))
    : `${years} سنة • ذكر`;
}

export function mapRadiologyPreviewVm({
  order,
  encounter,
  publicProfile,
  locale = 'ar',
  t,
}: {
  order: EncounterOrder;
  encounter?: DoctorEncounterSummary | null;
  publicProfile?: { user?: { fullName?: string } } | null;
  locale?: 'ar' | 'en';
  t?: TFn;
}): RadiologyPreviewVm {
  const items = mapRadiologyItemsToUi(order, t);
  const status = resolveRadiologyStatusLabel(order, locale);

  return {
    orderId: order._id,
    orderCode: formatRadiologyOrderCode(order._id),
    patientName:
      encounter?.patient?.user?.fullName?.trim() ??
      publicProfile?.user?.fullName?.trim() ??
      '—',
    patientMeta: formatPatientMeta(encounter, publicProfile, t),
    statusLabel: status,
    clinical: mapOrderToClinicalForm(order),
    items,
    canFinalize: !isFinalizedEncounterOrder(order) && items.length > 0,
    raw: order,
  };
}
