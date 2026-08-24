import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function VerificationRequestCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <div
      className="min-h-[122px] flex justify-between overflow-hidden rounded-[8px] border border-[#B9D8D6] bg-[#F8FAFA]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="px-4 py-3 flex items-center justify-between flex-1">
        <div className="flex items-start justify-start gap-3">
          <AdminSkeletonBlock className="h-14 w-14 shrink-0 rounded-[8px]" />
          <div className="text-start space-y-2">
            <AdminSkeletonBlock className="h-6 w-40" />
            <AdminSkeletonBlock className="h-5 w-32" />
            <AdminSkeletonBlock className="h-4 w-48" />
          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full space-y-2">
          <AdminSkeletonBlock className="h-5 w-16 rounded-full" />
          <AdminSkeletonBlock className="h-4 w-24" />
        </div>
      </div>

      <AdminSkeletonBlock className="flex w-[58px] self-stretch" />
    </div>
  );
}
