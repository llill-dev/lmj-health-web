import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function ServiceTypeRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="min-w-0 flex-1 text-right">
        <div className="flex items-start gap-2 sm:items-center">
          <AdminSkeletonBlock className="h-10 w-10 shrink-0 rounded-[6px]" />
          <div className="min-w-0 space-y-2">
            <AdminSkeletonBlock className="h-5 w-48" />
            <AdminSkeletonBlock className="h-4 w-64" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <AdminSkeletonBlock className="h-9 w-24 rounded-[10px]" />
        <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
        <AdminSkeletonBlock className="h-9 w-12 rounded-[10px]" />
        <AdminSkeletonBlock className="h-6 w-16 rounded-[10px]" />
      </div>
    </div>
  );
}
