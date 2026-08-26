import { Calendar, ChevronLeft, Plus, Edit2, FileDown } from "lucide-react";
import type { MedicalRecordRowVm } from "./map-doctor-medical-records";
import { MedicalRecordStatusBadge } from "./medical-record-status-badge";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import { useI18n } from "@/i18n/provider";

const thClass =
  "px-3 py-3 text-center align-middle font-cairo text-[11px] font-extrabold text-[#0F766E] sm:px-4 sm:text-[12px]";
const tdClass = "px-3 py-3 text-center align-middle sm:px-4 sm:py-4";

export function MedicalRecordsTable({
  rows,
  onOpenDetails,
  onEdit,
  onDownloadPdf,
  onAddNew,
  isFiltered = false,
}: {
  rows: MedicalRecordRowVm[];
  onOpenDetails: (row: MedicalRecordRowVm) => void;
  onEdit?: (row: MedicalRecordRowVm) => void;
  onDownloadPdf?: (row: MedicalRecordRowVm) => void;
  onAddNew?: () => void;
  isFiltered?: boolean;
}) {
  const { t } = useI18n();

  const TABLE_COLUMNS = [
    t("doctor.medicalRecords.table.systemId"),
    t("doctor.medicalRecords.table.patientName"),
    t("doctor.medicalRecords.table.diagnosis"),
    t("doctor.medicalRecords.table.facility"),
    t("doctor.medicalRecords.table.date"),
    t("doctor.medicalRecords.table.status"),
    t("doctor.medicalRecords.table.actions"),
  ] as const;

  if (!rows.length) {
    return (
      <DoctorListEmptyIllustration
        variant="teal"
        imageSrc="/images/photo-not-found_appotemint.png"
        imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
        title={
          isFiltered
            ? t("doctor.medicalRecords.table.emptyFilteredTitle")
            : t("doctor.medicalRecords.table.emptyTitle")
        }
        subtitle={
          isFiltered
            ? t("doctor.medicalRecords.table.emptyFilteredSubtitle")
            : t("doctor.medicalRecords.table.emptySubtitle")
        }
        actionLabel={t("doctor.medicalRecords.table.createRecord")}
        onAction={onAddNew ?? (() => {})}
        actionIcon={<Plus className="h-4 w-4" />}
      />
    );
  }

  return (
    <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-[840px] w-full border-collapse text-center">
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
                key={`${row.patientId}-${row.id}`}
                className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
              >
                <td
                  className={`${tdClass} font-cairo text-[12px] font-extrabold text-primary`}
                >
                  {row.systemId}
                </td>
                <td className={tdClass}>
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="max-w-[180px] break-words font-cairo text-[13px] font-extrabold text-[#101828] sm:max-w-none">
                      {row.patientName}
                    </div>
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {row.patientPhone}
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="mx-auto max-w-[220px] rounded-[10px] bg-[#E6F4F3] px-3 py-2 text-center font-cairo text-[12px] font-bold leading-[18px] text-[#344054]">
                    {row.diagnosis}
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="inline-flex max-w-[180px] items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054] sm:max-w-none">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F79009]"
                      aria-hidden
                    />
                    <span className="break-words">{row.facilityLabel}</span>
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
                  <MedicalRecordStatusBadge
                    statusKey={row.statusKey}
                    label={row.statusLabel}
                  />
                </td>
                <td className={tdClass}>
                  <div className="flex min-w-[180px] items-center justify-center gap-2 sm:gap-3">
                    {onDownloadPdf && (
                      <button
                        type="button"
                        onClick={() => onDownloadPdf(row)}
                        className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-cairo text-[12px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDFA]"
                        title={t("doctor.medicalRecords.table.downloadPdf")}
                      >
                        <FileDown
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        <span>PDF</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-cairo text-[12px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDFA]"
                        title={t("doctor.medicalRecords.table.editRecord")}
                      >
                        <Edit2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>{t("doctor.medicalRecords.table.edit")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(row)}
                      className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-primary/80"
                    >
                      <span>
                        {t("doctor.medicalRecords.table.viewDetails")}
                      </span>
                      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
