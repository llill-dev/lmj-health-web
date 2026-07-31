import { useQuery } from "@tanstack/react-query";
import { apiRequestResult, ApiError } from "@/lib/api";

type AssignedDoctorResponse = {
  messageKey?: string;
  message?: string;
  doctor?: {
    _id?: string;
    specialization?: string;
    averageRating?: number;
    user?: {
      fullName?: string;
      email?: string;
      phone?: string;
    };
    userId?: {
      fullName?: string;
      email?: string;
      phone?: string;
    };
  };
};

export function useSecretaryAssignedDoctor() {
  const query = useQuery({
    queryKey: ["secretary", "assigned-doctor"],
    queryFn: async () => {
      const result = await apiRequestResult<AssignedDoctorResponse>(
        "/api/secretaries/me/doctor",
        {
          expectedStatuses: [403, 404],
        },
      );

      if (result.ok) {
        return {
          state: "ready" as const,
          data: result.data,
          error: null,
        };
      }

      const handledError = result.error;

      return {
        state:
          handledError instanceof ApiError && handledError.status === 403
            ? ("forbidden" as const)
            : ("unassigned" as const),
        data: null,
        error: handledError,
      };
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data?.data ?? null,
    assignedDoctor: query.data?.data?.doctor ?? null,
    assignedDoctorState: query.data?.state ?? "ready",
    isForbidden: query.data?.state === "forbidden",
    isUnassigned: query.data?.state === "unassigned",
    isAssignedDoctorUnavailable:
      query.isError || query.data?.state === "forbidden" || query.data?.state === "unassigned",
    error: query.error ?? query.data?.error ?? null,
  };
}
