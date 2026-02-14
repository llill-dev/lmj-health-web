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
  headerLeft,
  headerRight,
  kpiGridClassName,
  kpis,
  cards,
}: {
  sectionClassName: string;
  headerLeft: ReactNode;
  headerRight?: ReactNode;
  kpiGridClassName: string;
  kpis?: OverviewKpiCard[];
  cards?: ReactNode[];
}) {
  return (
    <section className={sectionClassName}>
      <div className='flex justify-between'>
        <div>{headerLeft}</div>
        {headerRight ? <div>{headerRight}</div> : <div />}
      </div>

      <div className={kpiGridClassName}>
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
