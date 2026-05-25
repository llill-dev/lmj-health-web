import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

interface MedicalOrderCardProps {
  order: FullProfileData["orders"][number];
  index: number;
}

export function MedicalOrderCard({ order, index }: MedicalOrderCardProps) {
  const statusStyles = {
    pending: {
      bg: "bg-[#FEF3C7]/80",
      text: "text-[#92400E]",
      ring: "ring-[#FDE68A]/60",
      label: "قيد الانتظار",
    },
    completed: {
      bg: "bg-[#D1FAE5]/80",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/60",
      label: "مكتمل",
    },
    cancelled: {
      bg: "bg-[#FEE2E2]/80",
      text: "text-[#991B1B]",
      ring: "ring-[#FCA5A5]/60",
      label: "ملغى",
    },
    in_progress: {
      bg: "bg-[#DBEAFE]/80",
      text: "text-[#1E40AF]",
      ring: "ring-[#93C5FD]/60",
      label: "جارٍ التنفيذ",
    },
  };

  const currentStatus = statusStyles[
    order.status as keyof typeof statusStyles
  ] ?? {
    bg: "bg-[#F3F4F6]/80",
    text: "text-[#374151]",
    ring: "ring-[#D1D5DB]/60",
    label: order.status || "غير محدد",
  };

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E8EDF3]/95 bg-[linear-gradient(165deg,#fffbeb_0%,#ffffff_42%,#f0fdf4_100%)] shadow-[0_16px_42px_-14px_rgba(234,179,8,0.08),0_10px_28px_rgba(15,143,139,0.06)] ring-1 ring-[#fef3c7]/40"
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#EAB308]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex-1 min-w-0 text-right">
            <div className="flex gap-3 justify-start items-start shrink-0">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#fef3c7] via-white to-[#ecfdf9] text-[#CA8A04] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(234,179,8,0.1)] ring-1 ring-[#FDE68A]/70">
                <Activity
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 justify-start items-center mb-2">
                  <span className="font-cairo text-[11px] font-black tabular-nums text-[#94a3b8]">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#fef9c3] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-[#854D0E] ring-1 ring-[#FDE047]/40">
                    طلب طبي
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1",
                      currentStatus.bg,
                      currentStatus.text,
                      currentStatus.ring,
                    )}
                  >
                    {currentStatus.label}
                  </span>
                </div>
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {order.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
