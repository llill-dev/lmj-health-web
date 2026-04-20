import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className='mt-6 flex items-center justify-center gap-2'>
      <button
        type='button'
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className='flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
      >
        <ChevronRight className='h-4 w-4' />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type='button'
          onClick={() => onPage(p)}
          className={
            p === page
              ? 'h-[34px] min-w-[34px] rounded-[8px] bg-primary px-3 font-cairo text-[13px] font-extrabold text-white'
              : 'h-[34px] min-w-[34px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px] font-bold text-[#667085]'
          }
        >
          {p}
        </button>
      ))}
      <button
        type='button'
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className='flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
      >
        <ChevronLeft className='h-4 w-4' />
      </button>
    </div>
  );
}
