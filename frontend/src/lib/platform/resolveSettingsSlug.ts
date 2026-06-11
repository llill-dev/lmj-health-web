import {
  PLATFORM_SETTINGS_SLUG_ALIASES,
  type PlatformSettingsSlug,
} from '@/lib/platform/endpoints';
import type { PlatformSettingsListItem } from '@/lib/platform/types';

export function resolvePublishedSettingsSlug(
  catalog: PlatformSettingsListItem[] | undefined,
  key: PlatformSettingsSlug,
): string | null {
  if (!catalog?.length) return null;

  const candidates = PLATFORM_SETTINGS_SLUG_ALIASES[key];
  for (const candidate of candidates) {
    const match = catalog.find(
      (row) => row.slug.trim().toLowerCase() === candidate.toLowerCase(),
    );
    if (match?.slug) return match.slug;
  }

  return null;
}
