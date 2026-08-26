import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

type DoctorTablePaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  disabled?: boolean;
  summaryLabel?: string;
  className?: string;
  controlsFirst?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

/**
 * Table pagination — same pattern as patient and appointment pages (outside table, site identity).
 */
export default function DoctorTablePagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = [8, 12, 20, 50],
  disabled = false,
  summaryLabel,
  className,
  controlsFirst = false,
  onPageChange,
  onPageSizeChange,
}: DoctorTablePaginationProps) {
  const { t } = useI18n();
  const safeTotalPages = Math.max(1, totalPages);

  const summary = (
    <div className="font-cairo text-[12px] font-bold text-[#667085]">
      {summaryLabel ??
        t("common.pagination.summary", `Page ${page} of ${safeTotalPages}`)}
    </div>
  );

  const controls = (
    <div className="flex items-center gap-3">
      <div className="w-[118px] shrink-0">
        <StyledSelect
          size="xs"
          tone="emphasis"
          disabled={disabled}
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          listboxAriaLabel={t("common.pagination.itemsPerPage")}
        />
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={disabled || page <= 1}
        className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("common.pagination.previous")}
      </button>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
        disabled={disabled || page >= safeTotalPages}
        className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("common.pagination.next")}
      </button>
    </div>
  );

  return (
    <section
      className={cn(
        "flex w-full items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {controlsFirst ? (
        <>
          {controls}
          {summary}
        </>
      ) : (
        <>
          {summary}
          {controls}
        </>
      )}
    </section>
  );
}
