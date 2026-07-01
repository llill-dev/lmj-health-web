import { AdminSkeletonBlock } from './admin-skeleton-primitives';

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#E8ECEF] bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <AdminSkeletonBlock className="h-4 w-32" />
              <AdminSkeletonBlock className="h-3 w-24" />
            </div>
            <AdminSkeletonBlock className="h-8 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <AdminSkeletonBlock className="h-2 w-16" />
                <AdminSkeletonBlock className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <AdminSkeletonBlock className="h-2 w-16" />
                <AdminSkeletonBlock className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <AdminSkeletonBlock className="h-2 w-16" />
                <AdminSkeletonBlock className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <AdminSkeletonBlock className="h-2 w-16" />
                <AdminSkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
