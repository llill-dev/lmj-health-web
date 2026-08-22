import type {
  DoctorConsultationType,
  DoctorProfileRecord,
} from '@/lib/doctor/profile/profileClient';
import type { DoctorProfileChangeItem } from '@/lib/doctor/profile/profileChangeRequestsClient';
import type { DoctorProfessionalEditForm } from '@/components/doctor/profile-settings/doctor-profile-schemas';

export function formatDoctorDisplayName(fullName?: string | null) {
  const trimmed = fullName?.trim() || 'الطبيب';
  return /^د\.?\s/u.test(trimmed) ? trimmed : `د. ${trimmed}`;
}

export function doctorInitial(fullName?: string | null) {
  const trimmed = fullName?.trim() || 'د';
  return trimmed.replace(/^د\.?\s*/u, '').charAt(0) || 'د';
}

export function formatProfileDate(value?: string | null) {
  if (!value?.trim()) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SY', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export function formatConsultationFee(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('ar-SY');
}

export function maskPhone(phone?: string | null) {
  const trimmed = phone?.trim();
  if (!trimmed) return '—';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length <= 4) return trimmed;
  return `${digits.slice(0, 2)}${'*'.repeat(Math.min(8, digits.length - 2))}`;
}

export function maskEmail(email?: string | null) {
  const trimmed = email?.trim();
  if (!trimmed) return '—';
  const at = trimmed.indexOf('@');
  if (at <= 0) return trimmed;
  const domain = trimmed.slice(at + 1);
  if (domain.length <= 8) return `…@${domain}`;
  return `…@${domain.slice(0, 3)}…`;
}

export function normalizeConsultationTypes(
  types?: (DoctorConsultationType | string)[] | null,
): DoctorConsultationType[] {
  return (types ?? []).filter(
    (t): t is DoctorConsultationType => t === 'online' || t === 'offline',
  );
}

export type ConsultationModeSelection = 'offline' | 'online' | 'both';

export function consultationTypesToMode(
  types: DoctorConsultationType[],
): ConsultationModeSelection {
  const hasOnline = types.includes('online');
  const hasOffline = types.includes('offline');
  if (hasOnline && hasOffline) return 'both';
  if (hasOnline) return 'online';
  if (hasOffline) return 'offline';
  return 'offline';
}

export function modeToConsultationTypes(
  mode: ConsultationModeSelection,
): DoctorConsultationType[] {
  if (mode === 'both') return ['online', 'offline'];
  return [mode];
}

export function formatConsultationModeLabel(
  types?: (DoctorConsultationType | string)[] | null,
) {
  const normalized = normalizeConsultationTypes(types);
  const mode = consultationTypesToMode(normalized);
  if (mode === 'both') return 'حضورية + عن بعد';
  if (mode === 'online') return 'عن بعد';
  return 'حضوري';
}

export function parseExperienceYears(bio?: string | null): number | null {
  const text = bio?.trim();
  if (!text) return null;
  const match = text.match(/(\d+)\s*(?:سنة|سنوات|year|years)/iu);
  if (!match) return null;
  const years = Number(match[1]);
  return Number.isFinite(years) ? years : null;
}

export function toDateInputValue(value?: string | null) {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function buildProfileFieldRows(
  doctor: DoctorProfileRecord | null | undefined,
) {
  const user = doctor?.user;
  return {
    personal: [
      { label: 'الاسم الكامل', value: user?.fullName?.trim() || '—' },
      { label: 'تاريخ الميلاد', value: formatProfileDate(user?.dateOfBirth) },
      { label: 'التخصص', value: doctor?.specialization?.trim() || '—' },
      { label: 'المدينة', value: doctor?.locationCity?.trim() || '—' },
      { label: 'البلد', value: doctor?.locationCountry?.trim() || '—' },
      { label: 'الهاتف', value: maskPhone(user?.phone) },
      { label: 'البريد الإلكتروني', value: maskEmail(user?.email) },
      { label: 'نبذة تعريفية', value: doctor?.bio?.trim() || '—' },
    ],
    professional: [
      {
        label: 'رقم الشهادة الطبية',
        value: doctor?.medicalLicenseNumber?.trim() || '—',
      },
      { label: 'التخصص', value: doctor?.specialization?.trim() || '—' },
      { label: 'العنوان', value: doctor?.clinicAddress?.trim() || '—' },
      { label: 'المؤهل', value: doctor?.education?.trim() || '—' },
      {
        label: 'نوع الاستشارة',
        value: formatConsultationModeLabel(doctor?.consultationTypes),
      },
      {
        label: 'سعر الاستشارة',
        value: formatConsultationFee(doctor?.consultationFee),
      },
    ],
  };
}

export function buildProfessionalChangeItems(
  doctor: DoctorProfileRecord,
  values: DoctorProfessionalEditForm,
): DoctorProfileChangeItem[] {
  const items: DoctorProfileChangeItem[] = [];
  const push = (
    field: DoctorProfileChangeItem['field'],
    current: string | number | null | undefined,
    next: string,
  ) => {
    const currentStr = String(current ?? '').trim();
    const nextStr = next.trim();
    if (nextStr && nextStr !== currentStr) {
      items.push({ field, newValue: nextStr });
    }
  };

  push(
    'medicalLicenseNumber',
    doctor.medicalLicenseNumber,
    values.medicalLicenseNumber,
  );
  push('specialization', doctor.specialization, values.specialization);
  push('education', doctor.education, values.education);
  push('clinicAddress', doctor.clinicAddress, values.clinicAddress);
  push('locationCountry', doctor.locationCountry, values.locationCountry ?? '');
  push('locationCity', doctor.locationCity, values.locationCity ?? '');

  const lat = values.clinicLat?.trim();
  const lng = values.clinicLng?.trim();
  if (lat && lng) {
    const currentLat = doctor.clinicLat != null ? String(doctor.clinicLat) : '';
    const currentLng = doctor.clinicLng != null ? String(doctor.clinicLng) : '';
    if (lat !== currentLat) items.push({ field: 'clinicLat', newValue: lat });
    if (lng !== currentLng) items.push({ field: 'clinicLng', newValue: lng });
  }

  return items;
}
