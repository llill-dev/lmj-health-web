import { get } from '@/lib/base';
import { resolveLookupText } from '@/lib/admin/lookupUtils';
import type { AdminLocalizedLookupText } from '@/lib/admin/types';
import { authEndpoints } from '@/lib/auth/endpoints';
import type { DoctorSignupSpecialtyOption } from '@/lib/auth/types';

/** PDF: GET /meta/doctor-specializations مع `includeAllLangs=true` تعيد حقول `{ ar, en }` للنص. */
function doctorSpecializationsRequestUrl(): string {
  const override =
    import.meta.env.VITE_PUBLIC_DOCTOR_SPECIALTIES_PATH?.trim() ?? '';
  const base =
    override.length > 0 ? override : authEndpoints.doctorSpecialties();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}includeAllLangs=true`;
}

function mapLookupLikeRow(
  row: Record<string, unknown>,
): DoctorSignupSpecialtyOption | null {
  const rawText = row.text as AdminLocalizedLookupText | undefined;
  const fallbackLabel = String(
    row.label ?? row.name ?? row.title ?? '',
  ).trim();
  const labelAr = resolveLookupText(rawText ?? fallbackLabel, 'ar').trim();
  const labelEn = resolveLookupText(rawText ?? fallbackLabel, 'en').trim();
  const key = String(row.key ?? '').trim();
  const id = String(row.id ?? row._id ?? '').trim();
  const label = labelAr || labelEn || fallbackLabel || key || id;
  const value = key || id || label;
  if (!value || !label) return null;
  return {
    key: value,
    labelAr: label,
    ...(labelEn ? { labelEn } : {}),
    value,
  };
}

const ARRAY_PAYLOAD_KEYS_OUTER = [
  'doctorSpecializations',
  'specialties',
  'lookups',
  'options',
  'items',
  'results',
  'data',
  'payload',
  'response',
  'content',
  'result',
] as const;

const ARRAY_PAYLOAD_KEYS_INNER = [
  'doctorSpecializations',
  'items',
  'results',
  'specialties',
  'lookups',
  'options',
  'data',
  'records',
  'result',
] as const;

function extractRows(raw: Record<string, unknown>): Record<string, unknown>[] {
  const tryNest = (
    inner: Record<string, unknown>,
  ): Record<string, unknown>[] | null => {
    for (const ik of ARRAY_PAYLOAD_KEYS_INNER) {
      const a = inner[ik];
      if (Array.isArray(a)) return a as Record<string, unknown>[];
    }
    return null;
  };

  for (const k of ARRAY_PAYLOAD_KEYS_OUTER) {
    const v = raw[k];
    if (Array.isArray(v)) return v as Record<string, unknown>[];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = tryNest(v as Record<string, unknown>);
      if (inner?.length ?? 0) return inner!;
    }
  }
  return [];
}

/**
 * يحمّل كتالوج التخصصات العام لتسجيل الطبيب.
 * الاستجابة المتوقعة (PDF/API-3): { doctorSpecializations: [{ id, key, text, order }] }
 *؛ قد تعود المصفوفة فارغة إذا لم يُنشئ المسؤول خيارات `DOCTOR_SPECIALIZATION` نشطة بعد.
 */
export async function fetchDoctorSignupSpecialties(): Promise<
  DoctorSignupSpecialtyOption[]
> {
  const url = doctorSpecializationsRequestUrl();
  const raw =
    ((await get<Record<string, unknown>>(url, {
      locale: 'ar',
      omitAuth: true,
    })) as Record<string, unknown> | undefined) ?? {};

  const rows = extractRows(raw);
  const mapped = rows
    .map((r) => mapLookupLikeRow(r))
    .filter((x): x is DoctorSignupSpecialtyOption => x != null);

  const seen = new Set<string>();
  return mapped.filter((m) => {
    if (seen.has(m.value)) return false;
    seen.add(m.value);
    return true;
  });
}
