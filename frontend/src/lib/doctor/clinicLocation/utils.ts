import type { DoctorProfileRecord } from '@/lib/doctor/profile/profileClient';
import type {
  DoctorProfileChangeItem,
  DoctorProfileChangeRequest,
} from '@/lib/doctor/profile/profileChangeRequestsClient';

export type ClinicGeoStatus = 'missing' | 'pending' | 'verified' | string;

export type ClinicVerificationStatus = 'unverified' | 'pending' | 'verified';

export type ClinicLocationFormValues = {
  address: string;
  lat: string;
  lng: string;
};

export const DEFAULT_CLINIC_COORDS = {
  lat: 33.5138,
  lng: 36.2765,
};

const LOCATION_CHANGE_FIELDS = new Set([
  'clinicAddress',
  'clinicLat',
  'clinicLng',
  'locationCity',
  'locationCountry',
]);

function readChangeItems(
  request: DoctorProfileChangeRequest,
): DoctorProfileChangeItem[] {
  return Array.isArray(request.items) ? request.items : [];
}

export function formatCoordinate(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '';
  return value.toFixed(6);
}

export function extractClinicCoordinates(doctor: DoctorProfileRecord | null | undefined): {
  lat: number | null;
  lng: number | null;
} {
  if (!doctor) return { lat: null, lng: null };

  if (doctor.clinicLat != null && doctor.clinicLng != null) {
    return { lat: doctor.clinicLat, lng: doctor.clinicLng };
  }

  const coords = doctor.clinicLocation?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const [lng, lat] = coords;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  }

  return { lat: null, lng: null };
}

export function buildClinicLocationFormValues(
  doctor: DoctorProfileRecord | null | undefined,
): ClinicLocationFormValues {
  const { lat, lng } = extractClinicCoordinates(doctor);
  return {
    address: doctor?.clinicAddress?.trim() ?? '',
    lat: lat != null ? formatCoordinate(lat) : '',
    lng: lng != null ? formatCoordinate(lng) : '',
  };
}

export function hasPendingLocationChangeRequest(
  requests: DoctorProfileChangeRequest[] | undefined,
): boolean {
  const safeRequests = Array.isArray(requests) ? requests : [];
  return safeRequests.some(
    (request) =>
      request.status === 'pending' &&
      readChangeItems(request).some((item) =>
        LOCATION_CHANGE_FIELDS.has(item.field),
      ),
  );
}

export function resolveClinicVerificationStatus(
  geoStatus: ClinicGeoStatus | null | undefined,
  hasPendingLocationRequest: boolean,
): ClinicVerificationStatus {
  if (hasPendingLocationRequest || geoStatus === 'pending') return 'pending';
  if (geoStatus === 'verified') return 'verified';
  return 'unverified';
}

export function clinicVerificationLabel(
  status: ClinicVerificationStatus,
  tr: (ar: string, en: string) => string = (ar) => ar,
): string {
  if (status === 'verified') return tr('موثق', 'Verified');
  if (status === 'pending') return tr('قيد المراجعة', 'Under review');
  return tr('غير محقق', 'Unverified');
}

export function validateClinicLocationForm(
  values: ClinicLocationFormValues,
  tr: (ar: string, en: string) => string = (ar) => ar,
): string | null {
  const address = values.address.trim();
  const lat = values.lat.trim();
  const lng = values.lng.trim();

  if (!address) return tr('عنوان العيادة مطلوب.', 'The clinic address is required.');
  if (address.length < 5)
    return tr(
      'عنوان العيادة قصير جداً (5 أحرف على الأقل).',
      'The clinic address is too short (at least 5 characters).',
    );
  if (!lat || !lng)
    return tr(
      'يجب تحديد خط العرض وخط الطول معاً.',
      'Both latitude and longitude must be set.',
    );
  if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return tr('الإحداثيات غير صالحة.', 'The coordinates are invalid.');
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (latNum < -90 || latNum > 90)
    return tr('خط العرض يجب أن يكون بين -90 و 90.', 'Latitude must be between -90 and 90.');
  if (lngNum < -180 || lngNum > 180)
    return tr('خط الطول يجب أن يكون بين -180 و 180.', 'Longitude must be between -180 and 180.');

  return null;
}

export function buildClinicLocationChangeItems(
  doctor: DoctorProfileRecord,
  values: ClinicLocationFormValues,
): DoctorProfileChangeItem[] {
  const items: DoctorProfileChangeItem[] = [];
  const address = values.address.trim();
  const lat = values.lat.trim();
  const lng = values.lng.trim();

  const currentAddress = doctor.clinicAddress?.trim() ?? '';
  if (address && address !== currentAddress) {
    items.push({ field: 'clinicAddress', newValue: address });
  }

  const currentLat =
    doctor.clinicLat != null ? formatCoordinate(doctor.clinicLat) : '';
  const currentLng =
    doctor.clinicLng != null ? formatCoordinate(doctor.clinicLng) : '';

  if (lat !== currentLat) items.push({ field: 'clinicLat', newValue: lat });
  if (lng !== currentLng) items.push({ field: 'clinicLng', newValue: lng });

  return items;
}

export function buildOpenStreetMapEmbedUrl(lat: number, lng: number): string {
  const delta = 0.012;
  const bbox = [
    lng - delta,
    lat - delta,
    lng + delta,
    lat + delta,
  ]
    .map((value) => value.toFixed(6))
    .join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}
