/**
 * بطاقة السجل الطبي التاريخي
 */

import { motion } from "framer-motion";
import { CalendarDays, ClipboardList } from "lucide-react";
import { TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";
import { useI18n } from "@/i18n/provider";

interface MedicalHistoryRecordCardProps {
  record: FullProfileData["medicalHistory"][number];
  index: number;
}

export function MedicalHistoryRecordCard({
  record,
  index,
}: MedicalHistoryRecordCardProps) {
  const { t } = useI18n();
  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-white shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.017]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 100% 0%, rgba(15,143,139,0.06), transparent 50%), radial-gradient(circle at 0% 100%, rgba(20,184,166,0.05), transparent 42%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-5 end-0 w-[3px] rounded-full bg-gradient-to-b from-primary via-[#14b8a6] to-[#0f766e] opacity-95 shadow-[0_0_12px_rgba(15,143,139,0.35)]"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex gap-3 justify-between items-start shrink-0 sm:flex-col sm:items-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-br from-primary/14 via-[#ecfdf9] to-white text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(15,143,139,0.12)] ring-1 ring-primary/12">
              <ClipboardList
                className="h-[22px] w-[22px]"
                strokeWidth={2.25}
                aria-hidden
              />
            </div>
            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 font-cairo text-[11px] font-black tabular-nums text-[#64748b] ring-1 ring-[#E2E8F0] sm:hidden">
              #{index}
            </span>
          </div>

          <div className="flex-1 space-y-3 min-w-0 text-start">
            <div className="flex flex-wrap gap-3 justify-between items-start">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap gap-2 justify-start items-center">
                  <span className="hidden font-cairo text-[11px] font-black tabular-nums text-[#94a3b8] sm:inline">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#ecfdf9] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/18">
                    {t("doctor.medicalHistoryCard.badge")}
                  </span>
                </div>
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {record.title}
                </h3>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#E8EDF3]/95 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="mb-1.5 flex items-center justify-start gap-2">
                <span className="hidden font-cairo text-[11px] font-black tabular-nums text-[#94a3b8] sm:inline">
                  #{index}
                </span>
                <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                  {t("doctor.medicalHistoryCard.diagnosisLabel")}
                </span>
              </div>
              <p className="font-cairo text-[13px] font-semibold leading-[1.65] text-[#334155]">
                {record.diagnosis}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/90 bg-[#F8FAFC]/95 px-3.5 py-2 font-cairo text-[12px] font-bold tabular-nums text-[#475569] shadow-[0_4px_12px_rgba(15,23,42,0.04)] backdrop-blur-[2px]">
                <CalendarDays
                  className="w-4 h-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{record.date}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
