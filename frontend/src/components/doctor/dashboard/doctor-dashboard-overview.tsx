'use client';

import type { ReactNode } from 'react';
import { Calendar, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardOverviewSection from '@/components/doctor/dashboard/dashboard-overview-section';
import OverviewKpiCard, {
  type OverviewKpiCardVariant,
} from '@/components/doctor/dashboard/overview-kpi-card';

type OverviewKpiItem = {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
};

export type DoctorDashboardOverviewVariant = 'appointments' | 'medical-records';

export type DoctorDashboardSurface = 'teal' | 'mint';

export default function DoctorDashboardOverview({
  variant,
  title,
  subtitle,
  headerIcon,
  actionLabel,
  actionIcon,
  mode,
  onActionClick,
  overlay,
  kpis,
  surface = 'teal',
}: {
  variant: DoctorDashboardOverviewVariant;
  title: ReactNode;
  subtitle: ReactNode;
  mode?: 'list' | 'create';
  headerIcon?: ReactNode;
  actionLabel?: ReactNode;
  actionIcon?: ReactNode;
  onActionClick?: () => void;
  /** يُدمَج فوق الطبقات الافتراضية عند الحاجة */
  overlay?: ReactNode;
  kpis: OverviewKpiItem[];
  /** `mint`: خلفية فاتحة + صورة للصفحات مثل المواعيد */
  surface?: DoctorDashboardSurface;
}) {
  const kpiVariant: OverviewKpiCardVariant = variant;
  const kpiTone = surface === 'mint' ? 'onLight' : 'onDark';

  const mintStack =
    surface === 'mint' ? (
      <>
        <div
          className='pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]'
          aria-hidden
        />
        <div
          className='pointer-events-none absolute inset-0 rounded-[6px] bg-[url("/images/bg-status-from-appotiment.png")] bg-cover bg-center bg-no-repeat'
          aria-hidden
        />
      </>
    ) : null;

  const sectionClassName =
    surface === 'mint'
      ? 'relative flex flex-col gap-[24px] mb-6 overflow-hidden py-[32px] px-[32px] rounded-[6px] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
      : 'relative flex flex-col gap-[24px] mb-6 py-[32px] px-[32px] rounded-[6px] bg-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]';

  const iconTileClass =
    surface === 'mint'
      ? 'flex h-[64px] w-[64px] items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)]'
      : 'flex h-[64px] w-[64px] items-center justify-center rounded-[6px] bg-[#FFFFFF33]';

  const titleClass =
    surface === 'mint'
      ? 'font-cairo text-[30px] font-black leading-[36px] text-primary'
      : 'font-cairo text-[30px] font-black leading-[36px] text-[#FFFFFF]';

  const subtitleClass =
    surface === 'mint'
      ? 'font-cairo text-[16px] leading-[24px] text-primary/85'
      : 'font-cairo text-[16px] leading-[16px] text-[#FFFFFFE5]';

  return (
    <DashboardOverviewSection
      sectionClassName={sectionClassName}
      overlay={
        <>
          {mintStack}
          {overlay}
        </>
      }
      headerLeft={
        <div className='flex gap-[16px]'>
          <div className={iconTileClass}>
            {headerIcon ?? (
              <>
                {' '}
                {variant === 'appointments' ? (
                  <Calendar className='h-8 w-8 text-white' />
                ) : (
                  <FileText className='h-8 w-8 text-white' />
                )}
              </>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            <h1 className={titleClass}>{title}</h1>
            <p className={subtitleClass}>{subtitle}</p>
          </div>
        </div>
      }
      headerRight={
        actionLabel && mode !== 'create' ? (
          <motion.button
            type='button'
            onClick={onActionClick}
            className={
              surface === 'mint'
                ? 'flex h-[48px] min-w-[146px] items-center justify-between rounded-[6px] border-[1.5px] border-primary bg-white px-4 py-3 font-cairo text-[14px] font-bold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)]'
                : 'flex h-[48px] min-w-[146px] items-center justify-between rounded-[6px] bg-[#FFFFFF] px-4 py-3 font-cairo text-[14px] font-bold text-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
            }
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {actionIcon ?? (
              <>
                {variant === 'appointments' ? (
                  <Calendar className='h-4 w-4' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </>
            )}
            <span className='font-cairo text-[14px] font-bold leading-[20px]'>
              {actionLabel}
            </span>
          </motion.button>
        ) : undefined
      }
      kpiGridClassName={`grid gap-4 ${variant === 'appointments' ? 'grid-cols-4' : 'grid-cols-3 '}`}
      cards={kpis.map((kpi) => (
        <OverviewKpiCard
          key={kpi.key}
          variant={kpiVariant}
          tone={kpiTone}
          icon={kpi.icon}
          value={kpi.value}
          label={kpi.label}
        />
      ))}
    />
  );
}
