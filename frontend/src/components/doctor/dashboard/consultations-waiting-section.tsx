"use client";

import { UserRound } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

import DashboardSectionHeading from "@/components/doctor/dashboard/dashboard-section-heading";
import { doctorWaitlistDeepLink } from "@/lib/doctor/dashboard/homeSnapshotMappers";

export default function ConsultationsWaitingSection({
  patientName,
  requestId,
  urgencyLevel,
}: {
  patientName?: string;
  requestId?: string;
  urgencyLevel?: string;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const openWaitlist = useCallback(() => {
    if (requestId) {
      navigate(doctorWaitlistDeepLink(requestId));
      return;
    }
    navigate("/doctor/waitlist");
  }, [requestId, navigate]);

  return (
    <section>
      <DashboardSectionHeading
        title={t("doctor.dashboard.waitingList.title")}
        actionLabel={t("doctor.dashboard.waitingList.viewAll")}
        onActionClick={useCallback(
          () => navigate("/doctor/waitlist"),
          [navigate],
        )}
        className="mb-[22px]"
      />

      {patientName || requestId ? (
        <article className="h-[160px] w-full rounded-[8px] border border-[#18C3C0] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.22)]">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="flex-1 text-start">
              <h3 className="font-cairo text-[18px] font-black leading-none text-[#243044]">
                {patientName ?? t("doctor.dashboard.waitingList.request")}
              </h3>
              <p className="mt-2 font-cairo text-[13px] font-semibold text-[#667085]">
                {t("doctor.dashboard.waitingList.closestRequest")}
                {urgencyLevel ? ` · ${urgencyLevel}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={openWaitlist}
              className="rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-black text-white"
            >
              {t("common.continue")}
            </button>
          </div>
        </article>
      ) : (
        <div className="flex h-[160px] items-center justify-center rounded-[8px] border border-dashed border-[#D0D5DD] bg-white px-4 text-center font-cairo text-[13px] font-semibold text-[#667085]">
          {t("doctor.dashboard.waitingList.empty")}
        </div>
      )}
    </section>
  );
}
