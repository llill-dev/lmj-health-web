/** Public app-facing CMS & support routes (API-3). */
export const platformEndpoints = {
  content: {
    list: '/api/content',
    bySlug: (slug: string) => `/api/content/${encodeURIComponent(slug)}`,
    search: '/api/content/search',
  },
  complaints: {
    create: '/api/complaints',
  },
  serviceTypes: '/api/services/types',
} as const;

/** Known SETTINGS_PAGE slugs from backend CMS catalog. */
export const PLATFORM_SETTINGS_SLUGS = {
  terms: 'terms',
  privacy: 'privacy-policy',
  usage: 'medical-policy',
  faq: 'faq',
  about: 'about-app',
  contact: 'contact-us',
} as const;

export type PlatformSettingsSlug =
  (typeof PLATFORM_SETTINGS_SLUGS)[keyof typeof PLATFORM_SETTINGS_SLUGS];

/** Fallback when CMS contact-us is unpublished. */
export const PLATFORM_FALLBACK_SUPPORT_EMAIL = 'support@syrhealth.com';

/** Alternate slugs the CMS may publish under (discovered via list endpoint). */
export const PLATFORM_SETTINGS_SLUG_ALIASES: Record<
  PlatformSettingsSlug,
  readonly string[]
> = {
  terms: ['terms', 'terms-of-use'],
  privacy: ['privacy-policy', 'privacy'],
  usage: ['medical-policy', 'usage-policy', 'usage'],
  faq: ['faq', 'frequently-asked-questions'],
  about: ['about-app', 'about', 'about-us'],
  contact: ['contact-us', 'contact'],
};
