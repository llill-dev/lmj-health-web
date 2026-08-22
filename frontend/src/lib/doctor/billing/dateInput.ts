/** Date-only inputs → local noon (due dates / invoice fields; not payment/refund timestamps). */
export function billingDateInputToIso(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

/**
 * paidAt / refundedAt: omit when unset or when the user picks today — the server stamps
 * "now" and avoids futureDateNotAllowed (noon today is still in the future before 12:00).
 * Past calendar days are sent as local noon so the UTC day matches the user's pick.
 */
export function billingOptionalTransactionDateToIso(
  dateStr: string,
): string | undefined {
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === billingTodayDateInput()) return undefined;
  return billingDateInputToIso(trimmed);
}

/** Today in local timezone as YYYY-MM-DD for `<input type="date" max="…">`. */
export function billingTodayDateInput(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** True when the YYYY-MM-DD value is after the user's local today. */
export function isBillingDateInputAfterToday(dateStr: string): boolean {
  const trimmed = dateStr.trim();
  if (!trimmed) return false;
  return trimmed > billingTodayDateInput();
}

export const BILLING_FUTURE_DATE_MESSAGE = {
  title: 'تاريخ غير صالح',
  message:
    'التاريخ المدخل لا يمكن أن يكون في المستقبل. اختر تاريخ اليوم أو تاريخاً سابقاً.',
} as const;

export function isoToBillingDateInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
