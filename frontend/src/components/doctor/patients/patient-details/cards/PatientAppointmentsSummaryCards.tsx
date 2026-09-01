import type { PatientAppointmentCounts } from "@/lib/doctor/dashboard/countPatientAppointments";
import { useI18n } from "@/i18n/provider";

type PatientAppointmentsSummaryCardsProps = {
  counts: PatientAppointmentCounts;
  isLoading?: boolean;
  showBreakdown?: boolean;
};

function SummaryCard({
  label,
  value,
  borderClass,
  bgClass,
  valueClass,
  isLoading,
}: {
  label: string;
  value: number;
  borderClass: string;
  bgClass: string;
  valueClass: string;
  isLoading?: boolean;
}) {
  return (
    <div
      className={`rounded-[12px] border px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] ${borderClass} ${bgClass}`}
    >
      <div className="font-cairo text-[11px] font-bold text-[#667085]">{label}</div>
      <div className={`mt-2 font-cairo text-[28px] font-black ${valueClass}`}>
        {isLoading ? "..." : value}
      </div>
    </div>
  );
}

export function PatientAppointmentsSummaryCards({
  counts,
  isLoading,
  showBreakdown = true,
}: PatientAppointmentsSummaryCardsProps) {
  const { t } = useI18n();
  return (
    <section
      className={
        showBreakdown
          ? "grid grid-cols-2 gap-3 lg:grid-cols-5"
          : "grid grid-cols-1 gap-3 sm:max-w-xs"
      }
    >
      <SummaryCard
        label={t("doctor.appointmentsSummary.total")}
        value={counts.total}
        borderClass="border-primary/30"
        bgClass="bg-[#F0FDFA]"
        valueClass="text-primary"
        isLoading={isLoading}
      />
      {showBreakdown ? (
        <>
          <SummaryCard
            label={t("doctor.appointmentsSummary.upcoming")}
            value={counts.upcoming}
            borderClass="border-[#BBF7D0]"
            bgClass="bg-[#F0FDF4]"
            valueClass="text-[#16A34A]"
            isLoading={isLoading}
          />
          <SummaryCard
            label={t("doctor.appointmentsSummary.completed")}
            value={counts.completed}
            borderClass="border-[#67E8F9]"
            bgClass="bg-[#ECFEFF]"
            valueClass="text-primary"
            isLoading={isLoading}
          />
          <SummaryCard
            label={t("doctor.appointmentsSummary.cancelled")}
            value={counts.cancelled}
            borderClass="border-[#FECACA]"
            bgClass="bg-[#FEF2F2]"
            valueClass="text-[#B42318]"
            isLoading={isLoading}
          />
          <SummaryCard
            label={t("doctor.appointmentsSummary.noShow")}
            value={counts.noShow}
            borderClass="border-[#E9D4FF]"
            bgClass="bg-[#FAF5FF]"
            valueClass="text-[#7C3AED]"
            isLoading={isLoading}
          />
        </>
      ) : null}
    </section>
  );
}
