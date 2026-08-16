"use client";

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import ReviewRestoreRequestDialog from "@/components/admin/users/ReviewRestoreRequestDialog";
import {
  type RestoreRequest,
  useAdminDoctorRestoreRequests,
} from "@/hooks/admin/users/useAdminDoctorRestoreRequests";
import { useI18n } from "@/i18n/provider";

const STATUS_STYLES: Record<RestoreRequest["status"], string> = {
  pending: "border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]",
  approved: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
  rejected: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
};

export default function AdminDoctorRestoreRequestsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

  const statusLabels: Record<RestoreRequest["status"], string> = {
    pending: tr("قيد المراجعة", "Pending review"),
    approved: tr("مقبول", "Approved"),
    rejected: tr("مرفوض", "Rejected"),
  };

  const [selectedRequest, setSelectedRequest] = useState<RestoreRequest | null>(
    null,
  );
  const { requests, isAwaitingData, isRefetching, isError, refetch } =
    useAdminDoctorRestoreRequests({ limit: 50 });

  const pendingCount = requests.filter((item) => item.status === "pending")
    .length;
  const reviewedCount = requests.length - pendingCount;

  function formatDate(value?: string) {
    if (!value) return tr("غير محدد", "Not set");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return tr("غير محدد", "Not set");
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <Helmet>
        <title>
          {tr(
            "طلبات استعادة حساب الأطباء",
            "Doctor account restore requests",
          )}{" "}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr(
            "طلبات استعادة حساب الأطباء",
            "Doctor account restore requests",
          )}
          subtitle={tr(
            "مراجعة طلبات الأطباء الذين انتهت فترة الاسترجاع التلقائي لحساباتهم",
            "Review requests from doctors whose automatic restore window has ended",
          )}
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "pending",
              icon: <Clock className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "..." : pendingCount,
              label: tr("طلبات قيد المراجعة", "Pending requests"),
            },
            {
              key: "reviewed",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "..." : reviewedCount,
              label: tr("طلبات تمت مراجعتها", "Reviewed requests"),
            },
          ]}
        />

        <div className="flex items-start gap-3 rounded-[12px] border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#B54708]">
            {tr(
              "تُستخدم هذه القائمة لفرز الطلبات التي تحتاج قرارًا إداريًا بعد انتهاء الاسترجاع التلقائي. الطلبات المعلّقة تحتاج فتح المراجعة، أما الطلبات المقبولة أو المرفوضة فتبقى هنا كسجل مرجعي للحالة النهائية.",
              "This list is used to triage requests that need an admin decision after the automatic restore window ends. Pending requests need review, while approved or rejected requests remain here as a reference record of the final status.",
            )}
          </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <AlertCircle className="h-7 w-7 text-[#DC2626]" />
            <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
              {tr(
                "تعذر تحميل طلبات الاستعادة",
                "Failed to load restore requests",
              )}
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              <RefreshCw className="h-4 w-4" />
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : null}

        {!isError && isAwaitingData ? (
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center font-cairo text-[13px] font-bold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            {tr(
              "جار تحميل طلبات الاستعادة...",
              "Loading restore requests…",
            )}
          </div>
        ) : null}

        {!isError && !isAwaitingData && isRefetching ? (
          <div className="flex items-center justify-center gap-2 rounded-[12px] border border-[#D1FAE5] bg-[#ECFDF5] px-6 py-3 text-center font-cairo text-[12px] font-extrabold text-[#047857] shadow-[0_12px_24px_rgba(0,0,0,0.04)]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {tr("جارٍ تحديث طلبات الاستعادة...", "Refreshing restore requests...")}
          </div>
        ) : null}

        {!isError && !isAwaitingData && requests.length === 0 ? (
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#98A2B3]" />
            <div className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
              {tr(
                "لا توجد طلبات استعادة حالياً",
                "No restore requests right now",
              )}
            </div>
            <div className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              {tr(
                "ستظهر هنا طلبات الأطباء بعد انتهاء فترة الاسترجاع التلقائي وتأكيد رمز OTP.",
                "Doctor requests appear here after the automatic restore window ends and OTP is confirmed.",
              )}
            </div>
          </div>
        ) : null}

        {!isError && requests.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {requests.map((request) => {
              const StatusIcon =
                request.status === "approved"
                  ? CheckCircle2
                  : request.status === "rejected"
                    ? XCircle
                    : Clock;

              return (
                <article
                  key={request._id}
                  className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-cairo text-[15px] font-black text-[#111827]">
                        {request.doctorName}
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-bold text-[#667085]">
                        {request.doctorEmail ||
                          request.doctorPhone ||
                          request.doctorId}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-cairo text-[11px] font-extrabold ${STATUS_STYLES[request.status]}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusLabels[request.status]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 font-cairo text-[12px] font-semibold text-[#475467]">
                    <div>
                      {tr("تاريخ الطلب:", "Requested:")}{" "}
                      {formatDate(request.requestedAt)}
                    </div>
                    {request.specialization ? (
                      <div>
                        {tr("الاختصاص:", "Specialization:")}{" "}
                        {request.specialization}
                      </div>
                    ) : null}
                    {request.reason ? (
                      <div>
                        {tr("سبب الاستعادة:", "Restore reason:")}{" "}
                        {request.reason}
                      </div>
                    ) : null}
                    {request.deletionReason ? (
                      <div>
                        {tr("سبب الحذف:", "Deletion reason:")}{" "}
                        {request.deletionReason}
                      </div>
                    ) : null}
                  </div>

                  {request.status === "pending" ? (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {tr("مراجعة الطلب", "Review request")}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="h-8" />
      </div>

      <ReviewRestoreRequestDialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={() => {
          setSelectedRequest(null);
          void refetch();
        }}
      />
    </>
  );
}
