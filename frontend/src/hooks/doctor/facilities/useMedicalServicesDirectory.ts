'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAwaitingInitialQueryDataWithPlaceholder } from '@/lib/query/queryUi';
import { fetchMedicalServicesCatalog } from '@/lib/doctor/medical-services-directory/fetch';
import type {
  MedicalServiceCategory,
  MedicalServiceFacility,
} from '@/lib/doctor/medical-services-directory/types';

function buildCategoryCounts(facilities: MedicalServiceFacility[]) {
  const counts: Record<MedicalServiceCategory, number> = {
    clinics: 0,
    imaging: 0,
    treatment: 0,
    labs: 0,
  };

  for (const facility of facilities) {
    counts[facility.category] += 1;
  }

  return counts;
}

function matchesSearch(
  facility: MedicalServiceFacility,
  normalizedSearch: string,
) {
  if (!normalizedSearch) return true;
  return [
    facility.name,
    facility.location,
    facility.description,
    facility.shortDescription,
    ...facility.tags,
    ...facility.services,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
}

export function useMedicalServicesDirectory(search: string) {
  const query = useQuery({
    queryKey: ['medical-services-directory', 'catalog'] as const,
    queryFn: () => fetchMedicalServicesCatalog(),
    staleTime: 1000 * 60,
    placeholderData: (previous) => previous,
  });

  const normalizedSearch = search.trim().toLowerCase();
  const allFacilities = useMemo(
    () =>
      (query.data ?? []).filter((facility) =>
        matchesSearch(facility, normalizedSearch),
      ),
    [normalizedSearch, query.data],
  );
  const counts = useMemo(
    () => buildCategoryCounts(allFacilities),
    [allFacilities],
  );

  const isAwaitingData = isAwaitingInitialQueryDataWithPlaceholder(
    query.data,
    query.isError,
    undefined,
  );

  return {
    ...query,
    allFacilities,
    counts,
    totalAll: allFacilities.length,
    isAwaitingData,
  };
}

export function useMedicalServicesDirectoryPage(params: {
  search: string;
  category: MedicalServiceCategory;
  page: number;
  pageSize: number;
}) {
  const catalogQuery = useMedicalServicesDirectory(params.search);

  const filteredFacilities = useMemo(
    () =>
      catalogQuery.allFacilities.filter(
        (facility) => facility.category === params.category,
      ),
    [catalogQuery.allFacilities, params.category],
  );

  const total = filteredFacilities.length;
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  const facilities = filteredFacilities.slice(
    (params.page - 1) * params.pageSize,
    params.page * params.pageSize,
  );

  return {
    ...catalogQuery,
    facilities,
    total,
    totalPages,
  };
}
