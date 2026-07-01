import { motion } from "framer-motion";
import {
  AdminSkeletonBlock,
  createStaggeredDelay,
} from "./admin-skeleton-primitives";

export function ComplaintCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = createStaggeredDelay(index);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="flex w-full items-stretch gap-0 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[6px] bg-[#F3F4F6] animate-pulse" />
            <div className="min-w-0 text-right space-y-2">
              <AdminSkeletonBlock className="h-5 w-40" />
              <AdminSkeletonBlock className="h-5 w-32" />
            </div>
          </div>
          <AdminSkeletonBlock className="h-[23px] w-20 rounded-[6px]" />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-2 ms-0 sm:ms-[80px]">
          <div className="flex min-w-0 items-start gap-1.5">
            <AdminSkeletonBlock className="h-4 w-4 rounded-full" />
            <AdminSkeletonBlock className="h-4 w-48" />
          </div>
          <AdminSkeletonBlock className="h-4 w-24" />
        </div>
      </div>
      <div className="flex w-[56px] shrink-0 items-center justify-center bg-[#F3F4F6] animate-pulse" />
    </motion.div>
  );
}
