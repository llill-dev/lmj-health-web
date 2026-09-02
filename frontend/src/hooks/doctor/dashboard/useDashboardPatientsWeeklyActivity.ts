"use client";

import { useMemo } from "react";

import { useDoctorAppointmentsApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import {
  buildPatientWeeklyActivityChart,
  getLastSevenDaysRange,
} from "@/lib/doctor/dashboard/buildPatientWeeklyActivityChart";

export function useDashboardPatientsWeeklyActivity(
  locale: "ar" | "en" = "ar",
) {
  const range = useMemo(() => getLastSevenDaysRange(), []);

  const appointmentsQuery = useDoctorAppointmentsApi({
    page: 1,
    limit: 100,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  });

  const chart = useMemo(
    () =>
      buildPatientWeeklyActivityChart(
        appointmentsQuery.appointments,
        undefined,
        locale,
      ),
    [appointmentsQuery.appointments, locale],
  );

  return {
    chart,
    range,
    appointmentsQuery,
  };
}
