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

const STATUS_LABELS: Record<RestoreRequest["status"], string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const STATUS_STYLES: Record<RestoreRequest["status"], string> = {
  pending: "border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]",
  approved: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
  rejected: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
};

function formatDate(value?: string) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير محدد";
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDoctorRestoreRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<RestoreRequest | null>(
    null,
  );
  const { requests, isAwaitingData, isError, refetch } =
    useAdminDoctorRestoreRequests({ limit: 50 });

  const pendingCount = requests.filter((item) => item.status === "pending").length;
  const reviewedCount = requests.length - pendingCount;

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
          subtitle="مراجعة طلبات الأطباء الذين انتهت فترة الاسترجاع التلقائي لحساباتهم"
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "pending",
              icon: <Clock className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "..." : pendingCount,
              label: "طلبات قيد المراجعة",
            },
            {
              key: "reviewed",
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "..." : reviewedCount,
              label: "طلبات تمت مراجعتها",
            },
          ]}
        />

        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <AlertCircle className="h-7 w-7 text-[#DC2626]" />
            <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
              تعذر تحميل طلبات الاستعادة
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        ) : null}

        {!isError && isAwaitingData ? (
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center font-cairo text-[13px] font-bold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            جار تحميل طلبات الاستعادة...
          </div>
        ) : null}

        {!isError && !isAwaitingData && requests.length === 0 ? (
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#98A2B3]" />
            <div className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
              لا توجد طلبات استعادة حالياً
            </div>
            <div className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              ستظهر هنا طلبات الأطباء بعد انتهاء فترة الاسترجاع التلقائي وتأكيد رمز OTP.
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
                        {request.doctorEmail || request.doctorPhone || request.doctorId}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-cairo text-[11px] font-extrabold ${STATUS_STYLES[request.status]}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 font-cairo text-[12px] font-semibold text-[#475467]">
                    <div>تاريخ الطلب: {formatDate(request.requestedAt)}</div>
                    {request.specialization ? (
                      <div>الاختصاص: {request.specialization}</div>
                    ) : null}
                    {request.reason ? <div>سبب الاستعادة: {request.reason}</div> : null}
                    {request.deletionReason ? (
                      <div>سبب الحذف: {request.deletionReason}</div>
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
                        مراجعة الطلب
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
