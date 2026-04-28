import type { ReactNode } from 'react';

export function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5 text-right sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-0'>
      <div className='shrink-0 font-cairo text-sm font-semibold leading-snug text-primary sm:text-base md:text-lg lg:text-[22px] lg:leading-[28px]'>
        {label} :
      </div>
      <div className='min-w-0 break-words font-cairo text-sm font-medium leading-relaxed text-[#1F2937] sm:text-base md:text-lg lg:text-[22px] lg:leading-[28px]'>
        {value}
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='mb-2 text-xl font-bold leading-snug text-primary sm:mb-3 sm:text-2xl md:text-[25px] md:leading-[35px]'>
      {children}
    </h2>
  );
}
