import type { ApiBillingPaymentMethod } from '@/lib/doctor/billing/apiTypes';

/** Fixed presets shown in settings UI (API allows custom arrays on save). */
export const BILLING_DISCOUNT_PRESET_OPTIONS = [0, 10, 20, 30] as const;

export const BILLING_PAYMENT_METHOD_OPTIONS: Array<{
  id: ApiBillingPaymentMethod;
  label: string;
}> = [
  { id: 'cash', label: 'نقدي' },
  { id: 'card', label: 'بطاقة' },
  { id: 'bank_transfer', label: 'تحويل' },
  { id: 'insurance', label: 'تأمين' },
];

const CURRENCY_AR_LABELS: Record<string, string> = {
  USD: 'دولار أمريكي',
  EUR: 'يورو',
  GBP: 'جنيه إسترليني',
  CAD: 'دولار كندي',
  AUD: 'دولار أسترالي',
  CHF: 'فرنك سويسري',
  JPY: 'ين ياباني',
  CNY: 'يوان صيني',
  INR: 'روبية هندية',
  SYP: 'ليرة سورية',
  AED: 'درهم إماراتي',
  SAR: 'ريال سعودي',
  QAR: 'ريال قطري',
  KWD: 'دينار كويتي',
  JOD: 'دينار أردني',
  EGP: 'جنيه مصري',
  TRY: 'ليرة تركية',
};

export function formatBillingCurrencyOptionLabel(
  code: string,
  name?: string,
): string {
  const ar = CURRENCY_AR_LABELS[code.toUpperCase()];
  if (ar) return `${ar} (${code.toUpperCase()})`;
  if (name?.trim()) return `${name.trim()} (${code.toUpperCase()})`;
  return code.toUpperCase();
}
