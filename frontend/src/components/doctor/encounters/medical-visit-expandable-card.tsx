import { memo, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { DoctorInlineDetailsSkeleton } from "@/components/doctor/shared/skeletons";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";
import {
  ENCOUNTERS_EXPAND_CONTENT_ITEM,
  ENCOUNTERS_EXPAND_CONTENT_STAGGER,
  ENCOUNTERS_EXPAND_TRANSITION,
} from "./encounters-motion";
import type { MedicalVisitCardData } from "./types";

type MedicalVisitExpandableCardProps = {
  visit: MedicalVisitCardData;
  expanded: boolean;
  detailsLoading?: boolean;
  detailsError?: string | null;
  closing?: boolean;
  onToggle: () => void;
  onContinueDraft?: (draftId: string) => void;
  onStartNewVisit?: () => void;
  onCloseVisit?: () => void;
  /** تحميل مسبق لمساحة الزيارة عند التمرير (زيارة نشطة) */
  onWarmWorkspace?: () => void;
};

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
      className="rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start"
    >
      <div className="font-cairo text-[11px] font-bold text-[#667085]">
        {label}
      </div>
      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
        {value}
      </div>
    </motion.div>
  );
}

function DraftBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-cairo text-[11px] font-bold text-[#475467]">
      {icon}
      {label}
    </span>
  );
}

function LinkedAppointmentSection({
  date,
  time,
}: {
  date: string;
  time: string;
}) {
  const { t } = useI18n();
  return (
    <motion.section
      variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
      className="rounded-[12px] border border-[#B2DDFF] bg-[#EFF8FF] px-4 py-4"
    >
      <h4 className="text-start font-cairo text-[13px] font-extrabold text-[#101828]">
        {t("doctor.encounterCard.linkedAppointment.title")}
      </h4>
      <div className="mt-3 space-y-3">
        <div className="flex h-11 items-center justify-start gap-3 rounded-[10px] border border-[#E2E8F0] bg-white px-3">
          <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="font-cairo text-[13px] font-semibold text-[#101828]">
            {date}
          </span>
        </div>
        <div className="flex h-11 items-center justify-start gap-3 rounded-[10px] border border-[#E2E8F0] bg-white px-3">
          <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="font-cairo text-[13px] font-semibold text-[#101828]">
            {time}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

export const MedicalVisitExpandableCard = memo(function MedicalVisitExpandableCard({
  visit,
  expanded,
  detailsLoading = false,
  detailsError,
  closing = false,
  onToggle,
  onContinueDraft,
  onStartNewVisit,
  onCloseVisit,
  onWarmWorkspace,
}: MedicalVisitExpandableCardProps) {
  const { t } = useI18n();
  const isOpen = visit.status === "open";
  const ageLabel =
    visit.patientAge != null
      ? t("doctor.encounterCard.age").replace("{n}", String(visit.patientAge))
      : "—";

  return (
    <motion.article
      layout
      transition={ENCOUNTERS_EXPAND_TRANSITION}
      onMouseEnter={() => {
        if (expanded && isOpen) onWarmWorkspace?.();
      }}
      className={cn(
        "overflow-hidden rounded-[16px] border bg-white transition-shadow duration-300",
        expanded
          ? "border-primary/25 shadow-[0_20px_48px_-16px_rgba(15,143,139,0.22)]"
          : "border-[#E2E8F0] shadow-[0_12px_32px_-14px_rgba(15,23,42,0.12)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-4 text-start transition-colors sm:px-5",
          expanded ? "bg-[#F8FFFE]" : "hover:bg-[#FAFBFC]",
          !expanded && "border-b border-[#F2F4F7]",
        )}
      >
        <div className="flex flex-1 gap-3 items-start min-w-0">
          <motion.div
            animate={expanded ? { scale: 1.04 } : { scale: 1 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-[#14b8a6] text-white shadow-[0_8px_18px_rgba(15,143,139,0.28)]"
          >
            <UserRound className="w-5 h-5" aria-hidden />
          </motion.div>
          <div className="flex-1 min-w-0 text-start">
            <div className="truncate font-cairo text-[15px] font-black text-[#101828]">
              {visit.patientName}
            </div>
            <div className="mt-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
              {visit.visitTypeLabel}
            </div>
            <div className="mt-1.5 flex items-start justify-start gap-6 text-primary sm:gap-10">
              <div className="flex gap-2 items-center">
                <Calendar className="w-3 h-3 shrink-0" aria-hidden />
                <span className="font-cairo text-[12px] font-bold">
                  {visit.listDateLabel}
                </span>
              </div>
              {visit.listTimeLabel !== "—" ? (
                <div className="flex gap-2 items-center">
                  <Clock className="w-3 h-3 shrink-0" aria-hidden />
                  <span className="font-cairo text-[12px] font-extrabold">
                    {visit.listTimeLabel}
                  </span>
                  {visit.listTimePeriodLabel ? (
                    <span className="font-cairo text-[11px] font-semibold">
                      {visit.listTimePeriodLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-3 py-1 font-cairo text-[12px] font-extrabold",
            isOpen
              ? "bg-primary text-white shadow-sm"
              : "bg-[#F2F4F7] text-[#475467]",
          )}
        >
          {isOpen
            ? t("doctor.encounterCard.status.active")
            : t("doctor.encounterCard.status.closed")}
        </span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={ENCOUNTERS_EXPAND_TRANSITION}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-primary" aria-hidden />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className="overflow-hidden"
          >
            <motion.div
              variants={ENCOUNTERS_EXPAND_CONTENT_STAGGER}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-4 border-t border-[#E2E8F0]/80 bg-white px-4 py-5 sm:px-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCell label={t("doctor.encounterCard.fields.name")} value={visit.patientName} />
                <InfoCell label={t("doctor.encounterCard.fields.age")} value={ageLabel} />
                <InfoCell label={t("doctor.encounterCard.fields.fileNumber")} value={visit.fileNumber} />
                <InfoCell label={t("doctor.encounterCard.fields.started")} value={visit.startedAtLabel} />
              </div>

              <motion.div
                variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start">
                  <div className="font-cairo text-[11px] font-bold text-[#667085]">
                    {t("doctor.encounterCard.fields.startedShort")}
                  </div>
                  <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
                    {visit.startedAtLabel}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start">
                  <div className="font-cairo text-[11px] font-bold text-[#667085]">
                    {t("doctor.encounterCard.fields.appointment")}
                  </div>
                  <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
                    {visit.listTimeLabel !== "—"
                      ? `${visit.listTimeLabel}${visit.listTimePeriodLabel ? ` ${visit.listTimePeriodLabel}` : ""}`
                      : "—"}
                  </div>
                </div>
              </motion.div>

              <LinkedAppointmentSection
                date={visit.linkedAppointment?.date ?? "—"}
                time={visit.linkedAppointment?.time ?? "—"}
              />

              <motion.div
                variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                <InfoCell label={t("doctor.encounterCard.fields.visitType")} value={visit.visitTypeLabel} />
                <InfoCell
                  label={t("doctor.encounterCard.fields.appointmentType")}
                  value={visit.appointmentTypeName || "—"}
                />
                <InfoCell
                  label={t("doctor.encounterCard.fields.closedAt")}
                  value={
                    visit.status === "closed"
                      ? visit.closedAtLabel || "—"
                      : t("doctor.encounterCard.notClosedYet")
                  }
                />
              </motion.div>

              {detailsLoading ? (
                <motion.div variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}>
                  <DoctorInlineDetailsSkeleton rows={4} />
                </motion.div>
              ) : null}

              {detailsError ? (
                <motion.div
                  variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                  className="rounded-[12px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-start font-cairo text-[13px] font-bold text-[#B42318]"
                >
                  {detailsError}
                </motion.div>
              ) : null}

              {visit.notes ? (
                <motion.section
                  variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                  className="rounded-[12px] border border-[#D0D5DD] bg-[#FCFCFD] p-4 text-start"
                >
                  <div className="flex items-center gap-2 text-[#344054]">
                    <FileText className="w-4 h-4 text-primary" />
                    <h4 className="font-cairo text-[13px] font-extrabold">
                      {t("doctor.encounterCard.notes.title")}
                    </h4>
                  </div>
                  <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#475467]">
                    {visit.notes}
                  </p>
                </motion.section>
              ) : null}

              {visit.drafts.length > 0 ? (
                <motion.section
                  variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                  className="rounded-[12px] border border-[#9EE8E0] bg-gradient-to-br from-[#F0FDFA] to-white p-4"
                >
                  <h4 className="mb-3 text-start font-cairo text-[13px] font-extrabold text-[#0F766E]">
                    {t("doctor.encounterCard.drafts.title")}
                  </h4>
                  <div className="space-y-3">
                    {visit.drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="rounded-[10px] border border-[#CCFBF1] bg-white/90 p-3 shadow-sm"
                      >
                        <div className="flex flex-wrap gap-2 justify-between items-center">
                          <span className="font-cairo text-[13px] font-black text-[#101828]">
                            {draft.code}
                          </span>
                          <span className="font-cairo text-[11px] font-semibold text-[#667085]">
                            {draft.updatedAtLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <DraftBadge
                            icon={<Pill className="h-3.5 w-3.5" />}
                            label={t("doctor.encounterCard.drafts.prescriptions").replace(
                              "{n}",
                              String(draft.prescriptionsCount),
                            )}
                          />
                          <DraftBadge
                            icon={<FlaskConical className="h-3.5 w-3.5" />}
                            label={t("doctor.encounterCard.drafts.labTests").replace(
                              "{n}",
                              String(draft.labTestsCount),
                            )}
                          />
                          <DraftBadge
                            icon={<ScanLine className="h-3.5 w-3.5" />}
                            label={t("doctor.encounterCard.drafts.imaging").replace(
                              "{n}",
                              String(draft.imagingCount),
                            )}
                          />
                        </div>
                        <button
                          type="button"
                          onMouseEnter={() => onWarmWorkspace?.()}
                          onClick={() => onContinueDraft?.(draft.id)}
                          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0F766E] font-cairo text-[13px] font-extrabold text-white transition-opacity hover:opacity-95"
                        >
                          {t("doctor.encounterCard.drafts.continue")}
                          <ChevronLeft className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <motion.div
                variants={ENCOUNTERS_EXPAND_CONTENT_ITEM}
                className="grid gap-3 sm:grid-cols-2"
              >
                {isOpen ? (
                  <button
                    type="button"
                    onClick={onCloseVisit}
                    disabled={closing}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#F04438] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Stethoscope className="w-4 h-4" />
                    {closing
                      ? t("doctor.encounterCard.closing")
                      : t("doctor.encounterCard.closeVisit")}
                  </button>
                ) : (
                  <div className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#667085]">
                    {t("doctor.encounterCard.visitClosed")}
                  </div>
                )}
                <motion.button
                  type="button"
                  onClick={onStartNewVisit}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                  className="inline-flex h-12 items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)]"
                >
                  {t("doctor.encounterCard.startNewVisit")}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
});
