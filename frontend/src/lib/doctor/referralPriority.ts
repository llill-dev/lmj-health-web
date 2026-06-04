import type { ReferralPriority } from './referralFormSchema';

/**
 * قيم الباك إند لدرجة الأهمية (متوافقة مع urgencyLevel: low | medium | high في API-4).
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

/** يحوّل نص الاستعجال في نماذج التحاليل/الأشعة إلى low | medium | high للـ PATCH. */
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
