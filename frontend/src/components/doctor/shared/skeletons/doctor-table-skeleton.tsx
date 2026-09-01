'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorTableSkeleton({
  rows = 6,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  const { t } = useI18n();
  return (
    <DoctorLoadingShell label={t('doctor.skeleton.table')}>
      <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] bg-[#F0FDFA] px-4 py-3">
          <div className="flex items-center justify-center gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-[#EEF2F6]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-4 px-4 py-4"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonBlock
                  key={colIndex}
                  className={cnCellWidth(colIndex, columns)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </DoctorLoadingShell>
  );
}

function cnCellWidth(index: number, total: number) {
  if (index === 0) return 'h-4 w-16';
  if (index === total - 1) return 'h-8 w-8 rounded-[8px]';
  return 'h-4 w-24';
}
