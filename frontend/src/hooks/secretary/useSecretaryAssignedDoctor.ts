import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";

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
  return useQuery({
    queryKey: ["secretary", "assigned-doctor"],
    queryFn: () => get<AssignedDoctorResponse>("/api/secretaries/me/doctor"),
    staleTime: 60_000,
  });
}
