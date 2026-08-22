'use client';

import { SkeletonBlock } from './doctor-skeleton-primitives';

export function DoctorPaginationSkeleton() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      aria-hidden
    >
      <SkeletonBlock className="h-4 w-40" />
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
        <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
        <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
        <SkeletonBlock className="h-9 w-20 rounded-[8px]" />
      </div>
    </div>
  );
}
