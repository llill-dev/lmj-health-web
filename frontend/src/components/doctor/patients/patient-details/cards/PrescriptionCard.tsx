import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileText, Pill } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

interface PrescriptionCardProps {
  prescription: FullProfileData["prescriptions"][number];
  index: number;
}

export function PrescriptionCard({
  prescription,
  index,
}: PrescriptionCardProps) {
  const statusStyles = {
    draft: {
      bg: "bg-[#F3F4F6]/80",
      text: "text-[#374151]",
      ring: "ring-[#D1D5DB]/60",
      label: "مسودة",
    },
    finalized: {
      bg: "bg-[#D1FAE5]/80",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/60",
      label: "معتمدة",
    },
    cancelled: {
      bg: "bg-[#FEE2E2]/80",
      text: "text-[#991B1B]",
      ring: "ring-[#FCA5A5]/60",
      label: "ملغاة",
    },
  };

  const currentStatus = statusStyles[
    prescription.status as keyof typeof statusStyles
  ] ?? {
    bg: "bg-[#F3F4F6]/80",
    text: "text-[#374151]",
    ring: "ring-[#D1D5DB]/60",
    label: prescription.status || "غير محدد",
  };

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E8E7FF]/95 bg-[linear-gradient(165deg,#fefeff_0%,#faf5ff_42%,#f0fdf4_100%)] shadow-[0_16px_42px_-14px_rgba(139,92,246,0.1),0_10px_28px_rgba(15,143,139,0.07)] ring-1 ring-[#e9d5ff]/50"
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 justify-between items-start">
            <div className="flex gap-3">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#f3e8ff] via-white to-[#ecfdf9] text-[#7C3AED] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(139,92,246,0.12)] ring-1 ring-[#DDD6FE]/90">
                <FileText
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-cairo text-[11px] font-black tabular-nums text-[#94a3b8]">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#F5F3FF] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9] ring-1 ring-[#DDD6FE]/50">
                    وصفة طبية
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
                <h3 className="mt-2 font-cairo text-[16px] font-black leading-snug text-[#0f172a]">
                  وصفة طبية
                </h3>
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 font-cairo text-[10px] font-bold text-[#667085]">
                <Clock className="w-3 h-3" />
                التاريخ
              </div>
              <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#101828]">
                {prescription.createdAt}
              </div>
            </div>
          </div>

          {prescription.items.length > 0 && (
            <div className="space-y-2">
              <div className="font-cairo text-[12px] font-black text-[#475467]">
                الأدوية المدرجة ({prescription.items.length})
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {prescription.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E9D5FF]/70 bg-white/90 px-3 py-2.5 shadow-sm"
                  >
                    <div className="flex gap-2 items-start">
                      <Pill className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-cairo text-[13px] font-bold text-[#0f172a]">
                          {item.medicationName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                          <span className="font-cairo font-semibold text-[#64748b]">
                            {item.dosage}
                          </span>
                          <span className="text-[#CBD5E1]">•</span>
                          <span className="font-cairo font-semibold text-[#64748b]">
                            {item.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.notes && (
            <div className="rounded-xl border border-[#FED7AA]/60 bg-[#FFFBEB]/50 px-4 py-3">
              <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#B45309]">
                <AlertTriangle className="h-3.5 w-3.5" />
                ملاحظات الطبيب
              </div>
              <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed text-[#78350f]">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
