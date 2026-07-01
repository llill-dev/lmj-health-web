import { AdminSkeletonBlock } from './admin-skeleton-primitives';

export function FacilityCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex gap-4">
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <AdminSkeletonBlock className="h-4 w-48" />
              <AdminSkeletonBlock className="h-3 w-32" />
            </div>
            <AdminSkeletonBlock className="h-8 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
