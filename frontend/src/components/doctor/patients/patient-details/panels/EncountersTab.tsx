import { motion } from "framer-motion";
import { Calendar, ClipboardList, FileText, Stethoscope, UserCheck } from "lucide-react";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";

import { PatientDetailsTabSkeleton } from "../skeletons";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";

interface EncountersTabProps {
  encounters: DoctorEncounterSummary[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  onRetry: () => void;
  onOpenEncountersPage: () => void;
  formatIsoDate: (value?: string | null) => string;
}

export function EncountersTab({
  encounters,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
  onOpenEncountersPage,
  formatIsoDate,
}: EncountersTabProps) {
  if (isLoading) return <PatientDetailsTabSkeleton rows={4} />;

  if (isError) {
    return (
      <DoctorListErrorState
        title="تعذّر تحميل الزيارات الطبية"
        brief={getUserFacingRequestErrorMessage(error)}
        detail={getUserFacingRequestErrorMessage(error)}
        retrying={isFetching}
        onRetry={onRetry}
      />
    );
  }

  if (!encounters.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
            title="لا توجد زيارات مسجّلة بعد"
            subtitle="تابع وفتح الزيارات السريرية من مركز الزيارات الطبية؛ ستنعكس هنا بمجرد الربط مع ملف هذا المريض."
            actionLabel="الانتقال إلى الزيارات الطبية"
            onAction={onOpenEncountersPage}
            actionIcon={<Stethoscope className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      {encounters.map((encounter, index) => {
        const statusLabel = encounter.status === "closed" ? "مغلقة" : "مفتوحة";
        const statusTone =
          encounter.status === "closed"
            ? "bg-[#F3F4F6] text-[#475467] ring-[#E5E7EB]"
            : "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]";
        const originLabel =
          encounter.origin === "appointment"
            ? "من موعد"
            : encounter.origin === "walk_in"
              ? "زيارة مباشرة"
              : encounter.origin === "follow_up"
                ? "متابعة"
                : encounter.origin === "manual"
                  ? "إدخال يدوي"
                  : "غير محدد";
        const OriginIcon =
          encounter.origin === "appointment"
            ? Calendar
            : encounter.origin === "walk_in"
              ? UserCheck
              : encounter.origin === "follow_up"
                ? ClipboardList
                : FileText;

        return (
          <motion.article
            key={encounter._id}
            variants={TAB_STAGGER_ITEM}
            className="rounded-[22px] border border-[#E2E8F0]/95 bg-gradient-to-br from-white to-[#F8FAFC]/50 p-5 shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-right">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-cairo text-[14px] font-black text-[#0F172A]">
                    زيارة طبية #{index + 1}
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 font-cairo text-[11px] font-extrabold ring-1 ring-inset ${statusTone}`}>
                    {statusLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-2.5 py-1 font-cairo text-[11px] font-bold text-[#475467] ring-1 ring-inset ring-[#E2E8F0]">
                    <OriginIcon className="h-3.5 w-3.5" />
                    {originLabel}
                  </span>
                </div>
                <p className="font-cairo text-[13px] font-semibold leading-6 text-[#475467]">
                  {encounter.notes || "لا توجد ملاحظات مسجلة لهذه الزيارة."}
                </p>
              </div>
              <div className="min-w-[160px] rounded-2xl bg-[#F8FAFC] px-4 py-3 text-right">
                <div className="font-cairo text-[11px] font-bold text-[#64748B]">تاريخ البدء</div>
                <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#0F172A]">
                  {formatIsoDate(encounter.startedAt ?? encounter.createdAt)}
                </div>
                <div className="mt-3 font-cairo text-[11px] font-bold text-[#64748B]">الموعد المرتبط</div>
                <div className="mt-1 font-cairo text-[12px] font-semibold text-[#475467]">
                  {encounter.appointment?.date
                    ? `${formatIsoDate(encounter.appointment.date)} ${encounter.appointment.startTime ?? ""}`.trim()
                    : "لا يوجد"}
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
