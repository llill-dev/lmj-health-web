import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  extractAboutSummary,
  extractContactChannelsFromBlocks,
  extractFaqItemsFromBlocks,
  mapContentToLegalDocument,
} from '@/lib/platform/contentUtils';
import { platformApi } from '@/lib/platform/client';
import type { PlatformSettingsSlug } from '@/lib/platform/endpoints';
import { resolvePublishedSettingsSlug } from '@/lib/platform/resolveSettingsSlug';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  PlatformContentLanguage,
  PlatformLegalDocument,
} from '@/lib/platform/types';
import { PLATFORM_FAQ_ITEMS } from '@/lib/platform/faqData';
import {
  PRIVACY_POLICY,
  TERMS_OF_USE,
  USAGE_POLICY,
} from '@/lib/platform/legalContent';

const STALE_MS = 1000 * 60 * 10;

const CATALOG_QUERY_KEY = (language: PlatformContentLanguage) =>
  ['platform', 'settings-catalog', language] as const;

export function usePlatformSettingsCatalog(
  language: PlatformContentLanguage = 'ar',
) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEY(language),
    queryFn: () => platformApi.content.listSettingsPagesSafe({ language, limit: 20 }),
    staleTime: STALE_MS,
    retry: false,
  });
}

function usePlatformContentBySettingsKey(
  key: PlatformSettingsSlug,
  language: PlatformContentLanguage = 'ar',
) {
  const catalogQuery = usePlatformSettingsCatalog(language);

  const publishedSlug = useMemo(
    () => resolvePublishedSettingsSlug(catalogQuery.data, key),
    [catalogQuery.data, key],
  );

  const contentQuery = useQuery({
    queryKey: ['platform', 'content', key, publishedSlug, language],
    queryFn: () =>
      platformApi.content.getBySlugSafe(String(publishedSlug), language),
    enabled: Boolean(publishedSlug) && catalogQuery.isSuccess,
    staleTime: STALE_MS,
    retry: false,
  });

  const catalogAwaiting = isAwaitingInitialQueryData(
    catalogQuery.data,
    catalogQuery.isError,
  );
  const contentAwaiting = publishedSlug
    ? isAwaitingInitialQueryData(contentQuery.data, contentQuery.isError)
    : false;

  return {
    catalogQuery,
    contentQuery,
    data: contentQuery.data ?? null,
    isAwaitingData: catalogAwaiting || contentAwaiting,
  };
}

export function usePlatformSettingsPages(language: PlatformContentLanguage = 'ar') {
  return usePlatformSettingsCatalog(language);
}

/** @deprecated Prefer keyed hooks; kept for compatibility. */
export function usePlatformContentBySlug(
  slug: string | null | undefined,
  language: PlatformContentLanguage = 'ar',
) {
  const catalogQuery = usePlatformSettingsCatalog(language);

  const publishedSlug = useMemo(() => {
    if (!slug || !catalogQuery.data?.length) return null;
    const normalized = slug.trim().toLowerCase();
    const match = catalogQuery.data.find(
      (row) => row.slug.trim().toLowerCase() === normalized,
    );
    return match?.slug ?? null;
  }, [catalogQuery.data, slug]);

  return useQuery({
    queryKey: ['platform', 'content', 'raw-slug', publishedSlug, language],
    queryFn: () =>
      platformApi.content.getBySlugSafe(String(publishedSlug), language),
    enabled: Boolean(publishedSlug) && catalogQuery.isSuccess,
    staleTime: STALE_MS,
    retry: false,
  });
}

export function usePlatformFaqContent(language: PlatformContentLanguage = 'ar') {
  const { data, isAwaitingData } = usePlatformContentBySettingsKey(
    'faq',
    language,
  );

  const items = useMemo(() => {
    if (!data?.contentBlocks?.length) return PLATFORM_FAQ_ITEMS;
    const fromApi = extractFaqItemsFromBlocks(data.contentBlocks);
    return fromApi.length ? fromApi : PLATFORM_FAQ_ITEMS;
  }, [data]);

  return { data, isAwaitingData, items };
}

export function usePlatformLegalContent(
  key: PlatformSettingsSlug,
  fallback: PlatformLegalDocument,
  language: PlatformContentLanguage = 'ar',
) {
  const { data, isAwaitingData } = usePlatformContentBySettingsKey(
    key,
    language,
  );

  const document = useMemo(() => {
    if (!data) return fallback;
    return mapContentToLegalDocument(data);
  }, [data, fallback]);

  return { data, isAwaitingData, document };
}

export function usePlatformTermsContent(language: PlatformContentLanguage = 'ar') {
  return usePlatformLegalContent(
    'terms',
    mapContentToLegalDocument({
      id: TERMS_OF_USE.id,
      type: 'SETTINGS_PAGE',
      title: TERMS_OF_USE.title,
      slug: TERMS_OF_USE.id,
      contentBlocks: [{ type: 'paragraph', text: TERMS_OF_USE.body }],
      pageVersion: null,
      publishedAt: TERMS_OF_USE.lastUpdated,
    }),
    language,
  );
}

export function usePlatformPrivacyContent(language: PlatformContentLanguage = 'ar') {
  return usePlatformLegalContent(
    'privacy-policy',
    mapContentToLegalDocument({
      id: PRIVACY_POLICY.id,
      type: 'SETTINGS_PAGE',
      title: PRIVACY_POLICY.title,
      slug: PRIVACY_POLICY.id,
      contentBlocks: [{ type: 'paragraph', text: PRIVACY_POLICY.body }],
      pageVersion: null,
      publishedAt: PRIVACY_POLICY.lastUpdated,
    }),
    language,
  );
}

export function usePlatformUsageContent(language: PlatformContentLanguage = 'ar') {
  return usePlatformLegalContent(
    'medical-policy',
    mapContentToLegalDocument({
      id: USAGE_POLICY.id,
      type: 'SETTINGS_PAGE',
      title: USAGE_POLICY.title,
      slug: USAGE_POLICY.id,
      contentBlocks: [{ type: 'paragraph', text: USAGE_POLICY.body }],
      pageVersion: null,
      publishedAt: USAGE_POLICY.lastUpdated,
    }),
    language,
  );
}

export function usePlatformAboutContent(language: PlatformContentLanguage = 'ar') {
  const { data, isAwaitingData } = usePlatformContentBySettingsKey(
    'about-app',
    language,
  );

  const summary = useMemo(() => {
    if (!data) {
      return 'منصتنا تهدف إلى تقديم أفضل الخدمات الصحية الرقمية بأعلى معايير الجودة والخصوصية لراحتك.';
    }
    return extractAboutSummary(data);
  }, [data]);

  return { data, isAwaitingData, summary };
}

export function usePlatformContactContent(language: PlatformContentLanguage = 'ar') {
  const { data, isAwaitingData } = usePlatformContentBySettingsKey(
    'contact-us',
    language,
  );

  const channels = useMemo(() => {
    if (!data?.contentBlocks?.length) return [];
    return extractContactChannelsFromBlocks(data.contentBlocks);
  }, [data]);

  return { data, isAwaitingData, channels };
}

export function usePlatformServiceTypes(language: PlatformContentLanguage = 'ar') {
  return useQuery({
    queryKey: ['platform', 'service-types', language],
    queryFn: () => platformApi.serviceTypes.list(language),
    staleTime: STALE_MS,
    retry: false,
  });
}
