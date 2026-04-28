import type { VerificationRequestSummary } from '@/lib/admin/types';

export type ChangeRow = {
  key: string;
  label: string;
  before: string;
  after: string;
};

const FIELD_LABELS: Record<string, string> = {
  education: 'التعليم',
  specialization: 'التخصص',
  medicalLicenseNumber: 'رقم الترخيص',
  licenseNumber: 'رقم الترخيص',
  clinicAddress: 'عنوان العيادة',
  locationCity: 'المدينة',
  locationCountry: 'الدولة',
  consultationFee: 'أجرة الاستشارة',
  bio: 'النبذة التعريفية',
};

export function formatRequestedAt(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('ar-SY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return sameDay ? `اليوم ${time}` : d.toLocaleDateString('ar-SY');
}

function labelForField(key: string) {
  return FIELD_LABELS[key] ?? key;
}

function formatAnyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return value.map((v) => formatAnyValue(v)).join('، ');
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
          label: labelForField(key),
          before: formatAnyValue(rawObject.before),
          after: formatAnyValue(rawObject.after),
        });
        return;
      }

      rows.push({
        key,
        label: labelForField(key),
        before: formatAnyValue(doctorSource[key]),
        after: formatAnyValue(raw),
      });
    });
  }

  if (rows.length === 0) {
    rows.push({
      key: 'education',
      label: 'التعليم',
      before: formatAnyValue(doctorSource.education ?? request.doctor?.specialization),
      after: formatAnyValue(doctorSource.education ?? request.doctor?.specialization),
    });
    rows.push({
      key: 'medicalLicenseNumber',
      label: 'رقم الترخيص',
      before: formatAnyValue(request.doctor?.medicalLicenseNumber),
      after: formatAnyValue(request.doctor?.medicalLicenseNumber),
    });
  }

  return rows;
}
