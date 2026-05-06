'use client';

import { ChevronLeft } from 'lucide-react';

export default function DashboardSectionHeading({
  title,
  actionLabel,
  onActionClick,
  className = '',
}: {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className='flex items-center gap-[10px]'>
        <span className='h-9 w-[6px] rounded-full bg-[#10D3D0]' aria-hidden />
        <h2 className='font-cairo text-[24px] font-black leading-[28px] tracking-normal text-[#101828]'>
          {title}
        </h2>
      </div>
      {actionLabel ? (
        <button
          type='button'
          onClick={onActionClick}
          className='inline-flex items-center gap-1 font-cairo text-[18px] font-black text-primary transition-colors hover:text-[#0A7A77] focus:outline-none focus-visible:text-[#0A7A77]'
        >
          <span>{actionLabel}</span>
          <ChevronLeft className='h-5 w-5' strokeWidth={3} aria-hidden />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
