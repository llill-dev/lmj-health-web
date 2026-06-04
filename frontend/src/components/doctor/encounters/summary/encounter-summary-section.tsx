'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { ENCOUNTERS_EXPAND_TRANSITION } from '@/components/doctor/encounters/encounters-motion';

export function EncounterSummarySection({
  title,
  icon: Icon,
  count,
  expanded,
  onToggle,
  children,
  bodyClassName,
  headerBackground = '#E6F4F3',
}: {
  title: string;
  icon: LucideIcon;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
  /** Section-specific header bar color */
  headerBackground?: string;
}) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-[#0F8F8B]/30 bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div
        className="border-b px-4 py-3 sm:px-5"
        style={{
          backgroundColor: headerBackground,
          borderColor: headerBackground,
        }}
      >
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex gap-3 justify-between items-center w-full text-right"
        >
          <div className="flex flex-1 gap-3 justify-start items-center min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4F3]">
              <Icon className="w-5 h-5 text-primary" aria-hidden />
            </div>
            <span className="font-cairo text-[15px] font-extrabold text-[#101828]">
              {title}
            </span>
            {typeof count === "number" ? (
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border border-[#BFEDEC] bg-white px-2 font-cairo text-[12px] font-extrabold text-primary">
                {count}
              </span>
            ) : null}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="shrink-0 text-[#667085]"
            aria-hidden
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="overflow-hidden"
          >
            <div className={cn("px-4 py-4 sm:px-5 sm:py-5", bodyClassName)}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
