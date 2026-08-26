"use client";

import { Activity } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useDoctorDiagnosisAnalytics } from "@/hooks/doctor/dashboard/useDoctorDiagnosisAnalytics";
import DashboardSectionHeading from "@/components/doctor/dashboard/dashboard-section-heading";

export default function DiagnosisAnalyticsSection() {
  const { t } = useI18n();
  const analytics = useDoctorDiagnosisAnalytics("week");
  const maxValue = Math.max(...analytics.series.map((item) => item.value), 1);

  return (
    <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <DashboardSectionHeading
        title={t("doctor.dashboard.diagnosisAnalytics.title")}
        actionLabel=""
        className="mb-4"
      />

      {analytics.isAwaitingData ? (
        <p className="font-cairo text-[13px] font-semibold text-[#667085]">
          {t("doctor.dashboard.diagnosisAnalytics.loading")}
        </p>
      ) : analytics.series.length === 0 ? (
        <p className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
          {t("doctor.dashboard.diagnosisAnalytics.noData")}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between font-cairo text-[13px] font-semibold text-[#667085]">
            <span>{t("doctor.dashboard.diagnosisAnalytics.totalRecords")}</span>
            <span className="font-black text-[#111827]">{analytics.total}</span>
          </div>
          {analytics.series.slice(-6).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between font-cairo text-[12px] font-semibold text-[#475467]">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F2F4F7]">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.max(8, (item.value / maxValue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 font-cairo text-[11px] font-semibold text-[#98A2B3]">
        <Activity className="h-3.5 w-3.5" />
        {t("doctor.dashboard.diagnosisAnalytics.dependencyNote")}
      </div>
    </section>
  );
}
