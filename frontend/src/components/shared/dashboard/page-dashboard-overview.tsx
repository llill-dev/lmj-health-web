'use client';

import type { ReactNode } from 'react';
import { Calendar, ClipboardList, FileText, MessageCircle, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardOverviewSection from '@/components/shared/dashboard/dashboard-overview-section';
import OverviewKpiCard, {
  type OverviewKpiCardVariant,
} from '@/components/shared/dashboard/overview-kpi-card';

type OverviewKpiItem = {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
};

export type PageDashboardOverviewVariant = OverviewKpiCardVariant;

export type PageDashboardSurface = 'teal' | 'mint';

export type PageDashboardKpiColumns = 2 | 3 | 4 | 5;

function resolveKpiGridClass(
  variant: PageDashboardOverviewVariant,
  kpiCount: number,
  kpiColumns?: PageDashboardKpiColumns,
): string {
  if (kpiColumns === 5) return 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5';
  if (kpiColumns === 4) return 'grid grid-cols-2 gap-4 sm:grid-cols-4';
  if (kpiColumns === 3) return 'grid grid-cols-1 gap-4 sm:grid-cols-3';
  if (kpiColumns === 2) return 'grid grid-cols-2 gap-4';

  if (kpiCount >= 5) return 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5';
  if (variant === 'appointments' || kpiCount === 4) {
    return 'grid grid-cols-2 gap-4 sm:grid-cols-4';
  }
  return 'grid grid-cols-1 gap-4 sm:grid-cols-3';
}

export default function PageDashboardOverview({
  variant = 'admin',
  title,
  subtitle,
  headerIcon,
  actionLabel,
  actionIcon,
  mode,
  onActionClick,
  actionDisabled,
  overlay,
  kpis = [],
  kpiColumns,
  surface = 'mint',
}: {
  variant?: PageDashboardOverviewVariant;
  title: ReactNode;
  subtitle?: ReactNode;
  mode?: 'list' | 'create';
  headerIcon?: ReactNode;
  actionLabel?: ReactNode;
  actionIcon?: ReactNode;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  overlay?: ReactNode;
  kpis?: OverviewKpiItem[];
  kpiColumns?: PageDashboardKpiColumns;
  surface?: PageDashboardSurface;
}) {
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

  const defaultHeaderIcon =
    variant === 'appointments' ? (
      <Calendar className='h-8 w-8 text-white' />
    ) : variant === 'patients' ? (
      <Users className='h-8 w-8 text-white' />
    ) : variant === 'encounters' ? (
      <ClipboardList className='h-8 w-8 text-white' />
    ) : variant === 'consultations' ? (
      <MessageCircle className='h-8 w-8 text-white' />
    ) : (
      <FileText className='h-8 w-8 text-white' />
    );

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
          <div className={iconTileClass}>{headerIcon ?? defaultHeaderIcon}</div>
          <div className='flex min-w-0 flex-col gap-1 text-right'>
            <h1 className={titleClass}>{title}</h1>
            {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
          </div>
        </div>
      }
      headerRight={
        actionLabel && mode !== 'create' ? (
          <motion.button
            type='button'
            disabled={actionDisabled}
            onClick={onActionClick}
            className={
              surface === 'mint'
                ? 'flex h-[48px] min-w-[146px] items-center justify-between gap-2 rounded-[6px] border-[1.5px] border-primary bg-white px-4 py-3 font-cairo text-[14px] font-bold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] disabled:cursor-not-allowed disabled:opacity-60'
                : 'flex h-[48px] min-w-[146px] items-center justify-between gap-2 rounded-[6px] bg-[#FFFFFF] px-4 py-3 font-cairo text-[14px] font-bold text-primary shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:opacity-60'
            }
            whileHover={actionDisabled ? undefined : { y: -1 }}
            whileTap={actionDisabled ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {actionIcon ??
              (variant === 'appointments' ? (
                <Calendar className='h-4 w-4' />
              ) : (
                <Plus className='h-4 w-4' />
              ))}
            <span className='font-cairo text-[14px] font-bold leading-[20px]'>
              {actionLabel}
            </span>
          </motion.button>
        ) : undefined
      }
      kpiGridClassName={resolveKpiGridClass(variant, kpis.length, kpiColumns)}
      cards={kpis.map((kpi) => (
        <OverviewKpiCard
          key={kpi.key}
          variant={variant}
          tone={kpiTone}
          icon={kpi.icon}
          value={kpi.value}
          label={kpi.label}
        />
      ))}
    />
  );
}
