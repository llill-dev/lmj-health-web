import { motion } from "framer-motion";
import { Activity, Clock, Pill } from "lucide-react";
import { TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";
import { useI18n } from "@/i18n/provider";

interface MedicationRecordCardProps {
  medication: FullProfileData["medications"][number];
}

export function MedicationRecordCard({
  medication,
}: MedicationRecordCardProps) {
  const { t } = useI18n();
  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="relative overflow-hidden rounded-[22px] border border-[#E8E7FF]/90 bg-[linear-gradient(165deg,#fefeff_0%,#fafbff_42%,#f5fffb_100%)] shadow-[0_16px_42px_-14px_rgba(79,70,229,0.08),0_10px_28px_rgba(15,143,139,0.07)] ring-1 ring-[#e0e7ff]/70"
    >
      <div
        className="pointer-events-none absolute -start-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#6366f1]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.07] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex-1 min-w-0 text-start">
            <div className="flex gap-3 justify-start items-start shrink-0">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#eef2ff] via-white to-[#ecfdf9] text-[#4338ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(67,56,202,0.1)] ring-1 ring-[#c7d2fe]/90">
                <Pill
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div className="">
                <div className="flex flex-wrap gap-2 justify-start items-center">
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#4338ca] ring-1 ring-[#e0e7ff] shadow-sm">
                    {t("doctor.medicationCard.badge")}
                  </span>
                </div>
                <h3 className="mt-2 font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {medication.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
              <div className="rounded-[14px] border border-primary/15 bg-white/85 px-4 py-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
                <div className="flex gap-2 justify-start items-center text-primary">
                  <Activity
                    className="h-3.5 w-3.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                  <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide opacity-90">
                    {t("doctor.medicationCard.dosage")}
                  </span>
                </div>
                <p className="mt-2 font-cairo text-[13px] font-bold leading-relaxed text-[#1e293b]">
                  {medication.dosage || "—"}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#fed7aa]/60 bg-[linear-gradient(145deg,#fffbeb_0%,#ffffff_100%)] px-4 py-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex items-center justify-start gap-2 text-[#c2410c]">
                  <Clock
                    className="h-3.5 w-3.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                  <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide opacity-90">
                    {t("doctor.medicationCard.frequency")}
                  </span>
                </div>
                <p className="mt-2 font-cairo text-[13px] font-bold leading-relaxed text-[#78350f]">
                  {medication.frequency || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
