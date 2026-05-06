'use client';

import type { ReactNode } from 'react';

export type OverviewKpiCardVariant = 'appointments' | 'medical-records';

export default function OverviewKpiCard({
  variant: _variant,
  icon,
  value,
  label,
  tone = 'onDark',
}: {
  variant: OverviewKpiCardVariant;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  /** على خلفية البطاقة الداكنة (الافتراضي) أو على خلفية فاتحة (Mint) */
  tone?: 'onDark' | 'onLight';
}) {
  const onLight = tone === 'onLight';

  return (
    <div
      className={
        onLight
          ? 'rounded-[6px] border-[1.82px] border-[#9EE8E0] bg-white/80 px-[18px] py-[18px] shadow-[0px_4px_12px_-2px_rgba(15,143,139,0.12)] backdrop-blur-[2px]'
          : 'rounded-[6px] border-[1.82px] border-[#FFFFFF4D] px-[18px] py-[18px] text-[#FFFFFF33]'
      }
    >
      <div
        className={
          onLight
            ? 'flex justify-between text-primary'
            : 'flex justify-between text-[#FFFFFF]'
        }
      >
        {icon}
        <span className='font-black text-[24px] leading-[34px]'>{value}</span>
      </div>
      <p
        className={
          onLight
            ? 'mt-1 text-[14px] font-semibold leading-[20px] text-[#4A5565]'
            : 'text-[14px] leading-[20px] text-[#FFFFFFE5]'
        }
      >
        {label}
      </p>
    </div>
  );
}
