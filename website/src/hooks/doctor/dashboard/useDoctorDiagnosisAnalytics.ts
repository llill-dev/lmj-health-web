'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { parseDiagnosisAnalytics } from '@/lib/admin/doctors/doctorAdminAnalytics';
import type { AdminDoctorAnalyticsRange } from '@/lib/admin/types';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useDoctorDiagnosisAnalytics(
  range: AdminDoctorAnalyticsRange = 'week',
) {
  const query = useQuery({
    queryKey: ['doctor', 'analytics', 'diagnosis', range],
    queryFn: () =>
      get<Record<string, unknown>>(
        `${doctorEndpoints.analytics.diagnosis}?range=${encodeURIComponent(range)}`,
        { locale: 'ar' },
      ),
    staleTime: 1000 * 60 * 5,
  });

  const series = parseDiagnosisAnalytics(query.data, range);
  const total =
    typeof query.data?.total === 'number'
      ? query.data.total
      : series.reduce((sum, item) => sum + item.value, 0);

  return {
    series,
    total,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    refetch: query.refetch,
  };
}
