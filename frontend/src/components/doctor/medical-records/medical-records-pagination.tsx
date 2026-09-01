import { ChevronLeft, ChevronRight } from 'lucide-react';
import StyledSelect from '@/components/ui/styled-select';
import { useI18n } from '@/i18n/provider';

export function MedicalRecordsPagination({
  page,
  totalPages,
  showingFrom,
  showingTo,
  total,
  pageSize,
  disabled,
  onPageChange,
  onPageSizeChange,
  itemLabel,
}: {
  page: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  total: number;
  pageSize: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel?: string;
}) {
  const { t } = useI18n();
  const resolvedItemLabel =
    itemLabel ?? t('doctor.medicalRecords.pagination.itemLabel');
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <section className="flex flex-col gap-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div className="font-cairo text-[12px] font-bold text-[#667085]">
        {t('doctor.medicalRecords.pagination.showingRange')
          .replace('{from}', String(showingFrom))
          .replace('{to}', String(showingTo))
          .replace('{total}', String(total))
          .replace('{item}', resolvedItemLabel)}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        <div className="font-cairo text-[12px] font-bold text-[#667085]">
          {t('common.pagination.summary')
            .replace('{page}', String(page))
            .replace('{total}', String(safeTotalPages))}
        </div>

        <div className="w-[118px] shrink-0">
          <StyledSelect
            size="xs"
            tone="emphasis"
            disabled={disabled}
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={[8, 12, 20, 50].map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            listboxAriaLabel={t('doctor.medicalRecords.pagination.itemsPerPageAria')}
          />
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={disabled || page <= 1}
          className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={t('common.pagination.previous')}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          disabled={disabled || page >= safeTotalPages}
          className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={t('common.pagination.next')}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
