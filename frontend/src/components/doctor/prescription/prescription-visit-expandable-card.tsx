import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  Eye,
  Pill,
  Pencil,
  UserRound,
} from 'lucide-react';
import { DoctorInlineDetailsSkeleton } from '@/components/doctor/shared/skeletons';
import { cn } from '@/lib/utils/utils';
import {
  ENCOUNTERS_EXPAND_CONTENT_ITEM,
  ENCOUNTERS_EXPAND_CONTENT_STAGGER,
  ENCOUNTERS_EXPAND_TRANSITION,
} from '@/components/doctor/encounters/encounters-motion';
import type { MedicalVisitCardData } from '@/components/doctor/encounters/types';
import { mapPrescriptionItemsToUi } from './map-prescription-ui';
import { PrescriptionMedicationCard } from './prescription-medication-card';
import type { PrescriptionPreviewVm } from './preview/prescription-preview-types';

type PrescriptionVisitExpandableCardProps = {
  visit: MedicalVisitCardData;
  expanded: boolean;
  onToggle: () => void;
  detailsLoading?: boolean;
  detailsError?: string | null;
  previewVm?: PrescriptionPreviewVm | null;
  onOpenPreview: () => void;
  onOpenEdit: () => void;
};

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-right">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">{label}</div>
      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
        {value}
      </div>
    </div>
  );
}

export function PrescriptionVisitExpandableCard({
  visit,
  expanded,
  onToggle,
  detailsLoading = false,
  detailsError,
  previewVm,
  onOpenPreview,
  onOpenEdit,
}: PrescriptionVisitExpandableCardProps) {
  const medications = previewVm
    ? mapPrescriptionItemsToUi(previewVm.raw)
    : [];
  const medsCount =
    previewVm?.medications.length ??
    medications.length;
  const statusLabel = previewVm?.statusLabel ?? 'مسودة';

  return (
    <motion.article
      layout
      transition={ENCOUNTERS_EXPAND_TRANSITION}
      className={cn(
        'overflow-hidden rounded-[16px] border bg-white transition-shadow duration-300',
        expanded
          ? 'border-primary/25 shadow-[0_20px_48px_-16px_rgba(15,143,139,0.22)]'
          : 'border-[#E2E8F0] shadow-[0_12px_32px_-14px_rgba(15,23,42,0.12)]',
      )}
    >
      <div
        className={cn(
          'flex w-full items-start gap-3 px-4 py-4 text-right sm:px-5',
          expanded ? 'bg-[#F8FFFE]' : 'border-b border-[#F2F4F7]',
        )}
      >
        <div className="flex flex-1 gap-3 items-start min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-[#14b8a6] text-white shadow-[0_8px_18px_rgba(15,143,139,0.28)]">
            <UserRound className="w-5 h-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-cairo text-[15px] font-black text-[#101828]">
              {visit.patientName}
            </div>
            <div className="mt-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
              {visit.visitTypeLabel}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-start gap-4 text-primary">
              <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-bold">
                <Calendar className="w-3 h-3 shrink-0" aria-hidden />
                {visit.listDateLabel}
              </span>
              {visit.listTimeLabel !== '—' ? (
                <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-extrabold">
                  <Clock className="w-3 h-3 shrink-0" aria-hidden />
                  {visit.listTimeLabel}
                  {visit.listTimePeriodLabel
                    ? ` ${visit.listTimePeriodLabel}`
                    : ''}
                </span>
              ) : null}
            </div>
            {!expanded ? (
              <div className="flex flex-wrap gap-2 justify-start items-center mt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4F3] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-primary">
                  <Pill className="h-3.5 w-3.5" aria-hidden />
                  {medsCount > 0
                    ? `${medsCount} ${medsCount === 1 ? 'دواء' : 'أدوية'}`
                    : 'لا أدوية بعد'}
                </span>
                <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-[#B45309]">
                  {statusLabel}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'إخفاء تفاصيل الوصفة' : 'عرض تفاصيل الوصفة'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#BFEDEC] bg-white text-primary transition hover:bg-[#F0FAF9]"
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="inline-flex"
          >
            <ChevronDown className="w-5 h-5" aria-hidden />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="prescription-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="overflow-hidden"
          >
            <motion.div
              variants={ENCOUNTERS_EXPAND_CONTENT_STAGGER}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-4 border-t border-[#E2E8F0]/80 bg-white px-4 py-5 sm:px-5"
            >
              {detailsLoading ? (
                <motion.div variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}>
                  <DoctorInlineDetailsSkeleton rows={3} />
                </motion.div>
              ) : null}

              {detailsError ? (
                <motion.div
                  variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                  className="rounded-[12px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-right font-cairo text-[13px] font-bold text-[#B42318]"
                >
                  {detailsError}
                </motion.div>
              ) : null}

              {!detailsLoading && !detailsError && previewVm ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCell
                      label="رقم الوصفة"
                      value={previewVm.prescriptionCode}
                    />
                    <InfoCell label="الحالة" value={previewVm.statusLabel} />
                    <InfoCell
                      label="الطبيب"
                      value={previewVm.doctorName}
                    />
                  </div>

                  <motion.section variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}>
                    <h4 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#667085]">
                      الأدوية الموصوفة ({medications.length})
                    </h4>
                    {medications.length === 0 ? (
                      <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] px-4 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                        لم تُضف أدوية بعد في هذه الوصفة.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {medications.map((item) => (
                          <PrescriptionMedicationCard
                            key={item.id}
                            item={item}
                            collapsible
                            readOnly
                          />
                        ))}
                      </div>
                    )}
                  </motion.section>

                  {previewVm.generalInstructions ? (
                    <motion.section
                      variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                      className="rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#F8FFFE] px-4 py-4 text-right"
                    >
                      <div className="font-cairo text-[13px] font-extrabold text-primary">
                        التعليمات العامة
                      </div>
                      <p className="mt-2 font-cairo text-[14px] font-semibold leading-[24px] text-[#344054]">
                        {previewVm.generalInstructions}
                      </p>
                    </motion.section>
                  ) : null}
                </>
              ) : null}

              <motion.div
                variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                className="grid gap-3 sm:grid-cols-2"
              >
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95"
                >
                  <Eye className="w-4 h-4" aria-hidden />
                  معاينة الوصفة
                  <ChevronLeft className="w-4 h-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onOpenEdit}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#D8F0EE]"
                >
                  <Pencil className="w-4 h-4" aria-hidden />
                  تعديل الوصفة
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
