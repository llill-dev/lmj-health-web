'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorWorkspaceFormSkeleton({
  medicationCards = 2,
}: {
  medicationCards?: number;
}) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل مساحة العمل…">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 text-start">
            <SkeletonBlock className="h-7 w-44" />
            <SkeletonBlock className="h-4 w-56" />
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-[10px]" />
        </div>
        <SkeletonBlock className="h-12 w-full rounded-[12px]" />
        {Array.from({ length: medicationCards }).map((_, index) => (
          <div
            key={index}
            className="rounded-[14px] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-8 w-8 rounded-[8px]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SkeletonBlock className="h-10 w-full rounded-[10px]" />
              <SkeletonBlock className="h-10 w-full rounded-[10px]" />
              <SkeletonBlock className="h-10 w-full rounded-[10px]" />
              <SkeletonBlock className="h-10 w-full rounded-[10px]" />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <SkeletonBlock className="h-11 w-36 rounded-[10px]" />
          <SkeletonBlock className="h-11 w-40 rounded-[10px]" />
        </div>
      </div>
    </DoctorLoadingShell>
  );
}
