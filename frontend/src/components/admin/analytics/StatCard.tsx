import type { ElementType } from 'react';

type StatCardProps = {
  title: string;
  value: number | string;
  icon: ElementType;
  border: string;
  bg: string;
  iconColor: string;
  sub?: string;
  subColor?: string;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  border,
  bg,
  iconColor,
  sub,
  subColor = 'text-[#667085]',
  loading,
}: StatCardProps) {
  return (
    <div
      className={`h-[147px] rounded-[12px] border px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${border} ${bg}`}
    >
      <div className='flex items-start justify-between'>
        <div className='text-right'>
          <div className='font-cairo text-[12px] font-extrabold text-[#667085]'>
            {title}
          </div>
          {loading ? (
            <div className='mt-2 h-7 w-20 animate-pulse rounded bg-[#EEF2F6]' />
          ) : (
            <div className='mt-2 font-cairo text-[26px] font-black leading-[30px] text-[#111827]'>
              {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
            </div>
          )}
          {sub && (
            <div className={`mt-2 font-cairo text-[11px] font-extrabold ${subColor}`}>
              {sub}
            </div>
          )}
        </div>
        <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-white shadow-sm'>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
