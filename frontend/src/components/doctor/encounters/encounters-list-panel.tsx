import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ENCOUNTERS_PANEL_TRANSITION } from "./encounters-motion";

export function EncountersListPanel({
  panelKey,
  isRefreshing,
  children,
}: {
  panelKey: string;
  isRefreshing: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-[280px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={panelKey}
          role="tabpanel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={ENCOUNTERS_PANEL_TRANSITION}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isRefreshing ? (
          <motion.div
            key="refresh-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-[16px] bg-white/55 pt-16 backdrop-blur-[2px]"
            aria-hidden
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-cairo text-[12px] font-bold text-[#475467]">
                جاري التحديث...
              </span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
