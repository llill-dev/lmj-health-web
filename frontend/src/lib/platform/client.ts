import { apiRequestResult, post } from '@/lib/api';
import { resolveLabel } from '@/lib/admin/types';
import type { ServiceType, ServiceTypesListResponse } from '@/lib/admin/types';
import {
  normalizePlatformContentDetailsResponse,
  normalizePlatformContentItems,
  normalizePlatformContentListResponse,
} from '@/lib/platform/contentUtils';
import { platformEndpoints } from '@/lib/platform/endpoints';
import type {
  CreateComplaintBody,
  CreateComplaintResponse,
  PlatformContentDetails,
  PlatformContentDetailsEnvelope,
  PlatformContentSearchParams,
  PlatformContentSearchResponse,
  PlatformContentType,
  PlatformContentLanguage,
  PlatformContentListItem,
  PlatformContentListEnvelope,
  PlatformContentApiRecord,
} from '@/lib/platform/types';

export type PlatformContentListParams = {
  type?: PlatformContentType;
  language?: PlatformContentLanguage;
  page?: number;
  limit?: number;
};

type ServiceTypesEnvelope = ServiceTypesListResponse & {
  items?: ServiceType[];
  results?: ServiceType[];
  data?: ServiceTypesListResponse | { serviceTypes?: ServiceType[]; items?: ServiceType[] };
};

function asPlatformRecord(value: unknown): PlatformContentApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as PlatformContentApiRecord)
    : null;
}

function readNestedPlatformRecord(value: unknown): PlatformContentApiRecord | null {
  const record = asPlatformRecord(value);
  return asPlatformRecord(record?.data) ?? null;
}

function readPlatformField(
  value: unknown,
  key: string,
): unknown {
  return asPlatformRecord(value)?.[key];
}

function readServiceTypes(value: unknown): ServiceType[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter(
    (entry): entry is ServiceType =>
      !!entry && typeof entry === 'object' && !Array.isArray(entry),
  );
}

function readFirstServiceTypes(sources: unknown[]): ServiceType[] | undefined {
  for (const source of sources) {
    const items = readServiceTypes(source);
    if (items?.length) return items;
  }
  return undefined;
}

function normalizeServiceTypesResponse(response: ServiceTypesEnvelope): ServiceType[] {
  const record = asPlatformRecord(response) ?? {};
  const nested = readNestedPlatformRecord(record);
  return (
    readFirstServiceTypes([
      readPlatformField(response, 'serviceTypes'),
      readPlatformField(record, 'items'),
      readPlatformField(record, 'results'),
      readPlatformField(nested, 'serviceTypes'),
      readPlatformField(nested, 'items'),
    ]) ?? []
  );
}

async function readPlatformListResult<TEnvelope>(
  path: string,
  locale: PlatformContentLanguage,
  normalize: (data: TEnvelope) => PlatformContentListItem[],
): Promise<PlatformContentListItem[]> {
  const result = await apiRequestResult<TEnvelope>(path, {
    locale,
    expectedStatuses: [404],
  });
  if (!result.ok) return [];
  return normalize(result.data);
}

async function readPlatformDetailResult<TEnvelope>(
  path: string,
  locale: PlatformContentLanguage,
  normalize: (data: TEnvelope) => PlatformContentDetails | null,
): Promise<PlatformContentDetails | null> {
  const result = await apiRequestResult<TEnvelope>(path, {
    locale,
    expectedStatuses: [404],
  });
  if (!result.ok) return null;
  return normalize(result.data);
}

async function readPlatformServiceTypesResult(
  locale: PlatformContentLanguage,
): Promise<ServiceType[]> {
  const result = await apiRequestResult<ServiceTypesEnvelope>(
    platformEndpoints.serviceTypes,
    { locale, expectedStatuses: [404] },
  );
  if (!result.ok) return [];
  return normalizeServiceTypesResponse(result.data);
}

function buildContentListUrl(params: PlatformContentListParams = {}) {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  qs.set('language', params.language ?? 'ar');
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 20));
  return `${platformEndpoints.content.list}?${qs.toString()}`;
}

function buildContentSearchUrl(params: PlatformContentSearchParams) {
  const qs = new URLSearchParams();
  qs.set('q', params.q.trim());
  qs.set('language', params.language ?? 'ar');
  if (params.type) qs.set('type', params.type);
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 20));
  return `${platformEndpoints.content.search}?${qs.toString()}`;
}

export const platformApi = {
  content: {
    list: async (
      params: PlatformContentListParams = {},
    ): Promise<PlatformContentListItem[]> => {
      const locale = params.language ?? 'ar';
      return readPlatformListResult<PlatformContentListEnvelope>(
        buildContentListUrl(params),
        locale,
        normalizePlatformContentItems,
      );
    },

    listSettingsPages: (params: PlatformContentListParams = {}) =>
      platformApi.content.listSettingsPagesSafe({
        ...params,
        type: 'SETTINGS_PAGE',
      }),

    /** Returns [] on 404/empty — does not throw. */
    listSettingsPagesSafe: async (params: PlatformContentListParams = {}) => {
      const locale = params.language ?? 'ar';
      return readPlatformListResult<PlatformContentListEnvelope>(
        buildContentListUrl({ ...params, type: 'SETTINGS_PAGE' }),
        locale,
        normalizePlatformContentListResponse,
      );
    },

    search: async (
      params: PlatformContentSearchParams,
    ): Promise<PlatformContentListItem[]> => {
      const q = params.q.trim();
      if (!q) return [];

      const locale = params.language ?? 'ar';
      return readPlatformListResult<PlatformContentSearchResponse>(
        buildContentSearchUrl({ ...params, q }),
        locale,
        normalizePlatformContentItems,
      );
    },

    getBySlug: (slug: string, language: PlatformContentLanguage = 'ar') =>
      platformApi.content.getBySlugSafe(slug, language),

    /** Returns null on 404 — does not throw. */
    getBySlugSafe: async (
      slug: string,
      language: PlatformContentLanguage = 'ar',
    ): Promise<PlatformContentDetails | null> =>
      readPlatformDetailResult<PlatformContentDetailsEnvelope>(
        `${platformEndpoints.content.bySlug(slug)}?language=${language}`,
        language,
        normalizePlatformContentDetailsResponse,
      ),
  },

  complaints: {
    /** Patient-only per API-3; doctors receive 403 — handle in UI. */
    create: (body: CreateComplaintBody, locale: PlatformContentLanguage = 'ar') =>
      post<CreateComplaintResponse>(platformEndpoints.complaints.create, body, {
        locale,
      }),
  },

  serviceTypes: {
    list: async (language: PlatformContentLanguage = 'ar') => {
      const serviceTypes = await readPlatformServiceTypesResult(language);
      return serviceTypes
        .filter((service: ServiceType) => service.isActive !== false)
        .map((service: ServiceType) => ({
          id: service._id,
          slug: service.slug,
          name: resolveLabel(service.name, language) || service.slug,
          description: resolveLabel(service.description, language),
        }));
    },
  },
} as const;
