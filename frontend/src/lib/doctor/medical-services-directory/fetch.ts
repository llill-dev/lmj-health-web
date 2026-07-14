import { get } from '@/lib/api';
import { adminEndpoints } from '@/lib/admin/endpoints';
import type {
  ServiceProvider,
  ServiceProvidersListResponse,
} from '@/lib/admin/types';
import { platformApi } from '@/lib/platform/client';
import { mergeServiceProviders } from '@/lib/doctor/medical-services-directory/mappers';
import type {
  MedicalServiceCategory,
  MedicalServiceFacility,
} from '@/lib/doctor/medical-services-directory/types';

export const MEDICAL_SERVICES_DIRECTORY_LIST_LIMIT = 50;

function resolveCategoryForServiceType(input: string): MedicalServiceCategory {
  const normalized = input.trim().toLowerCase();
  if (
    normalized.includes('lab') ||
    normalized.includes('مختبر') ||
    normalized.includes('تحاليل')
  ) {
    return 'labs';
  }
  if (
    normalized.includes('imag') ||
    normalized.includes('radi') ||
    normalized.includes('scan') ||
    normalized.includes('أشعة') ||
    normalized.includes('تصوير')
  ) {
    return 'imaging';
  }
  if (
    normalized.includes('dialysis') ||
    normalized.includes('rehab') ||
    normalized.includes('therapy') ||
    normalized.includes('treat') ||
    normalized.includes('غسيل') ||
    normalized.includes('تأهيل') ||
    normalized.includes('علاج')
  ) {
    return 'treatment';
  }
  return 'clinics';
}

async function fetchProvidersPage(typeSlug: string, cursor?: string) {
  const qs = new URLSearchParams();
  qs.set('type', typeSlug);
  qs.set('limit', String(MEDICAL_SERVICES_DIRECTORY_LIST_LIMIT));
  if (cursor) qs.set('cursor', cursor);

  return get<ServiceProvidersListResponse>(
    `${adminEndpoints.serviceProviders.list}?${qs.toString()}`,
    { locale: 'ar' },
  );
}

type ServiceProviderDetailsResponse = {
  item?: ServiceProvider;
  provider?: ServiceProvider;
  data?: ServiceProvider | { item?: ServiceProvider; provider?: ServiceProvider };
};

function normalizeServiceProviderDetailsResponse(
  response: ServiceProviderDetailsResponse,
): ServiceProvider | null {
  if (response.item) return response.item;
  if (response.provider) return response.provider;
  if (response.data && 'serviceType' in response.data) {
    return response.data as ServiceProvider;
  }
  if (response.data && typeof response.data === 'object') {
    const nested = response.data as { item?: ServiceProvider; provider?: ServiceProvider };
    return nested.item ?? nested.provider ?? null;
  }
  return null;
}

async function fetchAllProvidersForType(typeSlug: string) {
  const collected: ServiceProvider[] = [];
  let cursor: string | null | undefined = undefined;
  let safety = 0;

  do {
    const response = await fetchProvidersPage(typeSlug, cursor ?? undefined);
    collected.push(...(response.items ?? []));
    cursor = response.nextCursor;
    safety += 1;
  } while (cursor && safety < 10);

  return collected;
}

async function fetchDirectoryServiceTypes() {
  const serviceTypes = await platformApi.serviceTypes.list('ar');
  const labelsBySlug: Record<string, string> = {};
  const grouped: Record<MedicalServiceCategory, string[]> = {
    clinics: [],
    imaging: [],
    treatment: [],
    labs: [],
  };

  for (const serviceType of serviceTypes) {
    labelsBySlug[serviceType.slug] = serviceType.name;
    const category = resolveCategoryForServiceType(
      `${serviceType.slug} ${serviceType.name} ${serviceType.description ?? ''}`,
    );
    grouped[category].push(serviceType.slug);
  }

  return { grouped, labelsBySlug };
}

export async function fetchMedicalServicesCatalog(search?: string) {
  const { grouped, labelsBySlug } = await fetchDirectoryServiceTypes();
  const typeSlugs = Array.from(
    new Set(Object.values(grouped).flat().filter(Boolean)),
  );

  const results = await Promise.allSettled(
    typeSlugs.map((typeSlug) => fetchAllProvidersForType(typeSlug)),
  );

  const batches: ServiceProvider[][] = [];
  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      batches.push(result.value);
    } else {
      failures.push(result.reason);
    }
  }

  if (batches.length === 0) {
    throw failures[0] ?? new Error('services_catalog_unavailable');
  }

  return mergeServiceProviders(batches, {
    search,
    serviceTypeLabelsBySlug: labelsBySlug,
  });
}

export async function fetchMedicalServicesByCategory(
  category: MedicalServiceCategory,
  search?: string,
) {
  const { grouped, labelsBySlug } = await fetchDirectoryServiceTypes();
  const typeSlugs = grouped[category] ?? [];

  const results = await Promise.allSettled(
    typeSlugs.map((typeSlug) => fetchAllProvidersForType(typeSlug)),
  );

  const batches: ServiceProvider[][] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') batches.push(result.value);
  }

  if (batches.length === 0) {
    const failed = results.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult | undefined;
    throw failed?.reason ?? new Error('services_category_unavailable');
  }

  return mergeServiceProviders(batches, {
    search,
    serviceTypeLabelsBySlug: labelsBySlug,
  }).filter((facility) => facility.category === category);
}

export async function fetchMedicalServiceProviderDetails(
  id: string,
): Promise<ServiceProvider | null> {
  const response = await get<ServiceProviderDetailsResponse>(
    adminEndpoints.serviceProviders.getById(id),
    { locale: 'ar' },
  );
  return normalizeServiceProviderDetailsResponse(response);
}

export async function fetchMedicalServiceDetails(
  id: string,
): Promise<MedicalServiceFacility | null> {
  const provider = await fetchMedicalServiceProviderDetails(id);
  if (!provider) return null;
  return mergeServiceProviders([[provider]])[0] ?? null;
}
