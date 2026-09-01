import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";
import { getCurrentLocale } from "@/i18n/runtime";
import { getTranslationValue } from "@/i18n/translations";

export interface RestoreRequest {
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
  reason?: string;
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
      const source = Array.isArray(response.restoreRequests)
        ? response.restoreRequests
        : Array.isArray(response.results)
          ? response.results
          : [];
      const requests = source
        .map(normalizeRestoreRequest)
        .filter(Boolean) as RestoreRequest[];
      return {
        requests,
        page: response.page ?? params.page ?? 1,
        limit: response.limit ?? params.limit ?? requests.length,
        // `results` doubles as a total-count field on some responses; only
        // trust it when it's numeric, never the alternate array shape.
        total:
          response.total ??
          (typeof response.results === "number" ? response.results : undefined) ??
          requests.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    requests: query.data?.requests ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 20,
    total: query.data?.total ?? 0,
    isAwaitingData: query.isLoading,
    isRefetching: query.isFetching && !query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

function normalizeRestoreRequest(raw: unknown): RestoreRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const user = item.user && typeof item.user === "object"
    ? (item.user as Record<string, unknown>)
    : {};
  const doctor = item.doctor && typeof item.doctor === "object"
    ? (item.doctor as Record<string, unknown>)
    : {};
  const accountDeletion =
    item.accountDeletion && typeof item.accountDeletion === "object"
      ? (item.accountDeletion as Record<string, unknown>)
      : {};

  const userId = String(item.userId ?? user.id ?? user._id ?? "");
  const doctorId = String(item.doctorId ?? doctor.id ?? doctor._id ?? "");
  const doctorName = String(
    item.doctorName ??
      doctor.fullName ??
      doctor.name ??
      user.fullName ??
      user.name ??
      getTranslationValue(getCurrentLocale(), "admin.doctorRestoreRequests.unknownDoctor") ??
      "طبيب غير معروف",
  );
  const status = String(
    item.status ?? item.restoreStatus ?? accountDeletion.restoreStatus ?? "pending",
  );

  if (!userId && !doctorId) return null;

  return {
    _id: String(item._id ?? item.id ?? `${userId}-${doctorId}`),
    userId,
    doctorId,
    doctorName,
    doctorEmail: stringOrUndefined(item.doctorEmail ?? doctor.email ?? user.email),
    doctorPhone: stringOrUndefined(item.doctorPhone ?? doctor.phone ?? user.phone),
    specialization: stringOrUndefined(item.specialization ?? doctor.specialization),
    status:
      status === "approved" || status === "rejected" || status === "pending"
        ? status
        : "pending",
    requestedAt: String(
      item.requestedAt ??
        item.restoreRequestedAt ??
        accountDeletion.restoreRequestedAt ??
        "",
    ),
    reviewedAt: stringOrUndefined(item.reviewedAt ?? accountDeletion.reviewedAt),
    reviewedBy: stringOrUndefined(item.reviewedBy ?? accountDeletion.reviewedBy),
    reviewNote: stringOrUndefined(item.reviewNote ?? accountDeletion.reviewNote),
    reason: stringOrUndefined(item.reason ?? accountDeletion.restoreReason),
    deletionReason: stringOrUndefined(
      item.deletionReason ?? accountDeletion.reason,
    ),
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
