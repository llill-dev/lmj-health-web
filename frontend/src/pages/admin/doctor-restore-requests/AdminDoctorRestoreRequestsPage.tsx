"use client";

import { Helmet } from "react-helmet-async";
import { AlertCircle, ShieldCheck } from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useAdminDoctorRestoreRequests } from "@/hooks/admin/users/useAdminDoctorRestoreRequests";

export default function AdminDoctorRestoreRequestsPage() {
  const { requests, isAwaitingData, isError, refetch } =
    useAdminDoctorRestoreRequests({});

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
          subtitle="هذه الواجهة مرتبطة بمسارات غير موثقة في swagger_api.md لذلك تم تعطيلها حالياً"
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
          kpiColumns={1}
          kpis={[
            {
              key: "requests",
              icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "…" : requests.length,
              label: "طلبات محمّلة من تدفق غير مدعوم",
            },
          ]}
        />

        {isError ? (
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
        ) : (
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
            <AlertCircle className="mx-auto h-8 w-8 text-[#98A2B3]" />
            <div className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
              الميزة غير متاحة حالياً
            </div>
            <div className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
              تم إيقاف واجهة طلبات استعادة حساب الأطباء لأن مسارات هذا التدفق غير
              موثقة في <code>swagger_api.md</code>.
            </div>
            <div className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
              عدد الطلبات المحمّلة: {requests.length.toLocaleString("ar-SA")}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </>
  );
}
