import type { ActivityLogPeriod } from '@/lib/doctor/activityLog/types';

export function activityLogPeriodRange(
  period: ActivityLogPeriod,
): { from?: string; to?: string } {
  if (period === 'all') return {};

  const now = new Date();
  const start = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start.setDate(now.getDate() - 7);
  } else {
    start.setMonth(now.getMonth() - 1);
  }

  return {
    from: start.toISOString(),
    to: now.toISOString(),
  };
}
