import { resolveLabel, type ServiceProvider } from '@/lib/admin/types';
import type { SuggestFacilityRecord } from '@/lib/doctor/medical-services-directory/api-types';
import {
  resolveMedicalServiceCategory,
  resolveMedicalServiceCategoryFromServiceType,
} from '@/lib/doctor/medical-services-directory/category-map';
import { getMedicalServiceFacilityImage } from '@/lib/doctor/medical-services-directory/placeholders';
import type {
  MedicalServiceCategory,
  MedicalServiceFacility,
  WorkingHoursEntry,
} from '@/lib/doctor/medical-services-directory/types';

type DirectoryRecord = {
  [key: string]: unknown;
};
type LocalizedLabel = { en: string; ar: string };

function asDirectoryRecord(value: unknown): DirectoryRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DirectoryRecord)
    : null;
}

function asLocalizedLabel(value: unknown): LocalizedLabel | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = asDirectoryRecord(value);
  if (!record) return undefined;
  return typeof record.ar === 'string' && typeof record.en === 'string'
    ? { ar: record.ar, en: record.en }
    : undefined;
}

export function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, ' ').trim();
}

export function formatFacilityLocation(facility: SuggestFacilityRecord): string {
  const address = facility.address?.trim();
  if (address) return address;

  const city = facility.city?.trim();
  const country = facility.country?.trim();
  if (city && country) return `${city} — ${country}`;
  return city || country || '—';
}

function buildPhoneHref(phone?: string | null): string | undefined {
  const trimmed = phone?.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(/\s+/g, '');
  return normalized.startsWith('tel:') ? normalized : `tel:${normalized}`;
}

function buildWhatsAppHref(phone?: string | null): string | undefined {
  const trimmed = phone?.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (!digits) return undefined;
  return `https://wa.me/${digits.replace(/^\+/, '')}`;
}

function readTextValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  const label = asLocalizedLabel(value);
  if (label) {
    return resolveLabel(label, 'ar').trim();
  }
  return '';
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => readTextValue(entry))
      .filter(Boolean);
  }
  const single = readTextValue(value);
  return single ? [single] : [];
}

function readFacilityAttributeLabels(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((entry): entry is string => typeof entry === 'string')
        .map(formatFacilityAttributeLabel)
        .filter(Boolean)
    : [];
}

function pickFirstText(
  record: DirectoryRecord,
  keys: string[],
): string {
  for (const key of keys) {
    const value = readTextValue(record[key]);
    if (value) return value;
  }
  return '';
}

function buildAbsoluteUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^(https?:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function mapWorkingHours(value: unknown): WorkingHoursEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const record = asDirectoryRecord(entry);
      if (!record) return null;
      const days = pickFirstText(record, ['days', 'day', 'label', 'title']);
      const hours = pickFirstText(record, [
        'hours',
        'time',
        'value',
        'fromTo',
        'range',
      ]);
      if (!days || !hours) return null;
      return { days, hours };
    })
    .filter((entry): entry is WorkingHoursEntry => entry != null);
}

function resolveProviderLocation(data: DirectoryRecord): string {
  const address = pickFirstText(data, ['address', 'location', 'streetAddress']);
  if (address) return address;
  const city = pickFirstText(data, ['city']);
  const country = pickFirstText(data, ['country']);
  if (city && country) return `${city} — ${country}`;
  return city || country || '—';
}

function matchesDirectorySearch(
  facility: MedicalServiceFacility,
  search?: string,
): boolean {
  const normalized = search?.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    facility.name,
    facility.location,
    facility.description,
    facility.shortDescription,
    ...facility.tags,
    ...facility.services,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalized);
}

function isPubliclyVisibleProvider(provider: ServiceProvider): boolean {
  const normalizedStatus = provider.status?.trim().toLowerCase();
  if (!normalizedStatus) return true;
  return normalizedStatus === 'active';
}

export function mapSuggestFacilityToDirectoryItem(
  facility: SuggestFacilityRecord,
  fallbackCategory?: MedicalServiceCategory,
): MedicalServiceFacility | null {
  const id = facility.id ?? facility._id;
  const name = facility.name?.trim();
  if (!id || !name) return null;

  const category =
    resolveMedicalServiceCategory(facility.facilityType) ??
    fallbackCategory ??
    'clinics';

  const attributes = readFacilityAttributeLabels(facility.attributes);

  const description =
    facility.description?.trim() ||
    'منشأة صحية مسجّلة في دليل LMJ Health. تواصل معها مباشرة للتفاصيل.';

  const shortDescription =
    description.length > 72 ? `${description.slice(0, 69).trim()}…` : description;

  const tags = attributes.slice(0, 4);
  const services = attributes.length > 0 ? attributes : [];

  return {
    id,
    category,
    name,
    location: formatFacilityLocation(facility),
    description,
    shortDescription,
    tags,
    services,
    workingHours: [],
    imageUrl: getMedicalServiceFacilityImage(category),
    contact: {
      phone: buildPhoneHref(facility.phone),
      whatsapp: buildWhatsAppHref(facility.phone),
    },
  };
}

export function mergeSuggestFacilities(
  batches: SuggestFacilityRecord[][],
  fallbackCategory?: MedicalServiceCategory,
): MedicalServiceFacility[] {
  const merged = new Map<string, MedicalServiceFacility>();

  for (const batch of batches) {
    for (const facility of batch) {
      const mapped = mapSuggestFacilityToDirectoryItem(
        facility,
        fallbackCategory,
      );
      if (mapped) merged.set(mapped.id, mapped);
    }
  }

  return [...merged.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'ar'),
  );
}

export function mapServiceProviderToDirectoryItem(
  provider: ServiceProvider,
  options?: {
    serviceTypeLabel?: string;
  },
): MedicalServiceFacility | null {
  const id = provider.id?.trim() || provider._id?.trim();
  if (!id) return null;

  const data = provider.data ?? {};
  const serviceTypeSlug =
    typeof provider.serviceType === 'string'
      ? provider.serviceType
      : provider.serviceType?.slug || '';
  const serviceTypeName =
    options?.serviceTypeLabel ||
    (typeof provider.serviceType === 'string'
      ? provider.serviceType
      : readTextValue(provider.serviceType?.name));

  const name =
    pickFirstText(data, ['name', 'title', 'providerName']) ||
    serviceTypeName ||
    id;

  const description =
    pickFirstText(data, [
      'description',
      'about',
      'summary',
      'bio',
      'details',
    ]) || 'مزود خدمة صحي منشور ضمن دليل LMJ Health.';

  const services = [
    ...readStringArray(data.services),
    ...readStringArray(data.specialties),
    ...readStringArray(data.features),
    ...readStringArray(data.aliases),
  ].filter((value, index, array) => array.indexOf(value) === index);

  const tags = [
    serviceTypeName,
    ...services,
    pickFirstText(data, ['city']),
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  const shortDescription =
    description.length > 72 ? `${description.slice(0, 69).trim()}…` : description;

  const website = buildAbsoluteUrl(
    pickFirstText(data, ['website', 'site', 'url']),
  );
  const facebook = buildAbsoluteUrl(
    pickFirstText(data, ['facebook', 'facebookUrl']),
  );
  const phoneRaw = pickFirstText(data, ['phone', 'mobile', 'telephone']);
  const whatsappRaw = pickFirstText(data, ['whatsapp']) || phoneRaw;
  const imageUrl =
    pickFirstText(data, ['imageUrl', 'logoUrl', 'coverImageUrl']) ||
    getMedicalServiceFacilityImage(
      resolveMedicalServiceCategoryFromServiceType(
        serviceTypeSlug,
        serviceTypeName,
      ),
    );

  return {
    id,
    category: resolveMedicalServiceCategoryFromServiceType(
      serviceTypeSlug,
      serviceTypeName,
    ),
    name,
    location: resolveProviderLocation(data),
    description,
    shortDescription,
    tags: tags.slice(0, 4),
    services,
    workingHours: mapWorkingHours(data.workingHours ?? data.hours ?? data.schedule),
    imageUrl,
    contact: {
      phone: buildPhoneHref(phoneRaw),
      whatsapp: buildWhatsAppHref(whatsappRaw),
      facebook,
      website,
    },
  };
}

export function mergeServiceProviders(
  batches: ServiceProvider[][],
  options?: {
    search?: string;
    serviceTypeLabelsBySlug?: Record<string, string>;
  },
): MedicalServiceFacility[] {
  const merged = new Map<string, MedicalServiceFacility>();

  for (const batch of batches) {
    for (const provider of batch) {
      if (!isPubliclyVisibleProvider(provider)) continue;
      const slug =
        typeof provider.serviceType === 'string'
          ? provider.serviceType
          : provider.serviceType?.slug || '';
      const mapped = mapServiceProviderToDirectoryItem(provider, {
        serviceTypeLabel: options?.serviceTypeLabelsBySlug?.[slug],
      });
      if (!mapped) continue;
      if (!matchesDirectorySearch(mapped, options?.search)) continue;
      merged.set(mapped.id, mapped);
    }
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
