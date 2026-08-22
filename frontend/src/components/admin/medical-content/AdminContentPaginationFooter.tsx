import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export function AdminContentPaginationFooter({
  paginationRange,
  serverTotal,
  hasQueryFilter,
  currentPage,
  totalPages,
  visiblePageNumbers,
  onPage,
  tr,
  numberLocale,
}: {
  paginationRange: { start: number; end: number };
  serverTotal: number;
  hasQueryFilter: boolean;
  currentPage: number;
  totalPages: number;
  visiblePageNumbers: number[];
  onPage: (updater: number | ((prev: number) => number)) => void;
  tr: (ar: string, en: string) => string;
  numberLocale: string;
}) {
  return (
    <div className="border-t border-[#EEF2F6] bg-gradient-to-b from-[#FAFBFC] to-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
          <span className="text-[#101828]">
            {tr("عرض", "Showing")}{" "}
            <span className="font-extrabold tabular-nums">
              {paginationRange.start.toLocaleString(numberLocale)}–
              {paginationRange.end.toLocaleString(numberLocale)}
            </span>
          </span>
          <span> {tr("من", "of")} </span>
          <span className="font-extrabold text-[#101828] tabular-nums">
            {serverTotal.toLocaleString(numberLocale)}
          </span>
          <span>{tr(" سجلاً", " records")}</span>
          {hasQueryFilter ? (
            <span className="mt-1 block text-[11px] font-bold text-primary/80">
              {tr(
                "التصفية النصية تطبّق على الصفحة الحالية فقط",
                "Text filter applies to current page only",
              )}
            </span>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div
            className="flex flex-wrap gap-1 justify-center items-center min-w-0 sm:justify-end"
            role="navigation"
            aria-label={tr("تصفح الصفحات", "Browse pages")}
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPage(1)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
              aria-label={tr("الصفحة الأولى", "First page")}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
              aria-label={tr("الصفحة السابقة", "Previous page")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="mx-0.5 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visiblePageNumbers[0] > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => onPage(1)}
                    className="min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]"
                  >
                    1
                  </button>
                  {visiblePageNumbers[0] > 2 ? (
                    <span
                      className="px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : null}
                </>
              ) : null}

              {visiblePageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onPage(n)}
                  className={cn(
                    "min-w-[2.25rem] rounded-[10px] border px-2.5 py-1.5 font-cairo text-[12px] font-extrabold transition",
                    n === currentPage
                      ? "border-primary bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.25)]"
                      : "border-[#E5E7EB] bg-white text-[#344054] hover:border-primary/30 hover:bg-[#F0FDFA]",
                  )}
                  aria-label={tr(`الصفحة ${n}`, `Page ${n}`)}
                  aria-current={n === currentPage ? "page" : undefined}
                >
                  {n.toLocaleString(numberLocale)}
                </button>
              ))}

              {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages ? (
                <>
                  {visiblePageNumbers[visiblePageNumbers.length - 1] <
                  totalPages - 1 ? (
                    <span
                      className="px-0.5 font-cairo text-[12px] font-bold text-[#98A2B3]"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onPage(totalPages)}
                    className="min-w-[2.25rem] rounded-[10px] border border-[#E5E7EB] bg-white px-2 py-1.5 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary/30 hover:bg-[#F0FDFA]"
                    aria-label={tr("الصفحة الأخيرة", "Last page")}
                  >
                    {totalPages.toLocaleString(numberLocale)}
                  </button>
                </>
              ) : null}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
              aria-label={tr("الصفحة التالية", "Next page")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPage(totalPages)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-primary/30 hover:bg-[#F0FDFA] disabled:pointer-events-none disabled:opacity-35"
              aria-label={tr("الصفحة الأخيرة", "Last page")}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
            {tr("كامل النتائج في صفحة واحدة", "All results fit on one page")}
          </div>
        )}
      </div>
    </div>
  );
}
