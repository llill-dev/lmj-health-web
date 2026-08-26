import { Calendar, ChevronLeft, MapPin } from "lucide-react";
import type { PrescriptionHubRowVm } from "./map-prescriptions-hub";
import { PrescriptionsHubStatusBadge } from "./prescriptions-hub-status-badge";
import { useI18n } from "@/i18n/provider";

export function PrescriptionsHubTable({
  rows,
  onViewPrescription,
}: {
  rows: PrescriptionHubRowVm[];
  onViewPrescription: (row: PrescriptionHubRowVm) => void;
}) {
  const { t } = useI18n();

  const TABLE_COLUMNS = [
    t("doctor.prescriptionsHub.table.systemId"),
    t("doctor.prescriptionsHub.table.patientName"),
    t("doctor.prescriptionsHub.table.facility"),
    t("doctor.prescriptionsHub.table.date"),
    t("doctor.prescriptionsHub.table.status"),
    t("doctor.prescriptionsHub.table.actions"),
  ] as const;

  const thClass =
    "px-4 py-3 text-center align-middle font-cairo text-[12px] font-extrabold text-[#0F766E]";
  const tdClass = "px-4 py-4 text-center align-middle";

  if (!rows.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white px-6 py-14 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        {t("doctor.prescriptionsHub.table.emptyState")}
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-[#B9E6E1] bg-[#D4EFED]">
              {TABLE_COLUMNS.map((head) => (
                <th key={head} className={thClass}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
              >
                <td
                  className={`${tdClass} font-cairo text-[12px] font-extrabold text-primary`}
                >
                  {row.systemId}
                </td>
                <td className={tdClass}>
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                      {row.patientName}
                    </div>
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {row.patientPhone}
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="inline-flex max-w-[220px] items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054]">
                    <MapPin
                      className="h-3.5 w-3.5 shrink-0 text-[#F97316]"
                      aria-hidden
                    />
                    <span className="truncate">{row.facilityLabel}</span>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-semibold text-[#475467]">
                    <Calendar
                      className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]"
                      aria-hidden
                    />
                    <span>{row.dateLabel}</span>
                  </div>
                </td>
                <td className={tdClass}>
                  <PrescriptionsHubStatusBadge
                    statusKey={row.statusKey}
                    label={row.statusLabel}
                  />
                </td>
                <td className={tdClass}>
                  <button
                    type="button"
                    onClick={() => onViewPrescription(row)}
                    className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-[#0A7A77]"
                  >
                    <span>
                      {t("doctor.prescriptionsHub.table.viewPrescription")}
                    </span>
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
