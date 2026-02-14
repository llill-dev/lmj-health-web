'use client';

import type { ReactNode } from 'react';
import { Calendar, FileText, Plus } from 'lucide-react';
import DashboardOverviewSection from '@/components/dashboard/dashboard-overview-section';
import OverviewKpiCard, {
  type OverviewKpiCardVariant,
} from '@/components/dashboard/overview-kpi-card';

type OverviewKpiItem = {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
};

export type DoctorDashboardOverviewVariant = 'appointments' | 'medical-records';

export default function DoctorDashboardOverview({
  variant,
  title,
  subtitle,
  headerIcon,
  actionLabel,
  actionIcon,
  kpis,
}: {
  variant: DoctorDashboardOverviewVariant;
  title: ReactNode;
  subtitle: ReactNode;
  headerIcon?: ReactNode;
  actionLabel?: ReactNode;
  actionIcon?: ReactNode;
  kpis: OverviewKpiItem[];
}) {
  const kpiVariant: OverviewKpiCardVariant = variant;

  return (
    <DashboardOverviewSection
      sectionClassName='flex flex-col gap-[24px] mb-6 py-[32px] px-[32px] rounded-[24px] bg-[#16C5C0] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
      headerLeft={
        <div className='flex gap-[16px]'>
          <div className='bg-[#FFFFFF33] w-[64px] h-[64px] flex items-center justify-center rounded-[16px]'>
            {headerIcon ?? (
              <>
                {' '}
                {variant === 'appointments' ? (
                  <Calendar className='text-white w-[32px] h-[32px]' />
                ) : (
                  <FileText className='text-white w-[32px] h-[32px]' />
                )}
              </>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            <h1 className='font-cairo text-[30px] font-black leading-[36px] text-[#FFFFFF]'>
              {title}
            </h1>
            <p className='font-cairo text-[16px] leading-[16px] text-[#FFFFFFE5]'>
              {subtitle}
            </p>
          </div>
        </div>
      }
      headerRight={
        actionLabel ? (
          <button className='flex items-center justify-between rounded-[16px] h-[48px] min-w-[146px] bg-[#FFFFFF] px-4 py-3 font-cairo text-[14px] font-bold text-[#16C5C0] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'>
            {actionIcon ?? (
              <>
                {variant === 'appointments' ? (
                  <Calendar className='h-4 w-4' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </>
            )}
            <span className='font-cairo leading-[20px] text-[14px] font-bold'>
              {actionLabel}
            </span>
          </button>
        ) : undefined
      }
      kpiGridClassName={`grid gap-4 ${variant === 'appointments' ? 'grid-cols-4' : 'grid-cols-3 '}`}
      cards={kpis.map((kpi) => (
        <OverviewKpiCard
          key={kpi.key}
          variant={kpiVariant}
          icon={kpi.icon}
          value={kpi.value}
          label={kpi.label}
        />
      ))}
    />
  );
}
