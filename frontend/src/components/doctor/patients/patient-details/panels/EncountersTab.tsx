import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";

import { EncounterCard } from "../cards";
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

  const openCount = encounters.filter((e) => e.status === "open").length;

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div
        variants={TAB_STAGGER_ITEM}
        className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#E2E8F0]/90 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_60%,#f8fafc_100%)] px-4 py-3"
      >
        <div className="text-right">
          <p className="font-cairo text-[13px] font-extrabold text-[#0F172A]">
            {encounters.length} زيارة مسجّلة
          </p>
          <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#64748B]">
            {openCount > 0
              ? `${openCount} زيارة مفتوحة حالياً`
              : "جميع الزيارات مغلقة"}
          </p>
        </div>
        {openCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF3] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-[#027A48] ring-1 ring-inset ring-[#ABEFC6]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            زيارة نشطة
          </span>
        ) : null}
      </motion.div>

      {encounters.map((encounter, index) => (
        <EncounterCard
          key={encounter._id}
          encounter={encounter}
          index={index + 1}
          formatIsoDate={formatIsoDate}
        />
      ))}
    </motion.div>
  );
}
