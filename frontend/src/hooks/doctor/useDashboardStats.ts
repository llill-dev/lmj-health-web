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
): DoctorDashboardStats {
  const summary = parseSummaryAnalytics(response);
  const completed = num(response.totals?.appointmentsCompleted);
  const noShow = num(response.totals?.appointmentsNoShow);
  const attendanceBase = completed + noShow;

  return {
    totalPatients: summary.patients,
    activePatients: summary.patients,
    totalAppointments: completed + noShow,
    todayAppointments: 0,
    completedAppointments: completed,
    pendingAppointments: 0,
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
      const response = await get<DoctorActivitySummaryResponse>(
        doctorEndpoints.analytics.summary,
        {
          locale: 'ar',
        },
      );

      return normalizeDashboardStats(response);
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
