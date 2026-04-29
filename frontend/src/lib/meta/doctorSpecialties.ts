import { get } from '@/lib/base';
import { resolveLookupText } from '@/lib/admin/lookupUtils';
import type { AdminLocalizedLookupText } from '@/lib/admin/types';
import { metaEndpoints } from '@/lib/meta/endpoints';
import type { DoctorSignupSpecialtyOption } from '@/lib/meta/types';

function specialtyEndpoint(): string {
  const override = import.meta.env.VITE_PUBLIC_DOCTOR_SPECIALTIES_PATH?.trim();
  return override || metaEndpoints.doctorSpecialties;
}

function mapLookupLikeRow(row: Record<string, unknown>): DoctorSignupSpecialtyOption | null {
  const rawText = row.text as AdminLocalizedLookupText | undefined;
  const labelAr = resolveLookupText(rawText ?? '', 'ar').trim();
  const labelEn = resolveLookupText(rawText ?? '', 'en').trim();
  const key = String(row.key ?? row._id ?? row.id ?? '').trim();
  /** يُفضَّل إرسال الاسم العربي كما في الكتالوج؛ إن غاب استخدم الإنجليزي أو المفتاح */
  const value = labelAr || labelEn || key;
  if (!value) return null;
  return {
    key: key || value,
    labelAr: labelAr || labelEn || value,
    value,
  };
}

function extractRows(raw: Record<string, unknown>): Record<string, unknown>[] {
  for (const k of [
    'specialties',
    'lookups',
    'options',
    'items',
    'results',
    'data',
  ] as const) {
    const v = raw[k];
    if (Array.isArray(v)) return v as Record<string, unknown>[];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>;
      for (const ik of ['items', 'results', 'specialties'] as const) {
        const a = inner[ik];
        if (Array.isArray(a)) return a as Record<string, unknown>[];
      }
    }
  }
  return [];
}

/**
 * يحمّل خيارات التخصص للتسجيل كطبيب عبر GET عام (بدون JWT).
 * يُفترض أن يعيد الخادم مصفوفة بنفس شكل عناصر lookups النشطة أو ما يعادلها.
 */
export async function fetchDoctorSignupSpecialties(): Promise<
  DoctorSignupSpecialtyOption[]
> {
  const endpoint = specialtyEndpoint();
  const raw =
    ((await get<Record<string, unknown>>(endpoint, {
      locale: 'ar',
    })) as Record<string, unknown> | undefined) ?? {};

  const rows = extractRows(raw);
  const mapped = rows
    .map((r) => mapLookupLikeRow(r))
    .filter((x): x is DoctorSignupSpecialtyOption => x != null);

  mapped.sort((a, b) =>
    a.labelAr.localeCompare(b.labelAr, 'ar', { sensitivity: 'base' }),
  );

  const seen = new Set<string>();
  return mapped.filter((m) => {
    if (seen.has(m.value)) return false;
    seen.add(m.value);
    return true;
  });
}
