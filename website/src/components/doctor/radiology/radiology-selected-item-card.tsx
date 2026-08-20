import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ENCOUNTERS_EXPAND_TRANSITION } from '@/components/doctor/encounters/encounters-motion';
import { cn } from '@/lib/utils/utils';
import { formatRadiologyItemBrief } from './map-radiology-ui';
import type { RadiologyOrderItemUi } from './radiology-types';

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value || value === '—' || value === 'غير محدد') return null;
  return (
    <p className="font-cairo text-[13px] leading-[22px] text-[#344054]">
      <span className="font-bold text-[#667085]">{label}: </span>
      <span className="font-extrabold text-[#101828]">{value}</span>
    </p>
  );
}

export function RadiologySelectedItemCard({
  item,
  onEdit,
  onDelete,
  readOnly,
}: {
  item: RadiologyOrderItemUi;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const brief = formatRadiologyItemBrief(item);

  return (
    <article className="rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4 shadow-[0_4px_14px_rgba(15,143,139,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-right">
          <h3 className="font-cairo text-[15px] font-extrabold text-[#101828]">
            {item.name}
          </h3>
          {!expanded ? (
            <p className="mt-1 font-cairo text-[12px] font-semibold text-primary/80">
              {brief || 'اضغط السهم لعرض التفاصيل'}
            </p>
          ) : item.category !== '—' &&
            item.category !== 'كتالوج' &&
            item.category !== 'يدوي' ? (
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
              {item.category}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!readOnly && onEdit && onDelete ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#BFEDEC] text-primary hover:bg-[#F0FAF9]"
                aria-label="تعديل"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-[#E11D48]"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                حذف
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setExpanded((c) => !c)}
            aria-expanded={expanded}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#BFEDEC] bg-white text-primary"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={ENCOUNTERS_EXPAND_TRANSITION}
              className="inline-flex"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className={cn('overflow-hidden', 'mt-2 space-y-0.5')}
          >
            <MetaRow label="النوع" value={item.type} />
            <MetaRow label="منطقة الجسم" value={item.bodyArea} />
            <MetaRow label="الجهة" value={item.side} />
            <MetaRow label="الوضعية" value={item.position} />
            <MetaRow label="ملاحظات" value={item.notes} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
