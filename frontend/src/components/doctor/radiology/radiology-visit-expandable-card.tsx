import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  ScanLine,
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
import { RadiologySelectedItemCard } from './radiology-selected-item-card';
import type { RadiologyOrderItemUi } from './radiology-types';

type Props = {
  visit: MedicalVisitCardData;
  expanded: boolean;
  onToggle: () => void;
  detailsLoading?: boolean;
  detailsError?: string | null;
  items: RadiologyOrderItemUi[];
  statusLabel: string;
  orderCode?: string;
  onViewDetails: () => void;
  onOpenPreview: () => void;
};

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">{label}</div>
      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
        {value}
      </div>
    </div>
  );
}

export function RadiologyVisitExpandableCard({
  visit,
  expanded,
  onToggle,
  detailsLoading,
  detailsError,
  items,
  statusLabel,
  orderCode,
  onViewDetails,
  onOpenPreview,
}: Props) {
  const count = items.length;

  return (
    <motion.article
      layout
      transition={ENCOUNTERS_EXPAND_TRANSITION}
      className={cn(
        'overflow-hidden rounded-[16px] border bg-white transition-shadow',
        expanded
          ? 'border-primary/25 shadow-[0_20px_48px_-16px_rgba(15,143,139,0.22)]'
          : 'border-[#E2E8F0] shadow-[0_12px_32px_-14px_rgba(15,23,42,0.12)]',
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 px-4 py-4 sm:px-5',
          expanded ? 'bg-[#F8FFFE]' : 'border-b border-[#F2F4F7]',
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-[#14b8a6] text-white">
            <UserRound className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <div className="truncate font-cairo text-[15px] font-black text-[#101828]">
              {visit.patientName}
            </div>
            <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
              {visit.visitTypeLabel}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-3 text-primary">
              <span className="inline-flex items-center gap-1 font-cairo text-[12px] font-bold">
                <Calendar className="h-3 w-3" aria-hidden />
                {visit.listDateLabel}
              </span>
              {visit.listTimeLabel !== '—' ? (
                <span className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold">
                  <Clock className="h-3 w-3" aria-hidden />
                  {visit.listTimeLabel}
                </span>
              ) : null}
            </div>
            {!expanded ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4F3] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-primary">
                  <ScanLine className="h-3.5 w-3.5" aria-hidden />
                  {count > 0 ? `${count} فحص` : 'لا فحوصات بعد'}
                </span>
                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-[#B45309]">
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#BFEDEC] bg-white text-primary"
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="inline-flex"
          >
            <ChevronDown className="h-5 w-5" aria-hidden />
          </motion.span>
        </button>
      </div>

      <div className="border-t border-[#F2F4F7] px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]"
        >
          عرض التفاصيل
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="radiology-expanded"
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
              className="space-y-4 border-t border-[#E2E8F0]/80 px-4 py-5 sm:px-5"
            >
              {detailsLoading ? (
                <motion.div variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}>
                  <DoctorInlineDetailsSkeleton rows={3} />
                </motion.div>
              ) : null}
              {detailsError ? (
                <motion.p
                  variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                  className="font-cairo text-[13px] font-bold text-[#B42318]"
                >
                  {detailsError}
                </motion.p>
              ) : null}

              {!detailsLoading && !detailsError ? (
                <>
                  {orderCode ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoCell label="رقم الطلب" value={orderCode} />
                      <InfoCell label="الحالة" value={statusLabel} />
                    </div>
                  ) : null}

                  <motion.section variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}>
                    <h4 className="mb-3 font-cairo text-[14px] font-extrabold text-[#667085]">
                      الأشعة المختارة ({count})
                    </h4>
                    {count === 0 ? (
                      <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                        لا توجد فحوصات في هذا الطلب بعد.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <RadiologySelectedItemCard
                            key={item.id}
                            item={item}
                            readOnly
                          />
                        ))}
                      </div>
                    )}
                  </motion.section>
                </>
              ) : null}

              <motion.div
                variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                className="grid gap-3 sm:grid-cols-2"
              >
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[13px] font-extrabold text-primary"
                >
                  معاينة الطلب
                </button>
                <button
                  type="button"
                  onClick={onViewDetails}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[13px] font-extrabold text-white"
                >
                  تعديل الطلب
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
