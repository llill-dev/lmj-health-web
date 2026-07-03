import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function ContentTemplateRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="min-w-0 flex-1 text-right space-y-3">
        <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3">
          <AdminSkeletonBlock className="h-5 w-40" />
          <AdminSkeletonBlock className="h-5 w-24 rounded-[8px]" />
          <AdminSkeletonBlock className="h-5 w-16 rounded-[8px]" />
        </div>

        <div className="flex flex-wrap items-center justify-start gap-6">
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSkeletonBlock className="h-4 w-4 rounded" />
            <AdminSkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-start">
        <AdminSkeletonBlock className="h-8 w-20 rounded-[10px]" />
        <AdminSkeletonBlock className="h-8 w-20 rounded-[10px]" />
      </div>
    </div>
  );
}
