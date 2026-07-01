import { AdminSkeletonBlock } from './admin-skeleton-primitives';

export function NotificationCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[#EAECF0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] md:p-6">
      <div className="flex gap-4">
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <AdminSkeletonBlock className="h-4 w-3/4" />
              <AdminSkeletonBlock className="h-3 w-1/2" />
            </div>
            <AdminSkeletonBlock className="h-3 w-16" />
          </div>
          <AdminSkeletonBlock className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
