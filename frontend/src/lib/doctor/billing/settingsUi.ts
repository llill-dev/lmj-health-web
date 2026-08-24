import type { ApiBillingPaymentMethod } from '@/lib/doctor/billing/apiTypes';

/** Fixed presets shown in settings UI (API allows custom arrays on save). */
export const BILLING_DISCOUNT_PRESET_OPTIONS = [0, 10, 20, 30] as const;

export function buildBillingPaymentMethodOptions(
  tr: (ar: string, en: string) => string = (ar) => ar,
): Array<{ id: ApiBillingPaymentMethod; label: string }> {
  return [
    { id: 'cash', label: tr('نقدي', 'Cash') },
    { id: 'card', label: tr('بطاقة', 'Card') },
    { id: 'bank_transfer', label: tr('تحويل', 'Transfer') },
    { id: 'insurance', label: tr('تأمين', 'Insurance') },
  ];
}

const CURRENCY_LABELS: Record<string, [string, string]> = {
  USD: ['دولار أمريكي', 'US Dollar'],
  EUR: ['يورو', 'Euro'],
  GBP: ['جنيه إسترليني', 'British Pound'],
  CAD: ['دولار كندي', 'Canadian Dollar'],
  AUD: ['دولار أسترالي', 'Australian Dollar'],
  CHF: ['فرنك سويسري', 'Swiss Franc'],
  JPY: ['ين ياباني', 'Japanese Yen'],
  CNY: ['يوان صيني', 'Chinese Yuan'],
  INR: ['روبية هندية', 'Indian Rupee'],
  SYP: ['ليرة سورية', 'Syrian Pound'],
  AED: ['درهم إماراتي', 'UAE Dirham'],
  SAR: ['ريال سعودي', 'Saudi Riyal'],
  QAR: ['ريال قطري', 'Qatari Riyal'],
  KWD: ['دينار كويتي', 'Kuwaiti Dinar'],
  JOD: ['دينار أردني', 'Jordanian Dinar'],
  EGP: ['جنيه مصري', 'Egyptian Pound'],
  TRY: ['ليرة تركية', 'Turkish Lira'],
};

export function formatBillingCurrencyOptionLabel(
  code: string,
  name?: string,
  tr: (ar: string, en: string) => string = (ar) => ar,
): string {
  const known = CURRENCY_LABELS[code.toUpperCase()];
  if (known) return `${tr(...known)} (${code.toUpperCase()})`;
  if (name?.trim()) return `${name.trim()} (${code.toUpperCase()})`;
  return code.toUpperCase();
}
