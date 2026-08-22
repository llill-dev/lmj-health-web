import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";

export interface AdminDoctorProfileChangeRequest {
  _id: string;
  status: "pending" | "approved" | "denied";
  items: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  doctor?: {
    _id?: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    userId?: {
      fullName?: string;
    };
  };
  requestedBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
}

interface UseAdminDoctorProfileChangeRequestsParams {
  status?: string;
}

export function useAdminDoctorProfileChangeRequests(
  params: UseAdminDoctorProfileChangeRequestsParams = {},
) {
  const query = useQuery({
    queryKey: ["admin-doctor-profile-change-requests", params],
    queryFn: async () => {
      const response = await adminApi.doctorProfileChangeRequests.list(params);
      const source = Array.isArray(response.requests)
        ? response.requests
        : Array.isArray(response.results)
          ? response.results
          : [];
      return source
        .map(normalizeAdminDoctorProfileChangeRequest)
        .filter(
          (request): request is AdminDoctorProfileChangeRequest =>
            Boolean(request?._id),
        )
        .sort(compareDoctorProfileChangeRequestsByDateDesc);
    },
    staleTime: 30 * 1000,
  });

  return {
    requests: query.data ?? [],
    isAwaitingData: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

function normalizeAdminDoctorProfileChangeRequest(
  raw: unknown,
): AdminDoctorProfileChangeRequest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  const doctor =
    record.doctor && typeof record.doctor === "object" && !Array.isArray(record.doctor)
      ? (record.doctor as Record<string, unknown>)
      : undefined;
  const requestedBy =
    record.requestedBy &&
    typeof record.requestedBy === "object" &&
    !Array.isArray(record.requestedBy)
      ? (record.requestedBy as Record<string, unknown>)
      : undefined;
  const userId =
    doctor?.userId && typeof doctor.userId === "object" && !Array.isArray(doctor.userId)
      ? (doctor.userId as Record<string, unknown>)
      : undefined;

  const items = Array.isArray(record.items)
    ? record.items
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
        .map((item) => ({
          field: String(item.field ?? ""),
          oldValue: item.oldValue,
          newValue: item.newValue,
        }))
        .filter((item) => item.field)
    : [];

  const status = String(record.status ?? "pending");

  return {
    _id: String(record._id ?? record.id ?? ""),
    status:
      status === "approved" || status === "denied" || status === "pending"
        ? status
        : "pending",
    items,
    doctor: doctor
      ? {
          _id:
            typeof doctor._id === "string"
              ? doctor._id
              : typeof doctor.id === "string"
                ? doctor.id
                : undefined,
          specialization:
            typeof doctor.specialization === "string" ? doctor.specialization : undefined,
          medicalLicenseNumber:
            typeof doctor.medicalLicenseNumber === "string"
              ? doctor.medicalLicenseNumber
              : undefined,
          userId: userId
            ? {
                fullName: typeof userId.fullName === "string" ? userId.fullName : undefined,
              }
            : undefined,
        }
      : undefined,
    requestedBy: requestedBy
      ? {
          _id:
            typeof requestedBy._id === "string"
              ? requestedBy._id
              : typeof requestedBy.id === "string"
                ? requestedBy.id
                : undefined,
          fullName:
            typeof requestedBy.fullName === "string" ? requestedBy.fullName : undefined,
          email: typeof requestedBy.email === "string" ? requestedBy.email : undefined,
        }
      : undefined,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
  };
}

function compareDoctorProfileChangeRequestsByDateDesc(
  left: AdminDoctorProfileChangeRequest,
  right: AdminDoctorProfileChangeRequest,
) {
  return parseRequestTimestamp(right.createdAt) - parseRequestTimestamp(left.createdAt);
}

function parseRequestTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
