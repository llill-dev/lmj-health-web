import type { FacilityType } from '@/lib/admin/types';
import type {
  DoctorFacilityRecord,
  DoctorFacilityResponse,
  DoctorFacilityMutationBody,
} from '@/lib/doctor/facilities/api-types';
import type { SuggestFacilityRecord } from '@/lib/doctor/medical-services-directory/api-types';
import type {
  DoctorFacility,
  DoctorFacilityFormValues,
  DoctorFacilityStatus,
} from '@/lib/doctor/facilities/types';

/** Legacy pseudo-keys some older facilities stored before API-3; stripped on read. */
const WORK_HOURS_FROM_PREFIX = 'work_hours_from_';
const WORK_HOURS_TO_PREFIX = 'work_hours_to_';

function optionalTrim(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeFacilityPhone(phone: string): string {
  const trimmed = phone.trim().replace(/\s+/g, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('963')) return `+${digits}`;
  if (digits.startsWith('0')) return `+963${digits.slice(1)}`;
  if (digits.startsWith('9') && digits.length === 9) return `+963${digits}`;
  return digits ? `+${digits}` : trimmed;
}

/** API-3 attributes are whitelisted snake_case keys only — never send work-hour pseudo-keys. */
function sanitizeFacilityAttributes(attributes: string[] | undefined): string[] {
  return (attributes ?? []).filter(
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
  response: DoctorFacilityResponse | Record<string, unknown>,
): DoctorFacilityRecord | null {
  const payload = response as DoctorFacilityResponse;
  const doctorRecord =
    payload.doctor && typeof payload.doctor === 'object'
      ? (payload.doctor as Record<string, unknown>)
      : null;
  if (payload.facility && typeof payload.facility === 'object') {
    return payload.facility;
  }

  if (doctorRecord?.facility && typeof doctorRecord.facility === 'object') {
    return doctorRecord.facility as DoctorFacilityRecord;
  }

  const data = payload.data;
  if (data && typeof data === 'object') {
    const record = data as DoctorFacilityRecord;
    if (
      'facility' in record &&
      record.facility &&
      typeof record.facility === 'object'
    ) {
      return record.facility as DoctorFacilityRecord;
    }
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
  if (normalized === 'ACTIVE') return 'active';
  if (normalized === 'PENDING') return 'pending';
  return 'closed';
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
    facilityType: (record.facilityType as FacilityType) ?? 'clinic',
    description: record.description?.trim() || undefined,
    city,
    address: record.address?.trim() || '—',
    phone: record.phone?.trim() || '—',
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
    facilityType: (record.facilityType as FacilityType) ?? 'clinic',
    description: record.description?.trim() || undefined,
    city,
    address: record.address?.trim() || '—',
    phone: record.phone?.trim() || '—',
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
    country: 'SY',
    address: optionalTrim(values.address),
    phone: optionalTrim(normalizeFacilityPhone(values.phone)),
    description: optionalTrim(values.description),
    ...(attributes.length ? { attributes } : {}),
  };
}

/** Strip undefined keys before POST/PUT — matches Swagger optional fields. */
export function serializeDoctorFacilityMutationBody(
  body: DoctorFacilityMutationBody,
): DoctorFacilityMutationBody {
  const next: DoctorFacilityMutationBody = {
    name: body.name,
    city: body.city,
    facilityType: body.facilityType,
    kind: body.kind,
  };

  if (body.country) next.country = body.country;
  if (body.address) next.address = body.address;
  if (body.phone) next.phone = body.phone;
  if (body.description) next.description = body.description;
  if (body.attributes?.length) next.attributes = body.attributes;

  return next;
}

export function doctorFacilityToFormValues(
  facility: DoctorFacility,
): DoctorFacilityFormValues {
  return {
    name: facility.name,
    facilityType: facility.facilityType,
    description: facility.description ?? '',
    city: facility.city,
    address: facility.address === '—' ? '' : facility.address,
    phone: facility.phone === '—' ? '' : facility.phone,
    attributes: facility.attributes ?? [],
  };
}
