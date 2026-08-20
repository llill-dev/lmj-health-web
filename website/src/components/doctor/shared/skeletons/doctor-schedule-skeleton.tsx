'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorScheduleSkeleton({ days = 4 }: { days?: number }) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل جدول العمل…">
      <div className="space-y-3 p-6">
        {Array.from({ length: days }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-[10px]" />
              <div className="space-y-2 text-right">
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            </div>
            <div className="flex gap-2">
              <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
              <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </DoctorLoadingShell>
  );
}
