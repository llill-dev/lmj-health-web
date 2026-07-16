import type { AdminLookupRecord } from "@/lib/admin/types";
import {
  resolveLookupSecondaryText,
  resolveLookupText,
} from "@/lib/admin/lookups/lookupUtils";

export type DoctorSpecializationReviewMode =
  | "catalog"
  | "custom_pending"
  | "unknown";

type DoctorSpecializationReviewRecord = {
  [key: string]: unknown;
};

function asDoctorSpecializationReviewRecord(
  value: unknown,
): DoctorSpecializationReviewRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DoctorSpecializationReviewRecord)
    : {};
}

export type DoctorSpecializationReviewState = {
  displayLabel: string;
  mode: DoctorSpecializationReviewMode;
  specializationKey: string | null;
  customSpecializationText: string | null;
  needsAdminResolve: boolean;
  statusLabel: string;
  statusTone: "success" | "warning" | "neutral";
};

export type DoctorSpecializationReviewSource =
  | DoctorSpecializationReviewRecord
  | null
  | undefined;

function readString(
  raw: DoctorSpecializationReviewRecord,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readPendingFlag(raw: DoctorSpecializationReviewRecord): boolean {
  const boolKeys = [
    "customSpecializationPending",
    "hasPendingCustomSpecialization",
    "pendingCustomSpecialization",
    "requiresSpecializationResolve",
  ];
  for (const key of boolKeys) {
    if (raw[key] === true) return true;
  }

  const status = readString(
    raw,
    "customSpecializationStatus",
    "specializationStatus",
    "specializationResolveStatus",
  );
  if (!status) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "pending" ||
    normalized === "unresolved" ||
    normalized === "requested"
  );
}

/** يستنتج حالة التخصص من كائن الطبيب/طلب التحقق (حقول API-3 + بدائل شائعة). */
export function resolveDoctorSpecializationReviewState(
  source: DoctorSpecializationReviewSource,
  lookups?: AdminLookupRecord[],
): DoctorSpecializationReviewState {
  const raw = asDoctorSpecializationReviewRecord(source);
  const specializationKey = readString(
    raw,
    "specializationKey",
    "specializationLookupKey",
  );
  const customSpecializationText = readString(
    raw,
    "customSpecializationText",
    "pendingCustomSpecializationText",
    "requestedCustomSpecialization",
  );
  const displayLabel =
    readString(raw, "specialization") ??
    customSpecializationText ??
    specializationKey ??
    "—";

  const pendingExplicit = readPendingFlag(raw);

  // Check if specialization exists in lookups (try both key and text)
  const existsInCatalog = lookups
    ? Boolean(
        findDoctorSpecializationLookupId(lookups, specializationKey) ||
        findDoctorSpecializationLookupId(lookups, customSpecializationText) ||
        findDoctorSpecializationLookupId(lookups, displayLabel),
      )
    : Boolean(specializationKey);

  const needsAdminResolve = Boolean(
    pendingExplicit ||
    (customSpecializationText && !existsInCatalog && !specializationKey),
  );

  let mode: DoctorSpecializationReviewMode = "unknown";
  if (needsAdminResolve) mode = "custom_pending";
  else if (existsInCatalog) mode = "catalog";

  if (mode === "catalog") {
    return {
      displayLabel,
      mode,
      specializationKey,
      customSpecializationText,
      needsAdminResolve: false,
      statusLabel: "مرتبط بالقائمة المعتمدة",
      statusTone: "success",
    };
  }

  if (mode === "custom_pending") {
    return {
      displayLabel,
      mode,
      specializationKey,
      customSpecializationText,
      needsAdminResolve: true,
      statusLabel: "إدخال يدوي — بانتظار الربط",
      statusTone: "warning",
    };
  }

  return {
    displayLabel,
    mode,
    specializationKey,
    customSpecializationText,
    needsAdminResolve: true,
    statusLabel: "غير محدّد — يحتاج مراجعة",
    statusTone: "neutral",
  };
}

export function findDoctorSpecializationLookupId(
  lookups: AdminLookupRecord[],
  specializationKey: string | null,
): string | null {
  if (!specializationKey) return null;
  const normalized = specializationKey.trim().toLowerCase();

  // First try matching by key
  const keyMatch = lookups.find(
    (row) => row.key.trim().toLowerCase() === normalized && row.isActive,
  );
  if (keyMatch) return keyMatch._id ?? null;

  // If no key match, try matching by Arabic or English text
  const textMatch = lookups.find((row) => {
    if (!row.isActive) return false;
    const labelAr =
      resolveLookupText(row.text, "ar")?.trim().toLowerCase() || "";
    const labelEn =
      resolveLookupSecondaryText(row.text, "ar")?.trim().toLowerCase() || "";
    return labelAr === normalized || labelEn === normalized;
  });

  return textMatch?._id ?? null;
}

export function buildDoctorSpecializationLookupOptions(
  lookups: AdminLookupRecord[],
): Array<{ value: string; label: string; key: string }> {
  return [...lookups]
    .filter((row) => row.isActive)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.key.localeCompare(b.key, "en"),
    )
    .map((row) => {
      const labelAr = resolveLookupText(row.text, "ar");
      const labelEn = resolveLookupSecondaryText(row.text, "ar");
      const label = labelAr || labelEn || row.key;
      return {
        value: row._id,
        label: labelEn ? `${label} (${labelEn})` : `${label} · ${row.key}`,
        key: row.key,
      };
    });
}
