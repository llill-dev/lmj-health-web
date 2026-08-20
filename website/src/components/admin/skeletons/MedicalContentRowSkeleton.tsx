import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function MedicalContentRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="flex flex-col gap-3 justify-between px-6 py-5 sm:flex-row sm:items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-1 min-w-0 text-right space-y-3">
        <div className="flex flex-wrap gap-2 justify-start items-center sm:gap-3">
          <AdminSkeletonBlock className="h-5 w-48" />
          <AdminSkeletonBlock className="h-5 w-12 rounded-[8px]" />
          <AdminSkeletonBlock className="h-5 w-20 rounded-[8px]" />
        </div>

        <div className="flex flex-wrap items-center justify-start gap-6">
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center sm:justify-start">
        <AdminSkeletonBlock className="h-8 w-28 rounded-[10px]" />
        <AdminSkeletonBlock className="h-8 w-28 rounded-[10px]" />
      </div>
    </div>
  );
}
