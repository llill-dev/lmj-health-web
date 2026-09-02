/** Billing UI always uses Western digits (0–9), even on Arabic pages. */
const BILLING_NUMBER_LOCALE = 'en-US';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SAR: 'ر.س',
  AED: 'د.إ',
  SYP: 'ل.س',
};

export function formatBillingNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(BILLING_NUMBER_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });
}

export function formatBillingAmount(value: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = formatBillingNumber(value);

  if (symbol.length > 2) {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

/** Dates always use Latin digits (e.g. 11/6/2026), day/month order follows locale. */
export function formatBillingDate(
  value?: string | null,
  locale: 'ar' | 'en' = 'ar',
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SY', {
    numberingSystem: 'latn',
  });
}

/** @deprecated use formatBillingAmount — kept for gradual migration */
export function formatUsd(value: number): string {
  return formatBillingAmount(value, 'USD');
}
