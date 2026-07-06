"use client";

import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "@/lib/doctor/client";
import type { DoctorAppointmentStatus } from "@/lib/doctor/types";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";

export function useAppointments(
  page = 1,
  limit = 10,
  date?: string,
  status?: DoctorAppointmentStatus,
) {
  const query = useQuery({
    queryKey: ["appointments", page, limit, date, status],
    queryFn: () => doctorApi.appointments.list({ page, limit, date, status }),
    staleTime: 1000 * 60, // 1 minute
  });
  const response = query.data;

  return {
    appointments: response?.appointments || [],
    total: response?.total || 0,
    currentPage: response?.page || page,
    totalPages: Math.ceil((response?.total || 0) / limit),
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
    hasMore: response ? response.page * response.limit < response.total : false,
  };
}
