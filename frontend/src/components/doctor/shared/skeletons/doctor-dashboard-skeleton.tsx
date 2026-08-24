'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorDashboardSkeleton() {
  return (
    <DoctorLoadingShell
      label="جارٍ تحميل لوحة التحكم…"
      className="space-y-7 pb-8"
    >
      <section className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="min-h-[180px] rounded-[16px] border border-[#E7EDF5] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="space-y-4 text-start">
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-8 w-16" />
              </div>
              <SkeletonBlock className="h-14 w-14 rounded-[6px]" />
            </div>
            <SkeletonBlock className="mt-8 h-8 w-24 rounded-[10px]" />
          </article>
        ))}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24 rounded-[14px]" />
        ))}
      </div>

      <section className="grid items-start gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="border-b border-[#EDF2F7] px-8 py-9">
              <SkeletonBlock className="mr-auto h-7 w-40" />
            </div>
            <div className="space-y-4 px-5 py-6">
              {Array.from({ length: 2 }).map((__, row) => (
                <SkeletonBlock key={row} className="h-20 w-full rounded-[16px]" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </DoctorLoadingShell>
  );
}
