import { Helmet } from "react-helmet-async";
import {
  UserCheck,
  Search,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  AlertCircle,
  FilterX,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import { useAdminAccessRequests } from "@/hooks/admin/access-requests/useAdminAccessRequests";
import { useAdminAccessRequestDetails } from "@/hooks/admin/access-requests/useAdminAccessRequests";
import AccessRequestDetailsDialog from "@/components/admin/access-requests/AccessRequestDetailsDialog";
import AccessRequestCardSkeleton from "@/components/admin/access-requests/AccessRequestCardSkeleton";
import { useI18n } from "@/i18n/provider";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";

type RequestStatus = "pending" | "approved" | "rejected" | "all";

function hasMissingAccessRequestIdentity(request: any) {
  const doctorName = request.doctor?.fullName || request.doctorName;
  const doctorEmail = request.doctor?.email || request.doctorEmail;
  const patientName = request.patient?.fullName || request.patientName;
  const patientId = request.patient?.publicId || request.patientId;

  return !doctorName || !doctorEmail || !patientName || !patientId;
}

export default function AdminAccessRequestsPage() {
  const navigate = useNavigate();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const dateLocale = locale === "ar" ? "ar-SY" : "en-US";

  const statusLabels: Record<RequestStatus, string> = {
    pending: tr("معلّقة", "Pending"),
    approved: tr("مقبولة", "Approved"),
    rejected: tr("مرفوضة", "Rejected"),
    all: tr("كل الحالات", "All statuses"),
  };

  const statusColors: Record<RequestStatus, string> = {
    pending: "bg-[#FEF3C7] text-[#B45309]",
    approved: "bg-[#ECFDF3] text-[#16A34A]",
    rejected: "bg-[#FEF2F2] text-[#B42318]",
    all: "bg-[#F3F4F6] text-[#374151]",
  };

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    status: RequestStatus;
    search: string;
  }>({
    page: 1,
    limit: 10,
    status: "pending",
    search: "",
  });

  const { requests, total, isAwaitingData, isRefetching, error, refetch } =
    useAdminAccessRequests({
      page: filters.page,
      limit: filters.limit,
      status: filters.status === "all" ? undefined : filters.status,
    });

  const { request: selectedRequest, isAwaitingData: detailsAwaiting } =
    useAdminAccessRequestDetails(selectedRequestId);

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const filteredRequests = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r: any) => {
      const doctorName = r.doctor?.fullName || r.doctorName || "";
      const patientName = r.patient?.fullName || r.patientName || "";
      const patientId = r.patient?.publicId || r.patientId || "";
      return (
        doctorName.toLowerCase().includes(q) ||
        patientName.toLowerCase().includes(q) ||
        patientId.toLowerCase().includes(q)
      );
    });
  }, [requests, filters.search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    requests.forEach((r: any) => {
      const status = r.status || "pending";
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [requests]);

  const stats = useMemo(
    () => [
      {
        title: tr("طلبات معلّقة", "Pending requests"),
        value: isAwaitingData ? "—" : String(statusCounts.pending),
        icon: Clock,
        tone: {
          border: "border-[#FDE68A]",
          bg: "bg-[#FFFBEB]",
          iconBg: "bg-[#F59E0B]",
          iconFg: "text-white",
          valueFg: "text-[#B45309]",
        },
      },
      {
        title: tr("طلبات مقبولة", "Approved requests"),
        value: isAwaitingData ? "—" : String(statusCounts.approved),
        icon: CheckCircle,
        tone: {
          border: "border-[#BBF7D0]",
          bg: "bg-[#F0FDF4]",
          iconBg: "bg-[#16A34A]",
          iconFg: "text-white",
          valueFg: "text-[#16A34A]",
        },
      },
      {
        title: tr("طلبات مرفوضة", "Rejected requests"),
        value: isAwaitingData ? "—" : String(statusCounts.rejected),
        icon: XCircle,
        tone: {
          border: "border-[#FECACA]",
          bg: "bg-[#FEF2F2]",
          iconBg: "bg-[#EF4444]",
          iconFg: "text-white",
          valueFg: "text-[#B42318]",
        },
      },
      {
        title: tr("إجمالي الطلبات", "Total requests"),
        value: isAwaitingData ? "—" : String(total),
        icon: UserCheck,
        tone: {
          border: "border-[#CFFAFE]",
          bg: "bg-[#ECFEFF]",
          iconBg: "bg-[#0F8F8B]",
          iconFg: "text-white",
          valueFg: "text-[#0F8F8B]",
        },
      },
    ],
    [
      statusCounts.pending,
      statusCounts.approved,
      statusCounts.rejected,
      total,
      isAwaitingData,
      locale,
    ],
  );

  const handleViewDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
    setDetailsOpen(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>{tr("إدارة طلبات الوصول", "Access requests")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="min-h-full text-[#111827]">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("إدارة طلبات الوصول", "Access requests")}
          subtitle={tr(
            "مراجعة وإدارة طلبات الوصول إلى بيانات المرضى",
            "Review and manage patient data access requests",
          )}
          headerIcon={<UserCheck className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={stats.map((s) => {
            const Icon = s.icon;
            return {
              key: s.title,
              icon: <Icon className="h-5 w-5 shrink-0" />,
              value: s.value,
              label: s.title,
            };
          })}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه الصفحة لفرز طلبات الوصول ومراجعة اكتمال البيانات قبل فتح التفاصيل. القرار النهائي بالموافقة أو الرفض يتم من نافذة التفاصيل حتى يبقى الطلب وسياقه ومبرراته في مكان واحد.",
              "This page is for triaging access requests and checking data completeness before opening details. The final approve or reject decision is handled from the details dialog so the request, its context, and justification stay in one place.",
            )}
          </div>
        </div>

        {/* Filters Section */}
        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <input
                  placeholder={tr(
                    "بحث بالطبيب أو المريض...",
                    "Search by doctor or patient...",
                  )}
                  className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]"
                  value={filters.search}
                  disabled={isAwaitingData}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                  <Search className="h-5 w-5" />
                </div>
              </div>

              <div className="w-[168px] shrink-0">
                <StyledSelect
                  size="sm"
                  tone="muted"
                  value={filters.status}
                  disabled={isAwaitingData}
                  onChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: v as RequestStatus,
                      page: 1,
                    }))
                  }
                  options={[
                    { value: "pending", label: statusLabels.pending },
                    { value: "approved", label: statusLabels.approved },
                    { value: "rejected", label: statusLabels.rejected },
                    { value: "all", label: statusLabels.all },
                  ]}
                  listboxAriaLabel={tr("حالة الطلب", "Request status")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(filters.search || filters.status !== "all") ? (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      status: "all",
                      search: "",
                      page: 1,
                    }))
                  }
                  className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] hover:bg-[#F9FAFB]"
                >
                  <FilterX className="h-4 w-4" />
                  {tr("مسح الفلاتر", "Clear filters")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                {isRefetching
                  ? tr("جارٍ التحديث...", "Refreshing...")
                  : tr("تحديث", "Refresh")}
              </button>
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {isAwaitingData ? "—" : total} {tr("نتيجة", "results")}
              </div>
            </div>
          </div>
        </section>

        {/* Requests List */}
        <section className="mt-5 space-y-4">
          {isAwaitingData ? (
            <>
              <AccessRequestCardSkeleton />
              <AccessRequestCardSkeleton />
              <AccessRequestCardSkeleton />
            </>
          ) : error ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <div className="font-cairo text-[12px] font-semibold text-[#B42318]">
                {userFacingErrorMessage(
                  error,
                  tr(
                    "تعذّر تحميل طلبات الوصول.",
                    "Failed to load access requests.",
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]"
              >
                <RefreshCw className="h-4 w-4" />
                {tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                {filters.search || filters.status !== "all"
                  ? tr(
                      "لا توجد طلبات وصول مطابقة للبحث أو الحالة المحددة.",
                      "No access requests match the current search or status.",
                    )
                  : tr(
                      "لا توجد طلبات وصول حتى الآن.",
                      "No access requests yet.",
                    )}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {filters.search || filters.status !== "all"
                  ? tr(
                      "جرّب توسيع البحث أو مسح الفلاتر لعرض طلبات أكثر.",
                      "Try broadening the search or clearing filters to show more requests.",
                    )
                  : tr(
                      "ستظهر هنا الطلبات فور وصولها من الأطباء مع بيانات المريض المرتبطة بها.",
                      "Requests will appear here once they are submitted with their linked patient data.",
                    )}
              </div>
            </div>
          ) : (
            filteredRequests.map((request: any) => (
              <div
                key={request._id || request.id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D5E8E6] bg-[#F8FFFE] px-3 py-1 font-cairo text-[10px] font-extrabold text-primary">
                          <FileText className="h-3.5 w-3.5" />
                          {tr("طلب وصول لبيانات مريض", "Patient data access request")}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-cairo text-[14px] font-black text-[#111827]">
                            {request.doctor?.fullName ||
                              request.doctorName ||
                              "—"}
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${statusColors[request.status || "pending"]}`}
                          >
                            {statusLabels[request.status || "pending"]}
                          </span>
                        </div>
                        <div className="mt-2 font-cairo text-[12px] font-bold text-[#98A2B3]">
                          {tr("طلب الوصول:", "Access request:")}{" "}
                          {request._id || request.id}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(request._id || request.id)
                        }
                        className="inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#4B5563] hover:bg-[#E5E7EB]"
                      >
                        <Eye className="h-4 w-4" />
                        {tr("عرض التفاصيل", "View details")}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
                        <User className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                            {tr("المريض", "Patient")}
                          </div>
                          <div className="font-cairo text-[11px] font-bold text-[#111827] truncate">
                            {request.patient?.fullName ||
                              request.patientName ||
                              "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                            {tr("تاريخ الطلب", "Request date")}
                          </div>
                          <div className="font-cairo text-[11px] font-bold text-[#111827] truncate">
                            {request.createdAt
                              ? new Date(request.createdAt).toLocaleDateString(
                                  dateLocale,
                                )
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                            {tr("البريد الإلكتروني", "Email")}
                          </div>
                          <div className="font-cairo text-[11px] font-bold text-[#111827] truncate">
                            {request.doctor?.email ||
                              request.doctorEmail ||
                              "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                            {tr("الهاتف", "Phone")}
                          </div>
                          <div className="font-cairo text-[11px] font-bold text-[#111827] truncate">
                            {request.doctor?.phone ||
                              request.doctorPhone ||
                              "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-[999px] bg-[#F8FAFC] px-3 py-1 font-cairo text-[11px] font-bold text-[#475467]">
                        {request.status === "pending"
                          ? tr(
                              "الإجراء المتاح: مراجعة القرار من التفاصيل",
                              "Available action: review decision in details",
                            )
                          : request.status === "approved"
                            ? tr(
                                "الحالة النهائية: تم قبول الطلب",
                                "Final state: request approved",
                              )
                            : tr(
                                "الحالة النهائية: تم رفض الطلب",
                                "Final state: request rejected",
                              )}
                      </span>
                      <span className="inline-flex items-center rounded-[999px] bg-[#F8FAFC] px-3 py-1 font-cairo text-[11px] font-bold text-[#667085]">
                        {tr("الجهة الطالبة:", "Requester:")}{" "}
                        {request.doctor?.fullName || request.doctorName || "—"}
                      </span>
                    </div>

                    {hasMissingAccessRequestIdentity(request) ? (
                      <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                          <div className="font-cairo text-[11px] font-bold leading-5 text-[#92400E]">
                            {tr(
                              "بعض بيانات الطبيب أو المريض غير مكتملة في الاستجابة الحالية. يمكنك فتح التفاصيل لرؤية القيم المتاحة ومراجعة الطلب دون افتراض حقول مفقودة.",
                              "Some doctor or patient fields are missing in the current response. Open details to review the available values without assuming missing fields.",
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Pagination */}
        {!isAwaitingData && !error && filteredRequests.length > 0 ? (
          <section className="mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="font-cairo text-[12px] font-bold text-[#667085]">
              {tr("الصفحة", "Page")} {filters.page} {tr("من", "of")} {totalPages}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[128px] shrink-0">
                <StyledSelect
                  size="xs"
                  tone="emphasis"
                  value={String(filters.limit)}
                  disabled={isAwaitingData}
                  onChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      limit: Number(v),
                      page: 1,
                    }))
                  }
                  options={[10, 20, 50, 100].map((v) => ({
                    value: String(v),
                    label: String(v),
                  }))}
                  listboxAriaLabel={tr(
                    "عدد العناصر في الصفحة",
                    "Items per page",
                  )}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={filters.page <= 1}
                className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tr("السابق", "Previous")}
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, prev.page + 1),
                  }))
                }
                disabled={filters.page >= totalPages}
                className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tr("التالي", "Next")}
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <AccessRequestDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        requestId={selectedRequestId}
        request={selectedRequest}
        isAwaitingData={detailsAwaiting}
      />
    </>
  );
}
