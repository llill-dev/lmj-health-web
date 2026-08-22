"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "@/lib/doctor/client";
import type {
  DoctorPatientListItem,
  DoctorPatientAccountStatus,
} from "@/lib/doctor/types";

export function usePatients(
  page = 1,
  limit = 10,
  search = "",
  status?: DoctorPatientAccountStatus,
) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["patients", page, limit, search, status],
    queryFn: () =>
      doctorApi.patients.list({ page, limit, search, account_status: status }),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    patients: response?.patients || [],
    total: response?.total || 0,
    currentPage: response?.page || page,
    totalPages: Math.ceil((response?.total || 0) / limit),
    isLoading,
    error,
    refetch,
    hasMore: response ? response.page * response.limit < response.total : false,
  };
}
