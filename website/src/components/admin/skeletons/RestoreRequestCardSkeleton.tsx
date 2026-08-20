import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function RestoreRequestCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <article
      className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
            <AdminSkeletonBlock className="h-6 w-20 rounded-full" />
            <AdminSkeletonBlock className="h-5 w-48" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
              <AdminSkeletonBlock className="h-3 w-36" />
            </div>
            <AdminSkeletonBlock className="mt-3 h-16 w-full rounded-[8px]" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:pt-1">
          <AdminSkeletonBlock className="h-9 w-32 rounded-[8px]" />
        </div>
      </div>
    </article>
  );
}
