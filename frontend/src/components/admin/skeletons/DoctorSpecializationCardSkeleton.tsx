import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function DoctorSpecializationCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="h-full min-h-[168px] flex flex-col overflow-hidden rounded-[14px] border border-[#E8ECEF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.07)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-primary/90 via-[#2DD4BF]/90 to-transparent opacity-90 animate-pulse" />

      <div className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex flex-wrap gap-2 justify-between items-start">
          <AdminSkeletonBlock className="h-6 w-16 rounded-full" />
          <AdminSkeletonBlock className="h-6 w-10 rounded-full" />
        </div>

        <div className="min-w-0 space-y-2">
          <AdminSkeletonBlock className="h-5 w-full max-w-[200px]" />
          <AdminSkeletonBlock className="h-4 w-full max-w-[150px]" />
          <AdminSkeletonBlock className="h-3 w-full max-w-[120px]" />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#F2F4F7] pt-3">
          <AdminSkeletonBlock className="h-9 flex-1 min-w-[120px] rounded-[10px]" />
          <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
          <AdminSkeletonBlock className="h-9 w-9 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
