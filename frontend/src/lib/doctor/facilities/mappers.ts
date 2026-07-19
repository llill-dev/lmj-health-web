import type { FacilityType } from "@/lib/admin/types";
import type {
  DoctorFacilityRecord,
  DoctorFacilityResponse,
  DoctorFacilityMutationBody,
} from "@/lib/doctor/facilities/api-types";
import type { SuggestFacilityRecord } from "@/lib/doctor/medical-services-directory/api-types";
import type {
  DoctorFacility,
  DoctorFacilityFormValues,
  DoctorFacilityStatus,
} from "@/lib/doctor/facilities/types";

/** Legacy pseudo-keys some older facilities stored before API-3; stripped on read. */
const WORK_HOURS_FROM_PREFIX = "work_hours_from_";
const WORK_HOURS_TO_PREFIX = "work_hours_to_";
const FACILITY_TYPES: readonly FacilityType[] = [
  "clinic",
  "polyclinic",
  "medical_center",
  "hospital",
  "laboratory",
  "imaging_center",
  "rehabilitation_center",
  "dialysis_center",
  "emergency_center",
];

function asDoctorFacilityRecord(value: unknown): DoctorFacilityRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DoctorFacilityRecord)
    : null;
}

function readDoctorFacilityNestedRecord(
  value: unknown,
  key: string,
): DoctorFacilityRecord | null {
  const record = asDoctorFacilityRecord(value);
  return record && key in record ? asDoctorFacilityRecord(record[key]) : null;
}

function resolveFacilityType(value: unknown): FacilityType {
  if (typeof value !== "string") return "clinic";
  const normalized = value.trim();
  return FACILITY_TYPES.find((entry) => entry === normalized) ?? "clinic";
}

function optionalTrim(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readFacilityAttributes(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeFacilityPhone(phone: string): string {
  const trimmed = phone.trim().replace(/\s+/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("963")) return `+${digits}`;
  if (digits.startsWith("0")) return `+963${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length === 9) return `+963${digits}`;
  return digits ? `+${digits}` : trimmed;
}

/** API-3 attributes are whitelisted snake_case keys only — never send work-hour pseudo-keys. */
function sanitizeFacilityAttributes(
  attributes: string[] | undefined,
): string[] {
  return readFacilityAttributes(attributes).filter(
    (item) =>
      !item.startsWith(WORK_HOURS_FROM_PREFIX) &&
      !item.startsWith(WORK_HOURS_TO_PREFIX),
  );
}

export function isPartialFacilityRecord(record: DoctorFacilityRecord): boolean {
  const id = record.id ?? record._id;
  return Boolean(id) && !record.name?.trim();
}

/** Supports API-3 `facility` and Swagger `{ data: { id } }` shapes. */
export function parseDoctorFacilityRecordFromResponse(
  response: DoctorFacilityResponse,
): DoctorFacilityRecord | null {
  const payload = response;
  const doctorRecord = payload.doctor;
  const directFacility = asDoctorFacilityRecord(payload.facility);
  if (directFacility) return directFacility;

  const doctorFacility = readDoctorFacilityNestedRecord(doctorRecord, "facility");
  if (doctorFacility) return doctorFacility;

  const data = payload.data;
  const record = asDoctorFacilityRecord(data);
  if (record) {
    const nestedFacility = readDoctorFacilityNestedRecord(record, "facility");
    if (nestedFacility) return nestedFacility;
    if (record.name?.trim() && record.city?.trim()) {
      return record;
    }
    if (record.id || record._id) {
      return record;
    }
  }

  return null;
}

export function mapApiFacilityStatus(
  status?: string | null,
): DoctorFacilityStatus {
  const normalized = status?.trim().toUpperCase();
  if (normalized === "ACTIVE") return "active";
  if (normalized === "PENDING") return "pending";
  return "closed";
}

/** Best-effort map from catalog suggest row when assign response is partial. */
export function mapSuggestRecordToLinkedDoctorFacility(
  record: SuggestFacilityRecord,
  facilityId: string,
): DoctorFacility | null {
  const name = record.name?.trim();
  const city = record.city?.trim();
  if (!name || !city) return null;

  return {
    id: facilityId,
    name,
    facilityType: resolveFacilityType(record.facilityType),
    description: record.description?.trim() || undefined,
    city,
    country: record.country?.trim() || undefined,
    address: record.address?.trim() || "—",
    phone: record.phone?.trim() || "—",
    status: mapApiFacilityStatus(record.status),
    attributes: sanitizeFacilityAttributes(record.attributes),
    isOwned: false,
  };
}

export function mapApiFacilityToDoctorFacility(
  record: DoctorFacilityRecord,
  options?: { isOwned?: boolean },
): DoctorFacility | null {
  const id = record.id ?? record._id;
  const name = record.name?.trim();
  const city = record.city?.trim();
  if (!id || !name || !city) return null;

  return {
    id,
    name,
    facilityType: resolveFacilityType(record.facilityType),
    description: record.description?.trim() || undefined,
    city,
    country: record.country?.trim() || undefined,
    address: record.address?.trim() || "—",
    phone: record.phone?.trim() || "—",
    status: mapApiFacilityStatus(record.status),
    attributes: sanitizeFacilityAttributes(record.attributes),
    isOwned: options?.isOwned ?? true,
  };
}

export function formValuesToMutationBody(
  values: DoctorFacilityFormValues,
  existingAttributes?: string[],
): DoctorFacilityMutationBody {
  const attributes = sanitizeFacilityAttributes(
    values.attributes?.length ? values.attributes : existingAttributes,
  );

  return {
    name: values.name.trim(),
    facilityType: values.facilityType,
    kind: values.facilityType,
    city: values.city.trim(),
    country: values.country.trim(),
    address: values.address.trim(),
    phone: normalizeFacilityPhone(values.phone),
    description: optionalTrim(values.description) ?? "بلا وصف",
    attributes,
  };
}

/** Build the exact Swagger POST/PUT body; the backend validates these keys. */
export function serializeDoctorFacilityMutationBody(
  body: DoctorFacilityMutationBody,
): DoctorFacilityMutationBody {
  const next: DoctorFacilityMutationBody = {
    name: body.name,
    city: body.city,
    facilityType: body.facilityType,
    kind: body.kind,
    country: body.country,
    address: body.address,
    phone: body.phone,
    description: body.description,
    attributes: readFacilityAttributes(body.attributes),
  };

  return next;
}

export function doctorFacilityToFormValues(
  facility: DoctorFacility,
): DoctorFacilityFormValues {
  return {
    name: facility.name,
    facilityType: facility.facilityType,
    description: facility.description ?? "",
    city: facility.city,
    country: facility.country ?? "سوريا",
    address: facility.address === "—" ? "" : facility.address,
    phone: facility.phone === "—" ? "" : facility.phone,
    attributes: readFacilityAttributes(facility.attributes),
  };
}
