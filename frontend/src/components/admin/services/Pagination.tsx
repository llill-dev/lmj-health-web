import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPaginationItems(
  current: number,
  total: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', total];
  }

  if (current >= total - 3) {
    return [1, 'ellipsis-left', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [
    1,
    'ellipsis-left',
    current - 1,
    current,
    current + 1,
    'ellipsis-right',
    total,
  ];
}

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

  const items = buildPaginationItems(page, totalPages);

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
      {items.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type='button'
            onClick={() => onPage(item)}
            className={
              item === page
                ? 'h-[34px] min-w-[34px] rounded-[8px] bg-primary px-3 font-cairo text-[13px] font-extrabold text-white'
                : 'h-[34px] min-w-[34px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px] font-bold text-[#667085]'
            }
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            className='inline-flex h-[34px] min-w-[24px] items-center justify-center px-1 font-cairo text-[13px] font-bold text-[#98A2B3]'
            aria-hidden='true'
          >
            ...
          </span>
        ),
      )}
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
