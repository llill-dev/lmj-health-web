import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  ClipboardList,
  Clock,
  FileText,
  Stethoscope,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { formatEncounterNotesForDisplay } from "@/lib/consultations/consultationEncounter";
import { cn } from "@/lib/utils/utils";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";

import { TAB_STAGGER_ITEM } from "../constants";

interface EncounterCardProps {
  encounter: DoctorEncounterSummary;
  index: number;
  formatIsoDate: (value?: string | null) => string;
}

const ORIGIN_META: Record<
  string,
  { label: string; icon: LucideIcon; tone: string }
> = {
  appointment: {
    label: "من موعد",
    icon: Calendar,
    tone: "bg-[#EFF8FF] text-[#175CD3] ring-[#B2DDFF]",
  },
  walk_in: {
    label: "زيارة مباشرة",
    icon: UserCheck,
    tone: "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]",
  },
  follow_up: {
    label: "متابعة",
    icon: ClipboardList,
    tone: "bg-[#FAF5FF] text-[#7C3AED] ring-[#DDD6FE]",
  },
  manual: {
    label: "إدخال يدوي",
    icon: FileText,
    tone: "bg-[#F8FAFC] text-[#475467] ring-[#E2E8F0]",
  },
};

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#E8EDF3]/95 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_55%,#f8fafc_100%)] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="mb-1 flex items-center justify-start gap-1.5 font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        {label}
      </div>
      <div className="font-cairo text-[13px] font-extrabold tabular-nums text-[#0f172a]">
        {value}
      </div>
    </div>
  );
}

export function EncounterCard({
  encounter,
  index,
  formatIsoDate,
}: EncounterCardProps) {
  const isOpen = encounter.status === "open";
  const statusLabel = isOpen ? "مفتوحة" : "مغلقة";
  const originKey = encounter.origin ?? "manual";
  const origin =
    ORIGIN_META[originKey] ??
    ({
      label: "غير محدد",
      icon: FileText,
      tone: "bg-[#F8FAFC] text-[#475467] ring-[#E2E8F0]",
    } as const);
  const OriginIcon = origin.icon;

  const startedAt = formatIsoDate(encounter.startedAt ?? encounter.createdAt);
  const closedAt = encounter.closedAt
    ? formatIsoDate(encounter.closedAt)
    : isOpen
      ? "—"
      : "غير مسجّل";
  const appointmentDate = encounter.appointment?.date
    ? `${formatIsoDate(encounter.appointment.date)}${encounter.appointment.startTime ? ` • ${encounter.appointment.startTime}` : ""}`.trim()
    : "لا يوجد موعد مرتبط";
  const appointmentType =
    encounter.appointment?.appointmentTypeNameSnapshot ??
    encounter.appointment?.appointmentType ??
    null;

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-white shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.017] transition-shadow duration-300 hover:shadow-[0_20px_48px_-12px_rgba(15,143,139,0.16),0_8px_22px_rgba(15,23,42,0.06)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 100% 0%, rgba(15,143,139,0.07), transparent 50%), radial-gradient(circle at 0% 100%, rgba(20,184,166,0.05), transparent 42%)",
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-5 right-0 w-[3px] rounded-full opacity-95 shadow-[0_0_12px_rgba(15,143,139,0.35)]",
          isOpen
            ? "bg-gradient-to-b from-[#10B981] via-primary to-[#0f766e]"
            : "bg-gradient-to-b from-[#94A3B8] via-[#CBD5E1] to-[#94A3B8]",
        )}
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex shrink-0 gap-3 sm:flex-col sm:items-center">
            <div
              className={cn(
                "relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(15,143,139,0.12)] ring-1",
                isOpen
                  ? "bg-gradient-to-br from-primary/16 via-[#ecfdf9] to-white text-primary ring-primary/15"
                  : "bg-gradient-to-br from-[#F1F5F9] via-white to-[#F8FAFC] text-[#64748B] ring-[#E2E8F0]",
              )}
            >
              <Stethoscope className="h-[22px] w-[22px]" strokeWidth={2.25} aria-hidden />
              {isOpen ? (
                <span className="absolute -left-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#10B981]" />
                </span>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-right">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  <span className="tabular-nums text-[#94a3b8]">#{index}</span>{" "}
                  زيارة طبية
                </h3>
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1 ring-inset",
                      isOpen
                        ? "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]"
                        : "bg-[#F3F4F6] text-[#475467] ring-[#E5E7EB]",
                    )}
                  >
                    {statusLabel}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1 ring-inset",
                      origin.tone,
                    )}
                  >
                    <OriginIcon className="h-3 w-3" aria-hidden />
                    {origin.label}
                  </span>
                </div>
              </div>

              <div className="shrink-0 rounded-xl border border-[#E2E8F0] bg-white/85 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-start gap-1.5 font-cairo text-[10px] font-bold text-[#667085]">
                  <CalendarDays className="h-3 w-3" aria-hidden />
                  تاريخ البدء
                </div>
                <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#101828]">
                  {startedAt}
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#E8EDF3]/95 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="mb-1.5 font-cairo text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                ملاحظات الزيارة
              </div>
              <p className="font-cairo text-[13px] font-semibold leading-[1.65] text-[#334155]">
                {formatEncounterNotesForDisplay(encounter.notes) ||
                  "لا توجد ملاحظات مسجّلة لهذه الزيارة."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <MetaChip icon={Clock} label="تاريخ الإغلاق" value={closedAt} />
              <MetaChip icon={Calendar} label="الموعد المرتبط" value={appointmentDate} />
              <MetaChip
                icon={ClipboardList}
                label="نوع الموعد"
                value={appointmentType ?? "—"}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
