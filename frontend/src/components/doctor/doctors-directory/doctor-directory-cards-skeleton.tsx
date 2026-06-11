'use client';

import {
  DoctorLoadingShell,
  DoctorPaginationSkeleton,
  SkeletonBlock,
} from '@/components/doctor/shared/skeletons';

function DoctorDirectoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white px-6 pb-5 pt-6 text-center shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
      <SkeletonBlock className="mx-auto h-[78px] w-[78px] rounded-full" />
      <SkeletonBlock className="mx-auto mt-4 h-[16px] w-[140px]" />
      <SkeletonBlock className="mx-auto mt-2 h-[14px] w-[100px]" />
      <div className="mt-2 flex items-center justify-center gap-2">
        <SkeletonBlock className="h-[14px] w-[48px]" />
        <SkeletonBlock className="h-[14px] w-[64px]" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <SkeletonBlock className="h-[22px] w-[72px] rounded-full" />
        <SkeletonBlock className="h-[22px] w-[72px] rounded-full" />
      </div>
      <SkeletonBlock className="mx-auto mt-4 h-[18px] w-[56px]" />
      <SkeletonBlock className="mx-auto mt-2 h-[14px] w-[90px]" />
      <SkeletonBlock className="mx-auto mt-5 h-[36px] w-full max-w-[290px] rounded-[16px]" />
    </div>
  );
}

export function DoctorDirectoryCardsSkeleton({
  cardCount = 6,
}: {
  cardCount?: number;
}) {
  return (
    <DoctorLoadingShell label="جارٍ تحميل دليل الأطباء…">
      <div dir="rtl" lang="ar" className="w-full">
        <section className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2 text-right">
              <SkeletonBlock className="h-[20px] w-[120px]" />
              <SkeletonBlock className="h-[14px] w-[200px]" />
            </div>
            <SkeletonBlock className="h-[32px] w-[72px] rounded-[6px]" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <SkeletonBlock className="h-[44px] w-full rounded-[12px]" />
            <SkeletonBlock className="h-[44px] w-[130px] rounded-[6px]" />
            <SkeletonBlock className="h-[44px] w-[130px] rounded-[6px]" />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: cardCount }).map((_, index) => (
            <DoctorDirectoryCardSkeleton key={index} />
          ))}
        </section>

        <section className="mt-8 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <DoctorPaginationSkeleton />
        </section>
      </div>
    </DoctorLoadingShell>
  );
}
