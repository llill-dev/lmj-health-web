'use client';

import { DoctorPageHeaderSkeleton } from './doctor-page-header-skeleton';
import { DoctorPaginationSkeleton } from './doctor-pagination-skeleton';
import { DoctorTableSkeleton } from './doctor-table-skeleton';
import { DoctorToolbarSkeleton } from './doctor-toolbar-skeleton';
import { DoctorStatCardsSkeleton } from './doctor-stat-cards-skeleton';
import { DoctorLoadingShell } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorListPageSkeleton({
  withStats = false,
  withTabs = true,
  tableRows = 6,
  tableColumns = 6,
}: {
  withStats?: boolean;
  withTabs?: boolean;
  tableRows?: number;
  tableColumns?: number;
}) {
  const { t } = useI18n();
  return (
    <DoctorLoadingShell label={t('doctor.skeleton.listPage')}>
      <div className="w-full space-y-6 pb-10">
        <DoctorPageHeaderSkeleton />
        {withStats ? <DoctorStatCardsSkeleton /> : null}
        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
          <DoctorToolbarSkeleton tabs={withTabs ? 4 : 0} />
          <div className="mt-6">
            <DoctorTableSkeleton rows={tableRows} columns={tableColumns} />
          </div>
        </section>
        <DoctorPaginationSkeleton />
      </div>
    </DoctorLoadingShell>
  );
}
