import type { DoctorPatientsListParams } from '@/lib/doctor/types';

export type DashboardPatientFilter = 'all' | 'today' | 'active' | 'upcoming';

export const DASHBOARD_PATIENT_FILTER_LABELS: Record<
  DashboardPatientFilter,
  string
> = {
  all: 'الكل',
  today: 'اليوم',
  active: 'نشط',
  upcoming: 'القادم',
};

export const DASHBOARD_PATIENTS_PAGE_SIZE = 8;

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function buildDashboardPatientsListParams(
  filter: DashboardPatientFilter,
  search: string,
): DoctorPatientsListParams {
  const trimmedSearch = search.trim();
  const today = toIsoDate(new Date());
  const base: DoctorPatientsListParams = {
    page: 1,
    limit: DASHBOARD_PATIENTS_PAGE_SIZE,
    search: trimmedSearch || undefined,
  };

  switch (filter) {
    case 'today':
      return { ...base, from: today, to: today };
    case 'active':
      return { ...base, account_status: 'active' };
    case 'upcoming': {
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 90);
      return { ...base, from: today, to: toIsoDate(horizon) };
    }
    default:
      return { ...base, account_status: 'all' };
  }
}
