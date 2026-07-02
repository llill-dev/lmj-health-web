import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "@/components/admin/skeletons/admin-skeleton-primitives";
import { useAdminDoctorRestoreRequests } from "@/hooks/admin/users/useAdminDoctorRestoreRequests";
import ReviewRestoreRequestDialog from "@/components/admin/users/ReviewRestoreRequestDialog";

type RestoreRequestStatusFilter = "all" | "pending" | "approved" | "rejected";

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

function formatRestoreRequestDate(value?: string) {
  if (!value) return "?";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "?";
  return parsed.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function restoreRequestStatusLabel(status: RestoreRequestStatusFilter) {
  const labels: Record<RestoreRequestStatusFilter, string> = {
    all: "الكل",
    pending: "معلق",
    approved: "مقبول",
    rejected: "مرفوض",
  };
  return labels[status] || status;
}

function restoreRequestStatusTone(status: RestoreRequest["status"]) {
  const tones: Record<RestoreRequest["status"], string> = {
    pending: "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
    approved: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
    rejected: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  };
  return tones[status] || "";
}

function restoreRequestStatusIcon(status: RestoreRequest["status"]) {
  const icons: Record<RestoreRequest["status"], any> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };
  return icons[status] || Clock;
}

export default function AdminDoctorRestoreRequestsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<RestoreRequestStatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestoreRequest | null>(
    null,
  );

  const { requests, isAwaitingData, isError, error, refetch } =
    useAdminDoctorRestoreRequests({
      status: statusFilter === "all" ? undefined : statusFilter,
      search: query || undefined,
      page,
      limit: pageSize,
    });

  const filteredRequests = useMemo(() => {
    const text = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" ? true : request.status === statusFilter;
      if (!matchesStatus) return false;
      if (!text) return true;
      return [
        request.doctorName,
        request.doctorEmail,
        request.doctorPhone,
        request.specialization,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    });
  }, [query, statusFilter, requests]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / Math.max(pageSize, 1)),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [currentPage, filteredRequests, pageSize]);
  const rangeStart =
    filteredRequests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    filteredRequests.length === 0
      ? 0
      : Math.min(currentPage * pageSize, filteredRequests.length);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return [
      {
        title: "طلبات معلقة",
        value: pending,
        icon: Clock,
        tone: {
          border: "border-[#FCD34D]",
          bg: "bg-[#FEF3C7]",
          iconBg: "bg-[#FDE68A]",
          iconColor: "text-[#92400E]",
          valueColor: "text-[#92400E]",
        },
      },
      {
        title: "طلبات مقبولة",
        value: approved,
        icon: CheckCircle2,
        tone: {
          border: "border-[#BBF7D0]",
          bg: "bg-[#F0FDF4]",
          iconBg: "bg-[#DCFCE7]",
          iconColor: "text-[#16A34A]",
          valueColor: "text-[#16A34A]",
        },
      },
      {
        title: "طلبات مرفوضة",
        value: rejected,
        icon: XCircle,
        tone: {
          border: "border-[#FECACA]",
          bg: "bg-[#FEF2F2]",
          iconBg: "bg-[#FEE2E2]",
          iconColor: "text-[#DC2626]",
          valueColor: "text-[#DC2626]",
        },
      },
      {
        title: "إجمالي الطلبات",
        value: requests.length,
        icon: ShieldCheck,
        tone: {
          border: "border-[#CFFAFE]",
          bg: "bg-[#ECFEFF]",
          iconBg: "bg-primary/15",
          iconColor: "text-primary",
          valueColor: "text-primary",
        },
      },
    ];
  }, [requests]);

  return (
    <>
      <Helmet>
        <title>طلبات استعادة حساب الأطباء • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="طلبات استعادة حساب الأطباء"
          subtitle="مراجعة وإدارة طلبات استعادة الحسابات المحذوفة"
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={stats.map((c) => {
            const Icon = c.icon;
            return {
              key: c.title,
              icon: <Icon className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : c.value,
              label: c.title,
            };
          })}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="ابحث بالاسم أو البريد أو الهاتف أو الاختصاص..."
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-11 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            </div>

            <StyledSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as RestoreRequestStatusFilter);
                setPage(1);
              }}
              options={[
                { value: "all", label: "كل الحالات" },
                { value: "pending", label: "معلق" },
                { value: "approved", label: "مقبول" },
                { value: "rejected", label: "مرفوض" },
              ]}
              placeholder="كل الحالات"
              size="sm"
              tone="muted"
            />
          </div>
        </section>

        {isAwaitingData ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => {
              const delay = createStaggeredDelay(i);
              return (
                <article
                  key={i}
                  className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
                        <AdminSkeletonBlock className="h-6 w-20 rounded-full" />
                        <AdminSkeletonBlock className="h-5 w-48" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
                          <AdminSkeletonBlock className="h-3 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
                          <AdminSkeletonBlock className="h-3 w-24" />
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
                          <AdminSkeletonBlock className="h-3 w-40" />
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
                          <AdminSkeletonBlock className="h-3 w-36" />
                        </div>
                        <AdminSkeletonBlock className="mt-3 h-16 w-full rounded-[8px]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 lg:pt-1">
                      <AdminSkeletonBlock className="h-9 w-32 rounded-[8px]" />
                    </div>
                  </div>
                </article>
              );
            })}
          </>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <AlertCircle className="h-7 w-7 text-[#DC2626]" />
            <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
              تعذّر تحميل الطلبات
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            لا توجد طلبات مطابقة للبحث الحالي.
          </div>
        ) : (
          <section className="space-y-4">
            {visibleRequests.map((request) => {
              const StatusIcon = restoreRequestStatusIcon(request.status);
              return (
                <article
                  key={request._id}
                  className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.09)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
                        <div
                          className={`inline-flex h-[24px] items-center rounded-[999px] border px-3 font-cairo text-[11px] font-extrabold ${restoreRequestStatusTone(
                            request.status,
                          )}`}
                        >
                          <StatusIcon className="h-3 w-3 ml-1.5" />
                          {restoreRequestStatusLabel(request.status)}
                        </div>
                        <h2 className="font-cairo text-[16px] font-black text-[#111827]">
                          {request.doctorName}
                        </h2>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <User className="h-4 w-4 text-primary" />
                          <span>معرف الطبيب: {request.doctorId}</span>
                        </div>
                        {request.specialization && (
                          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>الاختصاص: {request.specialization}</span>
                          </div>
                        )}
                        {request.doctorEmail && (
                          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <span>البريد: {request.doctorEmail}</span>
                          </div>
                        )}
                        {request.doctorPhone && (
                          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <span>الهاتف: {request.doctorPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span>
                            تاريخ الطلب:{" "}
                            {formatRestoreRequestDate(request.requestedAt)}
                          </span>
                        </div>
                        {request.deletionReason && (
                          <div className="mt-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] p-3">
                            <div className="font-cairo text-[11px] font-extrabold text-[#991B1B] mb-1">
                              سبب الحذف:
                            </div>
                            <div className="font-cairo text-[12px] font-semibold text-[#7F1D1D]">
                              {request.deletionReason}
                            </div>
                          </div>
                        )}
                        {request.reviewNote && (
                          <div className="mt-3 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] p-3">
                            <div className="font-cairo text-[11px] font-extrabold text-[#166534] mb-1">
                              ملاحظة المراجعة:
                            </div>
                            <div className="font-cairo text-[12px] font-semibold text-[#14532D]">
                              {request.reviewNote}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 lg:pt-1">
                      {request.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewOpen(true);
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-primary bg-primary px-4 font-cairo text-[11px] font-extrabold text-white transition hover:bg-primary/90"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          مراجعة الطلب
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/doctor-restore-requests/${request._id}`,
                              { state: { request } },
                            )
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[11px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          عرض التفاصيل
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!isAwaitingData && !isError && filteredRequests.length > 0 ? (
          <DoctorTablePagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            summaryLabel={`عرض ${rangeStart.toLocaleString("ar-SA")}–${rangeEnd.toLocaleString("ar-SA")} من ${filteredRequests.length.toLocaleString("ar-SA")} طلب`}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        ) : null}

        <ReviewRestoreRequestDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          request={selectedRequest}
          onSuccess={() => {
            refetch();
          }}
        />

        <div className="h-8" />
      </div>
    </>
  );
}
