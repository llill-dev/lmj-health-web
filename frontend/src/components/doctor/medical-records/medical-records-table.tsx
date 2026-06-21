import { Calendar, ChevronLeft, Plus, Edit2, FileDown } from 'lucide-react';
import type { MedicalRecordRowVm } from './map-doctor-medical-records';
import { MedicalRecordStatusBadge } from './medical-record-status-badge';
import { DoctorListEmptyIllustration } from '@/components/doctor/shared/doctor-list-empty-illustration';

const TABLE_COLUMNS = [
  'System ID',
  'اسم المريض',
  'التشخيص',
  'المنشأة',
  'التاريخ',
  'الحالة',
  'الإجراءات',
] as const;

const thClass =
  'px-4 py-3 text-center align-middle font-cairo text-[12px] font-extrabold text-[#0F766E]';
const tdClass = 'px-4 py-4 text-center align-middle';

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
  if (!rows.length) {
    return (
      <DoctorListEmptyIllustration
        variant="teal"
        imageSrc="/images/photo-not-found_appotemint.png"
        imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
        title={
          isFiltered
            ? 'لا توجد سجلات تطابق البحث الحالي'
            : 'لا توجد سجلات طبية بعد'
        }
        subtitle={
          isFiltered
            ? 'جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج'
            : 'أنشئ سجلات طبية للمرضى لتوثيق التشخيصات والعلاجات'
        }
        actionLabel="إنشاء سجل جديد"
        onAction={onAddNew ?? (() => {})}
        actionIcon={<Plus className="h-4 w-4" />}
      />
    );
  }

  return (
    <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto overflow-y-visible">
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
                    <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
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
                  <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F79009]"
                      aria-hidden
                    />
                    <span>{row.facilityLabel}</span>
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
                  <div className="flex items-center justify-center gap-3">
                    {onDownloadPdf && (
                      <button
                        type="button"
                        onClick={() => onDownloadPdf(row)}
                        className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-cairo text-[12px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDFA]"
                        title="تحميل PDF"
                      >
                        <FileDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>PDF</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-cairo text-[12px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDFA]"
                        title="تعديل السجل"
                      >
                        <Edit2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>تعديل</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(row)}
                      className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-primary/80"
                    >
                      <span>عرض التفاصيل</span>
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
