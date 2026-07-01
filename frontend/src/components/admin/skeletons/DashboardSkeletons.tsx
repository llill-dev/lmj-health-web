import { AdminSkeletonBlock } from './admin-skeleton-primitives';

export function DashboardActivitySkeletonRow() {
  return (
    <div className="flex gap-3 justify-between items-center px-6 py-4">
      <div className="flex flex-1 gap-3 items-center min-w-0">
        <div className="flex justify-center items-center h-[36px] w-[36px] shrink-0 rounded-[10px] bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 min-w-0 text-right space-y-2">
          <AdminSkeletonBlock className="h-3 w-3/4" />
          <AdminSkeletonBlock className="h-2 w-1/2" />
        </div>
      </div>
      <AdminSkeletonBlock className="h-3 w-16 shrink-0" />
    </div>
  );
}

export function DashboardComplaintCardSkeleton() {
  return (
    <div className="flex items-stretch overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC]">
      <div className="flex flex-1 gap-3 p-4 min-w-0 sm:gap-4 sm:p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] sm:h-14 sm:w-14 bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 min-w-0 text-right space-y-2">
          <div className="flex flex-wrap gap-2 justify-end items-center">
            <AdminSkeletonBlock className="h-5 w-20 rounded-full" />
          </div>
          <AdminSkeletonBlock className="h-5 w-48" />
          <AdminSkeletonBlock className="h-4 w-32" />
          <AdminSkeletonBlock className="h-3 w-64" />
          <AdminSkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <div className="flex w-[52px] shrink-0 items-center justify-center bg-[#F3F4F6] animate-pulse" />
    </div>
  );
}

export function DashboardContentCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0 text-right space-y-3">
          <div className="flex flex-wrap gap-2 justify-start items-center">
            <AdminSkeletonBlock className="h-5 w-48" />
            <AdminSkeletonBlock className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-end space-x-2">
            <AdminSkeletonBlock className="h-3 w-24" />
            <AdminSkeletonBlock className="h-3 w-28" />
            <AdminSkeletonBlock className="h-3 w-20" />
            <AdminSkeletonBlock className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2 justify-end shrink-0 lg:pt-1">
          <AdminSkeletonBlock className="h-10 w-10 rounded-full" />
          <AdminSkeletonBlock className="h-10 w-10 rounded-full" />
          <AdminSkeletonBlock className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
