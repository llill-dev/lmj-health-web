import type { AccountsPeriod } from '@/lib/doctor/clinicAccounts/types';

export type BillingReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export type BillingQueryParams = Record<string, string | number | undefined>;

function isoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  ).toISOString();
}

function endOfUtcDay(date: Date): string {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  ).toISOString();
}

export function resolveBillingDashboardPeriodParams(
  period: AccountsPeriod,
  anchor = new Date(),
): BillingQueryParams {
  const periodAnchor = isoDateOnly(anchor);

  switch (period) {
    case 'day':
      return {
        period: 'custom',
        dateFrom: startOfUtcDay(anchor),
        dateTo: endOfUtcDay(anchor),
        groupBy: 'day',
      };
    case 'week':
      return { period: 'week', periodAnchor, groupBy: 'day' };
    case 'month':
      return { period: 'month', periodAnchor, groupBy: 'day' };
    case 'custom':
    default:
      return { period: 'month', periodAnchor, groupBy: 'day' };
  }
}

export function resolveBillingReportPeriodParams(input: {
  year: number;
  month?: number | 'all';
}): BillingQueryParams {
  const anchor = input.month && input.month !== 'all'
    ? new Date(Date.UTC(input.year, input.month - 1, 15))
    : new Date(Date.UTC(input.year, 5, 15));

  if (input.month && input.month !== 'all') {
    return {
      period: 'month',
      periodAnchor: isoDateOnly(anchor),
      groupBy: 'day',
    };
  }

  return {
    period: 'year',
    periodAnchor: isoDateOnly(anchor),
    groupBy: 'month',
  };
}

export function buildBillingQueryString(params: BillingQueryParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}
