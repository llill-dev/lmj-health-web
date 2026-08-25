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
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  method?: string;
  category?: string;
}): BillingQueryParams {
  if (input.dateFrom && input.dateTo) {
    return {
      period: 'custom',
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      groupBy: 'day',
      ...(input.status ? { status: input.status } : {}),
      ...(input.method ? { method: input.method } : {}),
      ...(input.category ? { category: input.category } : {}),
    };
  }

  const anchor = input.month && input.month !== 'all'
    ? new Date(Date.UTC(input.year, input.month - 1, 15))
    : new Date(Date.UTC(input.year, 5, 15));

  const base: BillingQueryParams =
    input.month && input.month !== 'all'
      ? { period: 'month', periodAnchor: isoDateOnly(anchor), groupBy: 'day' }
      : { period: 'year', periodAnchor: isoDateOnly(anchor), groupBy: 'month' };

  return {
    ...base,
    ...(input.status ? { status: input.status } : {}),
    ...(input.method ? { method: input.method } : {}),
    ...(input.category ? { category: input.category } : {}),
  };
}

/**
 * Client-computed date range matching the dashboard's `period` selector, for
 * endpoints that only accept plain dateFrom/dateTo (e.g. the invoice list and
 * reports endpoints) and have no server-side "period" concept of their own.
 * Keeps every billing query on a page in sync with the same period control
 * instead of each one silently defaulting to "all time".
 */
export function resolveClientDateRangeForPeriod(
  period: AccountsPeriod,
  anchor = new Date(),
): { dateFrom: string; dateTo: string } {
  const dateTo = isoDateOnly(anchor);

  switch (period) {
    case 'day':
      return { dateFrom: dateTo, dateTo };
    case 'week': {
      const from = new Date(anchor);
      from.setUTCDate(from.getUTCDate() - 6);
      return { dateFrom: isoDateOnly(from), dateTo };
    }
    case 'month':
    case 'custom':
    default: {
      const from = new Date(
        Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
      );
      return { dateFrom: isoDateOnly(from), dateTo };
    }
  }
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
