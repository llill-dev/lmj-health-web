'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { DoctorExpandableCardSkeleton } from './doctor-expandable-card-skeleton';

export function DoctorSummaryPageSkeleton() {
  return (
    <DoctorLoadingShell label="جارٍ تحميل ملخص الزيارة…">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 text-start">
            <SkeletonBlock className="h-8 w-52" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-28 rounded-[10px]" />
            <SkeletonBlock className="h-10 w-32 rounded-[10px]" />
          </div>
        </div>
        <DoctorExpandableCardSkeleton count={4} expanded />
      </div>
    </DoctorLoadingShell>
  );
}
