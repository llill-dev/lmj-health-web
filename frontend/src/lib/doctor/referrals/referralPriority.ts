import type { ReferralPriority } from '@/lib/doctor/referrals/referralFormSchema';

/**
 * قيم الباك إند لدرجة الأهمية (متوافقة مع urgencyLevel: low | medium | high في API-3).
 * الواجهة تبقى normal | urgent | emergency للطبيب.
 */
export const REFERRAL_API_URGENCY_VALUES = ['low', 'medium', 'high'] as const;
export type ReferralApiUrgency = (typeof REFERRAL_API_URGENCY_VALUES)[number];

const UI_TO_API: Record<ReferralPriority, ReferralApiUrgency> = {
  normal: 'low',
  urgent: 'medium',
  emergency: 'high',
};

const API_TO_UI: Record<string, ReferralPriority> = {
  low: 'normal',
  medium: 'urgent',
  high: 'emergency',
};

export function mapReferralPriorityToApiUrgency(
  priority: ReferralPriority,
): ReferralApiUrgency {
  return UI_TO_API[priority];
}

/** قيم الواجهة لدرجة الاستعجال في طلبات التحاليل/الأشعة (اختياري). */
export const CLINICAL_URGENCY_UI_VALUES = ['عادي', 'عاجل', 'طارئ'] as const;
export type ClinicalUrgencyUiValue = (typeof CLINICAL_URGENCY_UI_VALUES)[number];

export function getClinicalUrgencySelectOptions(
  t: (key: string) => string,
): Array<{ value: '' | ClinicalUrgencyUiValue; label: string }> {
  return [
    { value: '', label: t('doctor.clinicalUrgency.none') },
    { value: 'عادي', label: t('doctor.clinicalUrgency.normal') },
    { value: 'عاجل', label: t('doctor.clinicalUrgency.urgent') },
    { value: 'طارئ', label: t('doctor.clinicalUrgency.emergency') },
  ];
}

/** @deprecated Arabic-only — use getClinicalUrgencySelectOptions(t) for locale-aware labels. */
export const CLINICAL_URGENCY_SELECT_OPTIONS: Array<{
  value: '' | ClinicalUrgencyUiValue;
  label: string;
}> = [
  { value: '', label: '— بدون —' },
  { value: 'عادي', label: 'عادي (منخفض)' },
  { value: 'عاجل', label: 'عاجل (متوسط)' },
  { value: 'طارئ', label: 'طارئ (عالي)' },
];

/** يحوّل urgency من الـ API (low|medium|high) إلى قيمة القائمة العربية. */
export function mapClinicalUrgencyFromApi(raw?: string | null): string {
  const value = (raw ?? '').trim().toLowerCase();
  if (!value) return '';
  if (value === 'low') return 'عادي';
  if (value === 'medium') return 'عاجل';
  if (value === 'high') return 'طارئ';
  if (value === 'عادي' || value === 'عاجل' || value === 'طارئ') {
    return value;
  }
  const mapped = mapReferralPriorityFromApi(raw);
  if (mapped === 'normal') return 'عادي';
  if (mapped === 'urgent') return 'عاجل';
  if (mapped === 'emergency') return 'طارئ';
  return '';
}

export function mapClinicalUrgencyTextToApi(
  raw?: string | null,
): ReferralApiUrgency | undefined {
  const value = (raw ?? '').trim().toLowerCase();
  if (!value) return undefined;
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  if (value.includes('emerg') || value.includes('طارئ')) return 'high';
  if (value.includes('high') || value.includes('عاجل جدا')) return 'high';
  if (value.includes('urgent') || value.includes('عاجل') || value.includes('medium')) {
    return 'medium';
  }
  if (value.includes('low') || value.includes('عادي') || value.includes('normal')) {
    return 'low';
  }
  return undefined;
}

export function mapReferralPriorityFromApi(
  raw?: string | null,
): ReferralPriority {
  const value = (raw ?? '').trim().toLowerCase();
  if (value in API_TO_UI) return API_TO_UI[value]!;
  if (value.includes('emerg') || value.includes('طارئ')) return 'emergency';
  if (value.includes('high') || value.includes('عاج')) return 'urgent';
  if (value.includes('medium')) return 'urgent';
  if (value.includes('urgent')) return 'urgent';
  if (value.includes('low') || value.includes('normal') || value.includes('عادي')) {
    return 'normal';
  }
  return 'normal';
}
