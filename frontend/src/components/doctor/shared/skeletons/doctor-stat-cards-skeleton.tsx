'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorStatCardsSkeleton({
  count = 4,
  columns = 4,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-4';

  const { t } = useI18n();

  return (
    <DoctorLoadingShell label={t('doctor.skeleton.statCards')}>
      <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
          >
            <div className="space-y-2 text-start">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-7 w-10" />
            </div>
            <SkeletonBlock className="h-9 w-9 rounded-[10px]" />
          </div>
        ))}
      </div>
    </DoctorLoadingShell>
  );
}
