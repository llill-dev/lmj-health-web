'use client';

import type { ReactNode } from 'react';

export type OverviewKpiCardVariant = 'appointments' | 'medical-records';

export default function OverviewKpiCard({
  variant,
  icon,
  value,
  label,
}: {
  variant: OverviewKpiCardVariant;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
}) {



  return (
    <div className=' px-[18px] py-[18px] border-[1.82px] border-[#FFFFFF4D] text-[#FFFFFF33] rounded-[6px]'>
      <div className='flex justify-between text-[#FFFFFF]'>
        {icon}
        <span className='font-black text-[24px] leading-[34px]'>{value}</span>
      </div>
      <p className='text-[14px] leading-[20px] text-[#FFFFFFE5]'>{label}</p>
    </div>
  );
}
