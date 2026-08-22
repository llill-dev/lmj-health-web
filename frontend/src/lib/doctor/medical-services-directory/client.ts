import { get } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import type {
  DirectoryObjectIdLike,
  FacilitiesSuggestParams,
  FacilitiesSuggestResponse,
  FacilityTypesResponse,
  FacilityTypeOption,
  SuggestFacilityRecord,
} from '@/lib/doctor/medical-services-directory/api-types';

function asDirectoryObjectIdLike(value: unknown): DirectoryObjectIdLike | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DirectoryObjectIdLike)
    : null;
}

function readDirectoryNestedRecord(
  value: unknown,
): DirectoryObjectIdLike | null {
  const record = asDirectoryObjectIdLike(value);
  return record
    ? (asDirectoryObjectIdLike(
        (record as DirectoryObjectIdLike & { data?: unknown }).data,
      ) ?? null)
    : null;
}

function readDirectoryField(
  value: unknown,
  key: string,
): unknown {
  return asDirectoryObjectIdLike(value)?.[key];
}

function readFirstDirectoryArray<T>(
  sources: unknown[],
  mapEntry: (value: unknown) => T | null,
): T[] | undefined {
  for (const source of sources) {
    const items = readDirectoryArray(source, mapEntry);
    if (items) return items;
  }
  return undefined;
}

function readDirectoryArray<T>(
  value: unknown,
  mapEntry: (value: unknown) => T | null,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map(mapEntry)
    .filter((entry): entry is T => entry != null);
  return items.length > 0 ? items : undefined;
}

function stringifyRecordId(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  const record = asDirectoryObjectIdLike(value);
  if (record) {
    if (typeof record.$oid === 'string') return record.$oid;
    if (typeof record.toString === 'function') {
      const text = String(record.toString()).trim();
      if (text && text !== '[object Object]') return text;
    }
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asSuggestFacilityRecord(value: unknown): SuggestFacilityRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as SuggestFacilityRecord)
    : null;
}

function readSuggestFacilities(value: unknown): SuggestFacilityRecord[] | undefined {
  return readDirectoryArray(value, (entry) => {
    const record = asSuggestFacilityRecord(entry);
    return record ? normalizeSuggestFacility(record) : null;
  });
}

function asFacilityTypeOption(value: unknown): FacilityTypeOption | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as FacilityTypeOption)
    : null;
}

function readFacilityTypes(value: unknown): FacilityTypeOption[] | undefined {
  return readDirectoryArray(value, asFacilityTypeOption);
}

function normalizeSuggestFacility(
  facility: SuggestFacilityRecord,
): SuggestFacilityRecord {
  const id = stringifyRecordId(facility.id) ?? stringifyRecordId(facility._id);
  return {
    ...facility,
    id,
    _id: id ?? facility._id,
  };
}

function normalizeSuggestResponse(
  response: FacilitiesSuggestResponse,
): FacilitiesSuggestResponse {
  const record = asDirectoryObjectIdLike(response);
  const nested = readDirectoryNestedRecord(record);
  const facilities = readFirstDirectoryArray(
    [
      response.facilities,
      readDirectoryField(record, 'items'),
      readDirectoryField(record, 'results'),
      readDirectoryField(nested, 'facilities'),
      readDirectoryField(nested, 'items'),
    ],
    (entry) => {
      const facility = asSuggestFacilityRecord(entry);
      return facility ? normalizeSuggestFacility(facility) : null;
    },
  ) ?? [];

  return {
    ...response,
    results:
      readNumber(response.results) ??
      readNumber(readDirectoryField(record, 'results')) ??
      readNumber(readDirectoryField(nested, 'results')) ??
      facilities.length,
    facilities,
  };
}

function normalizeFacilityTypesResponse(
  response: FacilityTypesResponse,
): FacilityTypesResponse {
  const record = asDirectoryObjectIdLike(response);
  const nested = readDirectoryNestedRecord(record);

  return {
    ...response,
    types: readFirstDirectoryArray(
      [
        response.types,
        readDirectoryField(record, 'items'),
        readDirectoryField(record, 'types'),
        readDirectoryField(nested, 'types'),
        readDirectoryField(nested, 'items'),
      ],
      asFacilityTypeOption,
    ) ?? [],
  };
}

function buildSuggestQuery(params: FacilitiesSuggestParams = {}): string {
  const qs = new URLSearchParams();
  const q = params.q?.trim();
  if (q && q.length >= 2) qs.set('q', q);
  if (params.city?.trim()) qs.set('city', params.city.trim());
  if (params.facilityType) qs.set('facilityType', String(params.facilityType));
  else if (params.kind) qs.set('kind', String(params.kind));
  if (params.limit != null) qs.set('limit', String(params.limit));
  return qs.toString();
}

export const medicalServicesDirectoryApi = {
  suggest: async (params: FacilitiesSuggestParams = {}) => {
    const query = buildSuggestQuery(params);
    const response = await get<FacilitiesSuggestResponse>(
      query
        ? `${doctorEndpoints.facilities.suggest}?${query}`
        : doctorEndpoints.facilities.suggest,
      { locale: 'ar' },
    );
    return normalizeSuggestResponse(response);
  },

  listTypes: () =>
    get<FacilityTypesResponse>(doctorEndpoints.facilities.types, {
      locale: 'ar',
    }).then(normalizeFacilityTypesResponse),
};
