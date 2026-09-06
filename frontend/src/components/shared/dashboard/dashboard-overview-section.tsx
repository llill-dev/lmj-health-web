'use client';

import { Fragment, type ReactNode } from 'react';

export type OverviewKpiCard = {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  className: string;
  contentClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
};

export default function DashboardOverviewSection({
  sectionClassName,
  overlay,
  headerLeft,
  headerRight,
  kpiGridClassName,
  kpis,
  cards,
}: {
  sectionClassName: string;
  overlay?: ReactNode;
  headerLeft: ReactNode;
  headerRight?: ReactNode;
  kpiGridClassName?: string;
  kpis?: OverviewKpiCard[];
  cards?: ReactNode[];
}) {
  const hasKpis =
    (Array.isArray(cards) && cards.length > 0) ||
    (Array.isArray(kpis) && kpis.length > 0);

  return (
    <section className={`relative ${sectionClassName}`}>
      {overlay ? <div className='relative z-20'>{overlay}</div> : null}
      <div className='relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>{headerLeft}</div>
        {headerRight ? <div className='shrink-0'>{headerRight}</div> : null}
      </div>

      {hasKpis && kpiGridClassName ? (
        <div className={`relative z-10 mt-6 ${kpiGridClassName}`}>
          {Array.isArray(cards) && cards.length > 0
            ? cards.map((node, idx) => <Fragment key={idx}>{node}</Fragment>)
            : (kpis ?? []).map((kpi) => (
                <div key={kpi.key} className={kpi.className}>
                  <div className={kpi.contentClassName ?? ''}>
                    <div className='flex justify-between text-[#FFFFFF]'>
                      {kpi.icon}
                      <span className={kpi.valueClassName ?? ''}>{kpi.value}</span>
                    </div>
                    <div className={kpi.labelClassName ?? ''}>{kpi.label}</div>
                  </div>
                </div>
              ))}
        </div>
      ) : null}
    </section>
  );
}
