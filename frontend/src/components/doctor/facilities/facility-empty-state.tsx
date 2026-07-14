'use client';

import { Building2, ClipboardList, Link2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function FacilityEmptyState({
  onAdd,
  onLink,
  onSuggest,
}: {
  onAdd: () => void;
  onLink?: () => void;
  onSuggest?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[16px] border border-dashed border-[#D1FAE5] bg-white px-6 py-16 text-center shadow-sm"
    >
      <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#F0FDFA]" />
        <ClipboardList className="relative h-12 w-12 text-primary/70" aria-hidden />
        <Search
          className="absolute -bottom-1 -left-1 h-8 w-8 rounded-full border border-[#EEF2F6] bg-white p-1.5 text-[#98A2B3]"
          aria-hidden
        />
      </div>
      <p className="font-cairo text-[16px] font-extrabold text-[#667085]">
        لا يوجد منشأة حالياً
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {onLink ? (
          <button
            type="button"
            onClick={onLink}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] border border-primary/25 bg-[#E6F4F3] px-6 font-cairo text-[14px] font-extrabold text-primary"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            ربط منشأة موجودة
          </button>
        ) : null}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)]"
        >
          <Building2 className="h-4 w-4" aria-hidden />
          إضافة منشأة
        </button>
        {onSuggest ? (
          <button
            type="button"
            onClick={onSuggest}
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-6 font-cairo text-[14px] font-extrabold text-[#344054]"
          >
            اقتراح منشأة
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
