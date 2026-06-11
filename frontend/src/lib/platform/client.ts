import { apiRequestResult, post } from '@/lib/api';
import { resolveLabel } from '@/lib/admin/types';
import type { ServiceType, ServiceTypesListResponse } from '@/lib/admin/types';
import {
  normalizePlatformContentDetailsResponse,
  normalizePlatformContentListResponse,
} from '@/lib/platform/contentUtils';
import { platformEndpoints } from '@/lib/platform/endpoints';
import type {
  CreateComplaintBody,
  CreateComplaintResponse,
  PlatformContentDetails,
  PlatformContentLanguage,
  PlatformServiceTypeItem,
  PlatformSettingsListItem,
} from '@/lib/platform/types';

export type PlatformContentListParams = {
  type?: 'SETTINGS_PAGE';
  language?: PlatformContentLanguage;
  page?: number;
  limit?: number;
};

function buildContentListUrl(params: PlatformContentListParams = {}) {
  const qs = new URLSearchParams();
  qs.set('type', params.type ?? 'SETTINGS_PAGE');
  qs.set('language', params.language ?? 'ar');
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 20));
  return `${platformEndpoints.content.list}?${qs.toString()}`;
}

export const platformApi = {
  content: {
    listSettingsPages: (params: PlatformContentListParams = {}) =>
      platformApi.content.listSettingsPagesSafe(params).then(
        (items) => items ?? [],
      ),

    /** Returns [] on 404/empty — does not throw. */
    listSettingsPagesSafe: async (params: PlatformContentListParams = {}) => {
      const locale = params.language ?? 'ar';
      const result = await apiRequestResult<Record<string, unknown>>(
        buildContentListUrl(params),
        { locale, expectedStatuses: [404] },
      );

      if (!result.ok) return [];
      return normalizePlatformContentListResponse(result.data);
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
      const result = await apiRequestResult<Record<string, unknown>>(
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
