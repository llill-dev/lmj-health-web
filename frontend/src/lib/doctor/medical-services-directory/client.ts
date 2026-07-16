import { get } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import type {
  DirectoryObjectIdLike,
  FacilitiesSuggestParams,
  FacilitiesSuggestResponse,
  FacilityTypesResponse,
  SuggestFacilityRecord,
} from '@/lib/doctor/medical-services-directory/api-types';

function asDirectoryObjectIdLike(value: unknown): DirectoryObjectIdLike | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
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
  return {
    ...response,
    facilities: (response.facilities ?? []).map(normalizeSuggestFacility),
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
    }),
};
