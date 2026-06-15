import type { SuggestFacilityRecord } from '@/lib/doctor/medical-services-directory/api-types';
import { resolveMedicalServiceCategory } from '@/lib/doctor/medical-services-directory/category-map';
import { getMedicalServiceFacilityImage } from '@/lib/doctor/medical-services-directory/placeholders';
import type {
  MedicalServiceCategory,
  MedicalServiceFacility,
} from '@/lib/doctor/medical-services-directory/types';

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

  const attributes = (facility.attributes ?? [])
    .map(formatFacilityAttributeLabel)
    .filter(Boolean);

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
