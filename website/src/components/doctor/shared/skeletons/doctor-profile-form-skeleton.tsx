'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorProfileFormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل الملف الشخصي…">
      <div className="space-y-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-20 w-20 rounded-full" />
          <div className="space-y-2 text-right">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-4 w-52" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="space-y-2 text-right">
              <SkeletonBlock className="mr-auto h-4 w-24" />
              <SkeletonBlock className="h-12 w-full rounded-[12px]" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mr-auto h-11 w-36 rounded-[10px]" />
      </div>
    </DoctorLoadingShell>
  );
}
