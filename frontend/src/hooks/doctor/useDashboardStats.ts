'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { parseSummaryAnalytics } from '@/lib/admin/doctorAdminAnalytics';
import type { DoctorActivitySummaryResponse } from '@/lib/admin/types';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

type DoctorDashboardStats = {
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalMedicalRecords: number;
  appointmentsNoShow: number;
  attendanceRate: number | null;
};

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboardStats(
  response: DoctorActivitySummaryResponse,
  todayResponse?: DoctorActivitySummaryResponse | null,
): DoctorDashboardStats {
  const summary = parseSummaryAnalytics(response);
  const completed = num(response.totals?.appointmentsCompleted);
  const noShow = num(response.totals?.appointmentsNoShow);
  const attendanceBase = completed + noShow;
  const todayCompleted = num(todayResponse?.totals?.appointmentsCompleted);
  const todayNoShow = num(todayResponse?.totals?.appointmentsNoShow);

  return {
    totalPatients: summary.patients,
    activePatients: summary.patients,
    totalAppointments: completed + noShow,
    todayAppointments: todayCompleted + todayNoShow,
    completedAppointments: completed,
    pendingAppointments: num(response.totals?.accessRequests),
    totalMedicalRecords: summary.diagnoses,
    appointmentsNoShow: noShow,
    attendanceRate:
      attendanceBase > 0 ? Math.round((completed / attendanceBase) * 100) : null,
  };
}

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ['doctor', 'dashboard', 'stats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [summary, todaySlice] = await Promise.all([
        get<DoctorActivitySummaryResponse>(`${doctorEndpoints.analytics.summary}?range=month`, {
          locale: 'ar',
        }),
        get<DoctorActivitySummaryResponse>(`${doctorEndpoints.analytics.summary}?from=${today}&to=${today}`, {
          locale: 'ar',
        }).catch(() => null),
      ]);

      return normalizeDashboardStats(summary, todaySlice);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    stats: query.data,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}
