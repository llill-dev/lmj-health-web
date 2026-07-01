import { AdminSkeletonBlock } from './admin-skeleton-primitives';

export function PatientCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white">
      <div className="flex">
        <div className="flex-1 px-6 py-5">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-start">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-[#F3F4F6] animate-pulse" />
              <div className="text-right space-y-2">
                <AdminSkeletonBlock className="h-5 w-40" />
                <AdminSkeletonBlock className="h-3 w-24" />
              </div>
            </div>
            <AdminSkeletonBlock className="h-[24px] w-20 rounded-[6px]" />
          </div>

          <div className="flex justify-between items-end">
            <div className="mt-4 rounded-[10px] bg-[#F9FAFB] px-4 py-3">
              <div className="flex flex-col gap-2 justify-start items-start">
                <AdminSkeletonBlock className="h-4 w-32" />
                <AdminSkeletonBlock className="h-4 w-40" />
              </div>
            </div>
            <div className="flex gap-2">
              <AdminSkeletonBlock className="h-[34px] w-[150px] rounded-[10px]" />
              <AdminSkeletonBlock className="h-[34px] w-[150px] rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
