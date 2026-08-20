'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatBillingNumber } from '@/lib/doctor/billing/format';

export function MedicalServicesDirectoryPagination({
  page,
  totalPages,
  total,
  pageSize,
  disabled,
  onPageChange,
  itemLabel = 'منشأة',
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(total, page * pageSize);

  return (
    <section className="mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-cairo text-[12px] font-semibold text-[#667085] tabular-nums">
          عرض {formatBillingNumber(showingFrom, { maximumFractionDigits: 0 })}-
          {formatBillingNumber(showingTo, { maximumFractionDigits: 0 })} من أصل{' '}
          {formatBillingNumber(total, { maximumFractionDigits: 0 })} {itemLabel}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={disabled || page <= 1}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40"
            aria-label="السابق"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2">
            <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
              صفحة
            </span>
            <span className="font-cairo text-[12px] font-extrabold text-[#111827] tabular-nums">
              {formatBillingNumber(page, { maximumFractionDigits: 0 })} من{' '}
              {formatBillingNumber(safeTotalPages, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
            disabled={disabled || page >= safeTotalPages}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40"
            aria-label="التالي"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
            عدد النتائج:
          </span>
          <div className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#111827] tabular-nums">
            {formatBillingNumber(total, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </section>
  );
}
