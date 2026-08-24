'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorDocumentPreviewSkeleton() {
  return (
    <DoctorLoadingShell label="جارٍ تحميل المعاينة…">
      <div className="space-y-4">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#EEF2F6] pb-5">
            <div className="space-y-2 text-start">
              <SkeletonBlock className="h-7 w-48" />
              <SkeletonBlock className="h-4 w-56" />
            </div>
            <SkeletonBlock className="h-7 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] p-4"
              >
                <SkeletonBlock className="mb-3 h-4 w-32" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-[90%]" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <SkeletonBlock className="h-11 w-32 rounded-[10px]" />
          <SkeletonBlock className="h-11 w-36 rounded-[10px]" />
          <SkeletonBlock className="h-11 w-28 rounded-[10px]" />
        </div>
      </div>
    </DoctorLoadingShell>
  );
}
