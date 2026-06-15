import { medicalServicesDirectoryApi } from '@/lib/doctor/medical-services-directory/client';
import { MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES } from '@/lib/doctor/medical-services-directory/category-map';
import { mergeSuggestFacilities } from '@/lib/doctor/medical-services-directory/mappers';
import type { MedicalServiceCategory } from '@/lib/doctor/medical-services-directory/types';
import type { FacilityType } from '@/lib/admin/types';

export const MEDICAL_SERVICES_DIRECTORY_SUGGEST_LIMIT = 20;

export function getAllMedicalServiceFacilityTypes(): FacilityType[] {
  const unique = new Set<FacilityType>();
  for (const types of Object.values(MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES)) {
    for (const type of types) unique.add(type);
  }
  return [...unique];
}

async function fetchSuggestBatch(
  search: string | undefined,
  kind: FacilityType,
) {
  const response = await medicalServicesDirectoryApi.suggest({
    q: search?.trim() || undefined,
    kind,
    limit: MEDICAL_SERVICES_DIRECTORY_SUGGEST_LIMIT,
  });
  return response.facilities ?? [];
}

export async function fetchMedicalServicesCatalog(search?: string) {
  const normalizedSearch = search?.trim();
  const kinds = getAllMedicalServiceFacilityTypes();

  const results = await Promise.allSettled(
    kinds.map((kind) => fetchSuggestBatch(normalizedSearch, kind)),
  );

  const batches: Awaited<ReturnType<typeof fetchSuggestBatch>>[] = [];
  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      batches.push(result.value);
    } else {
      failures.push(result.reason);
    }
  }

  if (batches.length === 0) {
    throw failures[0] ?? new Error('facilities_catalog_unavailable');
  }

  return mergeSuggestFacilities(batches);
}

export async function fetchMedicalServicesByCategory(
  category: MedicalServiceCategory,
  search?: string,
) {
  const kinds = MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES[category];
  const normalizedSearch = search?.trim();

  const results = await Promise.allSettled(
    kinds.map((kind) => fetchSuggestBatch(normalizedSearch, kind)),
  );

  const batches: Awaited<ReturnType<typeof fetchSuggestBatch>>[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') batches.push(result.value);
  }

  if (batches.length === 0) {
    const failed = results.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult | undefined;
    throw failed?.reason ?? new Error('facilities_category_unavailable');
  }

  return mergeSuggestFacilities(batches);
}
