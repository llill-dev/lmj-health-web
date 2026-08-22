import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function MedicalOrderCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="rounded-[10px] border border-[#E5E7EB] bg-white p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <AdminSkeletonBlock className="h-12 w-12 shrink-0 rounded-[10px]" />
            <div className="flex-1 space-y-2">
              <AdminSkeletonBlock className="h-5 w-48" />
              <AdminSkeletonBlock className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <AdminSkeletonBlock className="h-4 w-24" />
            <AdminSkeletonBlock className="h-4 w-20" />
            <AdminSkeletonBlock className="h-4 w-28" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
          <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
          <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
