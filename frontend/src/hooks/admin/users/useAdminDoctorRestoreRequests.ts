import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";

interface RestoreRequest {
  _id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  doctorEmail?: string;
  doctorPhone?: string;
  specialization?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  deletionReason?: string;
}

interface UseAdminDoctorRestoreRequestsParams {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useAdminDoctorRestoreRequests(
  params: UseAdminDoctorRestoreRequestsParams = {},
) {
  const query = useQuery({
    queryKey: ["adminDoctorRestoreRequests", params],
    queryFn: async () => {
      const response = await adminApi.users.doctorRestoreRequests(params);
      return (response.results || []) as RestoreRequest[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    requests: query.data || [],
    isAwaitingData: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
