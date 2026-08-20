'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorToolbarSkeleton({
  tabs = 4,
  withSearch = true,
}: {
  tabs?: number;
  withSearch?: boolean;
}) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل شريط الأدوات…">
      <div className="space-y-4">
        {withSearch ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SkeletonBlock className="h-11 w-full max-w-md rounded-[12px]" />
            <SkeletonBlock className="h-11 w-28 rounded-[10px]" />
          </div>
        ) : null}
        {tabs > 0 ? (
          <div className="flex flex-wrap justify-end gap-2">
            {Array.from({ length: tabs }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-10 w-24 rounded-[10px]"
              />
            ))}
          </div>
        ) : null}
      </div>
    </DoctorLoadingShell>
  );
}
