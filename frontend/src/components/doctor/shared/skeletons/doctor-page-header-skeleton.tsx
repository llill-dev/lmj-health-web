'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorPageHeaderSkeleton({
  withAction = true,
}: {
  withAction?: boolean;
}) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل عنوان الصفحة…">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 text-right">
          <SkeletonBlock className="h-8 w-48 sm:w-56" />
          <SkeletonBlock className="h-4 w-64 max-w-full" />
        </div>
        {withAction ? <SkeletonBlock className="h-11 w-36 rounded-[10px]" /> : null}
      </div>
    </DoctorLoadingShell>
  );
}
