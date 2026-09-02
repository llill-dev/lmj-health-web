import type { VerificationRequestSummary } from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

export type ChangeRow = {
  key: string;
  label: string;
  before: string;
  after: string;
};

const FIELD_LABEL_KEYS: Record<string, string> = {
  education: 'adminDoctorProfileChangeRequests.field.education',
  specialization: 'adminDoctorProfileChangeRequests.field.specialization',
  medicalLicenseNumber: 'adminVerificationRequests.field.licenseNumber',
  licenseNumber: 'adminVerificationRequests.field.licenseNumber',
  clinicAddress: 'adminDoctorProfileChangeRequests.field.clinicAddress',
  locationCity: 'adminFacilityDialog.field.city.label',
  locationCountry: 'adminDoctorProfileChangeRequests.field.locationCountry',
  consultationFee: 'adminVerificationRequests.field.consultationFee',
  bio: 'adminVerificationRequests.field.bio',
};

function tt(locale: AppLocale, key: string): string {
  return getTranslationValue(locale, key) ?? key;
}

export function formatRequestedAt(value?: string, locale: AppLocale = 'ar') {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const dateLocale = locale === 'ar' ? 'ar-SY' : 'en-US';
  const time = d.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return sameDay ? `${tt(locale, 'common.today')} ${time}` : d.toLocaleDateString(dateLocale);
}

function labelForField(key: string, locale: AppLocale) {
  const labelKey = FIELD_LABEL_KEYS[key];
  return labelKey ? tt(locale, labelKey) : key;
}

function formatAnyValue(value: unknown, locale: AppLocale = 'ar'): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const separator = locale === 'ar' ? '، ' : ', ';
    return value.map((v) => formatAnyValue(v, locale)).join(separator);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

export function extractRequestFromDetails(details: unknown): VerificationRequestSummary | null {
  const envelope = details as
    | {
        request?: VerificationRequestSummary | null;
        verificationRequest?: VerificationRequestSummary | null;
        item?: VerificationRequestSummary | null;
        data?: VerificationRequestSummary | null;
      }
    | null
    | undefined;

  return (
    envelope?.request ??
    envelope?.verificationRequest ??
    envelope?.item ??
    envelope?.data ??
    null
  );
}

export function buildChangeRows(
  request: VerificationRequestSummary | null,
  locale: AppLocale = 'ar',
): ChangeRow[] {
  if (!request) {
    return [];
  }

  const requestAny = request as VerificationRequestSummary &
    Record<string, unknown>;
  const requestedChanges =
    requestAny.requestedChanges ??
    requestAny.changes ??
    requestAny.profileChanges ??
    {};

  const doctorSource = (requestAny.doctor ?? {}) as Record<string, unknown>;
  const rows: ChangeRow[] = [];

  if (requestedChanges && typeof requestedChanges === 'object') {
    Object.entries(requestedChanges as Record<string, unknown>).forEach(([key, raw]) => {
      const rawObject = raw as { before?: unknown; after?: unknown } | null;
      if (
        rawObject &&
        typeof rawObject === 'object' &&
        ('before' in rawObject || 'after' in rawObject)
      ) {
        rows.push({
          key,
          label: labelForField(key, locale),
          before: formatAnyValue(rawObject.before, locale),
          after: formatAnyValue(rawObject.after, locale),
        });
        return;
      }

      rows.push({
        key,
        label: labelForField(key, locale),
        before: formatAnyValue(doctorSource[key], locale),
        after: formatAnyValue(raw, locale),
      });
    });
  }

  if (rows.length === 0) {
    rows.push({
      key: 'education',
      label: tt(locale, 'adminDoctorProfileChangeRequests.field.education'),
      before: formatAnyValue(doctorSource.education ?? request.doctor?.specialization, locale),
      after: formatAnyValue(doctorSource.education ?? request.doctor?.specialization, locale),
    });
    rows.push({
      key: 'medicalLicenseNumber',
      label: tt(locale, 'adminVerificationRequests.field.licenseNumber'),
      before: formatAnyValue(request.doctor?.medicalLicenseNumber, locale),
      after: formatAnyValue(request.doctor?.medicalLicenseNumber, locale),
    });
  }

  return rows;
}
