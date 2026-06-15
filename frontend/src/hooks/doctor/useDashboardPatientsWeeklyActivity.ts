'use client';

import { useMemo } from 'react';

import { useDoctorAppointmentsApi } from '@/hooks/doctor/useDoctorAppointmentsApi';
import {
  buildPatientWeeklyActivityChart,
  getLastSevenDaysRange,
} from '@/lib/doctor/buildPatientWeeklyActivityChart';

export function useDashboardPatientsWeeklyActivity() {
  const range = useMemo(() => getLastSevenDaysRange(), []);

  const appointmentsQuery = useDoctorAppointmentsApi({
    page: 1,
    limit: 100,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  });

  const chart = useMemo(
    () => buildPatientWeeklyActivityChart(appointmentsQuery.rawAppointments),
    [appointmentsQuery.rawAppointments],
  );

  return {
    chart,
    range,
    appointmentsQuery,
  };
}
