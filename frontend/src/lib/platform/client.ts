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
} from '@/lib/platform/types';

export type PlatformContentListParams = {
  type?: PlatformContentType;
  language?: PlatformContentLanguage;
  page?: number;
  limit?: number;
};

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
      const result = await apiRequestResult<PlatformContentListEnvelope>(
        buildContentListUrl(params),
        { locale, expectedStatuses: [404] },
      );

      if (!result.ok) return [];
      return normalizePlatformContentItems(result.data);
    },

    listSettingsPages: (params: PlatformContentListParams = {}) =>
      platformApi.content
        .listSettingsPagesSafe({ ...params, type: 'SETTINGS_PAGE' })
        .then(
        (items) => items ?? [],
      ),

    /** Returns [] on 404/empty — does not throw. */
    listSettingsPagesSafe: async (params: PlatformContentListParams = {}) => {
      const locale = params.language ?? 'ar';
      const result = await apiRequestResult<PlatformContentListEnvelope>(
        buildContentListUrl({ ...params, type: 'SETTINGS_PAGE' }),
        { locale, expectedStatuses: [404] },
      );

      if (!result.ok) return [];
      return normalizePlatformContentListResponse(result.data);
    },

    search: async (
      params: PlatformContentSearchParams,
    ): Promise<PlatformContentListItem[]> => {
      const q = params.q.trim();
      if (!q) return [];

      const locale = params.language ?? 'ar';
      const result = await apiRequestResult<PlatformContentSearchResponse>(
        buildContentSearchUrl({ ...params, q }),
        { locale, expectedStatuses: [404] },
      );

      if (!result.ok) return [];
      return normalizePlatformContentItems(result.data);
    },

    getBySlug: (slug: string, language: PlatformContentLanguage = 'ar') =>
      platformApi.content.getBySlugSafe(slug, language).then(
        (item) => item,
      ),

    /** Returns null on 404 — does not throw. */
    getBySlugSafe: async (
      slug: string,
      language: PlatformContentLanguage = 'ar',
    ): Promise<PlatformContentDetails | null> => {
      const result = await apiRequestResult<PlatformContentDetailsEnvelope>(
        `${platformEndpoints.content.bySlug(slug)}?language=${language}`,
        { locale: language, expectedStatuses: [404] },
      );

      if (!result.ok) return null;
      return normalizePlatformContentDetailsResponse(result.data);
    },
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
      const result = await apiRequestResult<ServiceTypesListResponse>(
        platformEndpoints.serviceTypes,
        { locale: language, expectedStatuses: [404] },
      );

      if (!result.ok) return [];

      return (result.data.serviceTypes ?? [])
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
