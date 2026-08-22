export default function AccessRequestCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
      <div className="flex gap-4">
        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-[#F3F4F6] animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-[#F3F4F6] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#F3F4F6] animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded bg-[#F3F4F6] animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <div className="h-4 w-4 rounded bg-[#F3F4F6] animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-16 rounded bg-[#F3F4F6] animate-pulse" />
                <div className="h-3 w-20 rounded bg-[#F3F4F6] animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <div className="h-4 w-4 rounded bg-[#F3F4F6] animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-16 rounded bg-[#F3F4F6] animate-pulse" />
                <div className="h-3 w-20 rounded bg-[#F3F4F6] animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <div className="h-4 w-4 rounded bg-[#F3F4F6] animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-16 rounded bg-[#F3F4F6] animate-pulse" />
                <div className="h-3 w-20 rounded bg-[#F3F4F6] animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2">
              <div className="h-4 w-4 rounded bg-[#F3F4F6] animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-16 rounded bg-[#F3F4F6] animate-pulse" />
                <div className="h-3 w-20 rounded bg-[#F3F4F6] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
