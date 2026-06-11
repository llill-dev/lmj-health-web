const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SAR: 'ر.س',
  AED: 'د.إ',
};

export function formatBillingAmount(
  value: number,
  currency = 'USD',
  locale: 'ar' | 'en' = 'ar',
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = value.toLocaleString(locale === 'ar' ? 'ar-SY' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (symbol.length > 2) {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

/** @deprecated use formatBillingAmount — kept for gradual migration */
export function formatUsd(value: number): string {
  return formatBillingAmount(value, 'USD');
}
