import type { AdminLookupRecord } from '@/lib/admin/types';
import { resolveLookupSecondaryText, resolveLookupText } from '@/lib/admin/lookups/lookupUtils';

export type DoctorSpecializationReviewMode =
  | 'catalog'
  | 'custom_pending'
  | 'unknown';

export type DoctorSpecializationReviewState = {
  displayLabel: string;
  mode: DoctorSpecializationReviewMode;
  specializationKey: string | null;
  customSpecializationText: string | null;
  needsAdminResolve: boolean;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'neutral';
};

export type DoctorSpecializationReviewSource =
  | Record<string, unknown>
  | null
  | undefined;

function readString(
  raw: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function readPendingFlag(raw: Record<string, unknown>): boolean {
  const boolKeys = [
    'customSpecializationPending',
    'hasPendingCustomSpecialization',
    'pendingCustomSpecialization',
    'requiresSpecializationResolve',
  ];
  for (const key of boolKeys) {
    if (raw[key] === true) return true;
  }

  const status = readString(
    raw,
    'customSpecializationStatus',
    'specializationStatus',
    'specializationResolveStatus',
  );
  if (!status) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === 'pending' ||
    normalized === 'unresolved' ||
    normalized === 'requested'
  );
}

/** يستنتج حالة التخصص من كائن الطبيب/طلب التحقق (حقول API-3 + بدائل شائعة). */
export function resolveDoctorSpecializationReviewState(
  source: DoctorSpecializationReviewSource,
): DoctorSpecializationReviewState {
  const raw = (source ?? {}) as Record<string, unknown>;
  const specializationKey = readString(
    raw,
    'specializationKey',
    'specializationLookupKey',
  );
  const customSpecializationText = readString(
    raw,
    'customSpecializationText',
    'pendingCustomSpecializationText',
    'requestedCustomSpecialization',
  );
  const displayLabel =
    readString(raw, 'specialization') ??
    customSpecializationText ??
    specializationKey ??
    '—';

  const pendingExplicit = readPendingFlag(raw);
  const needsAdminResolve = Boolean(
    pendingExplicit || (customSpecializationText && !specializationKey),
  );

  let mode: DoctorSpecializationReviewMode = 'unknown';
  if (needsAdminResolve) mode = 'custom_pending';
  else if (specializationKey) mode = 'catalog';

  if (mode === 'catalog') {
    return {
      displayLabel,
      mode,
      specializationKey,
      customSpecializationText,
      needsAdminResolve: false,
      statusLabel: 'مرتبط بالقائمة المعتمدة',
      statusTone: 'success',
    };
  }

  if (mode === 'custom_pending') {
    return {
      displayLabel,
      mode,
      specializationKey,
      customSpecializationText,
      needsAdminResolve: true,
      statusLabel: 'إدخال يدوي — بانتظار الربط',
      statusTone: 'warning',
    };
  }

  return {
    displayLabel,
    mode,
    specializationKey,
    customSpecializationText,
    needsAdminResolve: true,
    statusLabel: 'غير محدّد — يحتاج مراجعة',
    statusTone: 'neutral',
  };
}

export function findDoctorSpecializationLookupId(
  lookups: AdminLookupRecord[],
  specializationKey: string | null,
): string | null {
  if (!specializationKey) return null;
  const normalized = specializationKey.trim().toLowerCase();
  const match = lookups.find(
    (row) => row.key.trim().toLowerCase() === normalized && row.isActive,
  );
  return match?._id ?? null;
}

export function buildDoctorSpecializationLookupOptions(
  lookups: AdminLookupRecord[],
): Array<{ value: string; label: string; key: string }> {
  return [...lookups]
    .filter((row) => row.isActive)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        a.key.localeCompare(b.key, 'en'),
    )
    .map((row) => {
      const labelAr = resolveLookupText(row.text, 'ar');
      const labelEn = resolveLookupSecondaryText(row.text, 'ar');
      const label = labelAr || labelEn || row.key;
      return {
        value: row._id,
        label: labelEn ? `${label} (${labelEn})` : `${label} · ${row.key}`,
        key: row.key,
      };
    });
}
