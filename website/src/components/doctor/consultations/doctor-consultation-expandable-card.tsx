"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Ticket } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { UiConsultationListItem } from "@/lib/consultations/map-to-ui";
import {
  CONSULTATIONS_EXPAND_CONTENT_STAGGER,
  CONSULTATIONS_EXPAND_TRANSITION,
} from "@/components/doctor/consultations/consultations-motion";

type ConsultationStatus = UiConsultationListItem["status"];

function statusChipStyle(status: ConsultationStatus) {
  if (status === "in_progress") return "bg-[#EFFFFE] text-primary";
  if (status === "waiting") return "bg-[#FFF7ED] text-[#F97316]";
  if (status === "dismissed") return "bg-[#FEE2E2] text-[#B42318]";
  return "bg-[#ECFDF3] text-[#16A34A]";
}

export default function DoctorConsultationExpandableCard({
  consultation,
  unreadCount,
  expanded,
  onToggle,
  children,
}: {
  consultation: UiConsultationListItem;
  unreadCount: number;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.article
      layout
      transition={CONSULTATIONS_EXPAND_TRANSITION}
      className={cn(
        "overflow-hidden rounded-[14px] border bg-white",
        expanded
          ? "border-primary/25 shadow-[0_20px_48px_-16px_rgba(15,143,139,0.22)]"
          : "border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="px-5 py-4">
        <div className="flex gap-8 justify-between items-start">
          <div className="flex flex-1 gap-3 items-start min-w-0">
            <motion.div
              animate={expanded ? { scale: 1.05 } : { scale: 1 }}
              transition={CONSULTATIONS_EXPAND_TRANSITION}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_10px_18px_rgba(15,143,139,0.25)]"
            >
              <Ticket className="w-5 h-5" />
            </motion.div>

            <div className="flex-1 min-w-0 text-right">
              <div className="flex flex-wrap gap-2 items-center">
                <motion.h3
                  layout="position"
                  className="font-cairo text-[15px] font-extrabold text-[#111827]"
                >
                  {consultation.title}
                </motion.h3>
                {unreadCount > 0 ? (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex h-[22px] items-center justify-center rounded-[6px] bg-primary px-2 font-cairo text-[11px] font-extrabold text-white"
                  >
                    جديد
                  </motion.span>
                ) : null}
              </div>

              <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                {consultation.patientName}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                <span>#{consultation.id.slice(-8)}</span>
                <span className="h-1 w-1 rounded-full bg-[#D0D5DD]" />
                <span>{consultation.createdAtLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            <span className="inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEF3C7] px-2 font-cairo text-[11px] font-extrabold text-[#B45309]">
              {consultation.priorityLabel}
            </span>
            <span
              className={cn(
                "inline-flex h-[24px] items-center justify-center rounded-[6px] px-2 font-cairo text-[11px] font-extrabold",
                statusChipStyle(consultation.status),
              )}
            >
              {consultation.statusLabel}
            </span>
            {unreadCount > 0 ? (
              <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#F43F5E] px-1 font-cairo text-[10px] font-extrabold text-white">
                {unreadCount}
              </span>
            ) : null}
          </div>
          <motion.button
            type="button"
            aria-expanded={expanded}
            aria-label={
              expanded ? "طي تفاصيل الاستشارة" : "عرض تفاصيل الاستشارة"
            }
            onClick={onToggle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex justify-center items-center w-9 h-9 transition-colors shrink-0 text-primary",
            )}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={CONSULTATIONS_EXPAND_TRANSITION}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="consultation-expanded-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={CONSULTATIONS_EXPAND_TRANSITION}
            className="overflow-hidden"
          >
            <motion.div
              variants={CONSULTATIONS_EXPAND_CONTENT_STAGGER}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-4 border-t border-[#EEF2F6] px-5 py-5"
            >
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export { CONSULTATIONS_EXPAND_CONTENT_ITEM } from "@/components/doctor/consultations/consultations-motion";
