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
  kpiGridClassName: string;
  kpis?: OverviewKpiCard[];
  cards?: ReactNode[];
}) {
  return (
    <section className={`relative ${sectionClassName}`}>
      {overlay ? overlay : null}
      <div className='relative z-10 flex justify-between'>
        <div>{headerLeft}</div>
        {headerRight ? <div>{headerRight}</div> : <div />}
      </div>

      <div className={`relative z-10 ${kpiGridClassName}`}>
        {Array.isArray(cards) && cards.length > 0
          ? cards.map((node, idx) => <Fragment key={idx}>{node}</Fragment>)
          : (kpis ?? []).map((kpi) => (
              <div
                key={kpi.key}
                className={kpi.className}
              >
                <div className={kpi.contentClassName ?? ''}>
                  <div className='flex justify-between text-[#FFFFFF]'>
                    {kpi.icon}
                    <span className={kpi.valueClassName ?? ''}>
                      {kpi.value}
                    </span>
                  </div>
                  <div className={kpi.labelClassName ?? ''}>{kpi.label}</div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
