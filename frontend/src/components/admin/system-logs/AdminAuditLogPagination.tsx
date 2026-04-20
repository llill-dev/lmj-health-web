import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AdminAuditLogPagination({
  page,
  totalPages,
  total,
  pageSize,
  isFetching,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}) {
  if (total <= pageSize) return null;

  return (
    <section className='mt-4 flex items-center justify-between px-1'>
      <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
        عرض {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} من{' '}
        {total.toLocaleString('ar-SA')} سجل
      </div>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || isFetching}
          className='flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#EEF2F6] bg-white text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronRight className='h-4 w-4' />
        </button>

        <div className='flex items-center gap-1'>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p = i + 1;
            if (totalPages > 5 && page > 3) p = page - 2 + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                type='button'
                onClick={() => onPageChange(p)}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] font-cairo text-[13px] font-extrabold transition-colors ${
                  p === page
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-[#EEF2F6] bg-white text-[#344054] hover:bg-[#F9FAFB]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type='button'
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || isFetching}
          className='flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#EEF2F6] bg-white text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
      </div>
    </section>
  );
}
