import { get } from "@/lib/api";
import { resolveLookupText } from "@/lib/admin/lookups/lookupUtils";
import type { AdminLocalizedLookupText } from "@/lib/admin/types";
import { authEndpoints } from "@/lib/auth/endpoints";
import type {
  DoctorSignupSpecialtyOption,
  DoctorSpecialtiesMetaResponse,
} from "@/lib/auth/types";

type DoctorSpecialtiesApiRecord = {
  [key: string]: unknown;
};

function asDoctorSpecialtiesRecord(
  value: unknown,
): DoctorSpecialtiesApiRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

function asDoctorSpecialtiesRows(
  value: unknown,
): DoctorSpecialtiesApiRecord[] | null {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is DoctorSpecialtiesApiRecord =>
          !!entry && typeof entry === "object" && !Array.isArray(entry),
      )
    : null;
}

function asLocalizedLookupText(
  value: unknown,
): AdminLocalizedLookupText | undefined {
  const record = asDoctorSpecialtiesRecord(value);
  if (!record) return undefined;
  return typeof record.ar === "string" || typeof record.en === "string"
    ? record
    : undefined;
}

/** PDF: GET /meta/doctor-specializations مع `includeAllLangs=true` تعيد حقول `{ ar, en }` للنص. */
function doctorSpecializationsRequestUrl(): string {
  const override =
    import.meta.env.VITE_PUBLIC_DOCTOR_SPECIALTIES_PATH?.trim() ?? "";
  const base =
    override.length > 0 ? override : authEndpoints.doctorSpecialties();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}includeAllLangs=true`;
}

function mapLookupLikeRow(
  row: DoctorSpecialtiesApiRecord,
): DoctorSignupSpecialtyOption | null {
  const rawText = asLocalizedLookupText(row.text);
  const fallbackLabel = String(row.label ?? row.name ?? row.title ?? "").trim();
  const labelAr = resolveLookupText(rawText ?? fallbackLabel, "ar").trim();
  const labelEn = resolveLookupText(rawText ?? fallbackLabel, "en").trim();
  const key = String(row.key ?? "").trim();
  if (!key) return null;
  const label = labelAr || labelEn || fallbackLabel || key;
  if (!label) return null;
  return {
    key,
    labelAr: label,
    ...(labelEn ? { labelEn } : {}),
    value: key,
  };
}

const ARRAY_PAYLOAD_KEYS_OUTER = [
  "doctorSpecializations",
  "specialties",
  "lookups",
  "options",
  "items",
  "results",
  "data",
  "payload",
  "response",
  "content",
  "result",
] as const;

const ARRAY_PAYLOAD_KEYS_INNER = [
  "doctorSpecializations",
  "items",
  "results",
  "specialties",
  "lookups",
  "options",
  "data",
  "records",
  "result",
] as const;

function extractRows(raw: DoctorSpecialtiesApiRecord): DoctorSpecialtiesApiRecord[] {
  const tryNest = (
    inner: DoctorSpecialtiesApiRecord,
  ): DoctorSpecialtiesApiRecord[] | null => {
    for (const ik of ARRAY_PAYLOAD_KEYS_INNER) {
      const a = inner[ik];
      const rows = asDoctorSpecialtiesRows(a);
      if (rows) return rows;
    }
    return null;
  };

  for (const k of ARRAY_PAYLOAD_KEYS_OUTER) {
    const v = raw[k];
    const rows = asDoctorSpecialtiesRows(v);
    if (rows) return rows;
    const nested = asDoctorSpecialtiesRecord(v);
    if (nested) {
      const inner = tryNest(nested);
      if (inner && inner.length > 0) return inner;
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
  const raw = (await get<DoctorSpecialtiesMetaResponse>(url, {
    locale: "ar",
    omitAuth: true,
  })) ?? {};

  const rows = extractRows(asDoctorSpecialtiesRecord(raw) ?? {});
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
