import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  billingOptionalTransactionDateToIso,
  isBillingDateInputAfterToday,
} from '@/lib/doctor/billing/dateInput';

describe('billingOptionalTransactionDateToIso', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns undefined for empty input or today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 11, 8, 30, 0));

    expect(billingOptionalTransactionDateToIso('')).toBeUndefined();
    expect(billingOptionalTransactionDateToIso('   ')).toBeUndefined();
    expect(billingOptionalTransactionDateToIso('2026-06-11')).toBeUndefined();
  });

  it('returns a past timestamp for earlier calendar days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 11, 8, 30, 0));

    const iso = billingOptionalTransactionDateToIso('2026-06-10');
    expect(iso).toBeDefined();
    expect(new Date(iso!).getTime()).toBeLessThan(Date.now());
  });
});

describe('isBillingDateInputAfterToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for empty, today, and past dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 11, 8, 30, 0));

    expect(isBillingDateInputAfterToday('')).toBe(false);
    expect(isBillingDateInputAfterToday('2026-06-11')).toBe(false);
    expect(isBillingDateInputAfterToday('2026-06-10')).toBe(false);
  });

  it('returns true for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 11, 8, 30, 0));

    expect(isBillingDateInputAfterToday('2026-06-12')).toBe(true);
  });
});
