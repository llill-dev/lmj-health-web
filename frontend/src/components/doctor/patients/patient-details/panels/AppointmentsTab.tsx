import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Hospital,
  Phone,
  Plus,
  Video,
} from "lucide-react";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";

import { PatientAppointmentsSummaryCards } from "../cards";
import { PatientDetailsTabSkeleton } from "../skeletons";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import {
  countPatientAppointments,
  type PatientAppointmentCounts,
} from "@/lib/doctor/dashboard/countPatientAppointments";
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "@/lib/shared/formatAppointmentDateTime";
import { useI18n } from "@/i18n/provider";

type TFn = (key: string, fallback?: string) => string;

function patientInitialsFromName(name: string | undefined, t: TFn): string {
  const value = name?.trim() ?? "";
  if (!value) return t("doctor.appointmentsTab.initialsFallback");
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

interface AppointmentsTabProps {
  appointments: any[];
  isAwaitingData: boolean;
  isError: boolean;
  retrying?: boolean;
  onRetry: () => void;
  onOpenAppointments: () => void;
  formatIsoDate: (value?: string | null) => string;
}

export function AppointmentsTab({
  appointments,
  isAwaitingData,
  isError,
  retrying,
  onRetry,
  onOpenAppointments,
  formatIsoDate,
}: AppointmentsTabProps) {
  const { t, locale } = useI18n();

  if (isAwaitingData) return <PatientDetailsTabSkeleton rows={3} />;

  if (isError) {
    return (
      <DoctorListErrorState
        title={t("doctor.appointmentsTab.error.title")}
        brief={t("doctor.appointmentsTab.error.message")}
        detail={t("doctor.appointmentsTab.error.message")}
        retrying={retrying}
        onRetry={onRetry}
      />
    );
  }

  const appointmentCounts: PatientAppointmentCounts =
    countPatientAppointments(appointments);

  if (!appointments.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full space-y-4">
        <motion.div variants={TAB_STAGGER_ITEM}>
          <PatientAppointmentsSummaryCards counts={appointmentCounts} />
        </motion.div>
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
            title={t("doctor.appointmentsTab.empty.title")}
            subtitle={t("doctor.appointmentsTab.empty.subtitle")}
            actionLabel={t("doctor.appointmentsTab.bookNew")}
            onAction={onOpenAppointments}
            actionIcon={<CalendarDays className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  const statusMap: Record<string, { label: string; tone: string }> = {
    scheduled: { label: t("doctor.appointmentsTab.status.scheduled"), tone: "bg-primary text-white" },
    completed: { label: t("doctor.appointmentsTab.status.completed"), tone: "bg-[#ECFDF3] text-[#027A48] ring-1 ring-inset ring-[#ABEFC6]" },
    cancelled: { label: t("doctor.appointmentsTab.status.cancelled"), tone: "bg-[#FEE2E2] text-[#991B1B] ring-1 ring-inset ring-[#FCA5A5]" },
    no_show: { label: t("doctor.appointmentsTab.status.noShow"), tone: "bg-[#F3F4F6] text-[#475467] ring-1 ring-inset ring-[#E5E7EB]" },
    rescheduled: { label: t("doctor.appointmentsTab.status.rescheduled"), tone: "bg-[#FFF7ED] text-[#C2410C] ring-1 ring-inset ring-[#FDBA74]" },
  };

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={TAB_STAGGER_ITEM}>
        <PatientAppointmentsSummaryCards counts={appointmentCounts} />
      </motion.div>
      <motion.div variants={TAB_STAGGER_ITEM} className="flex justify-start">
        <button
          type="button"
          onClick={onOpenAppointments}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.18)] transition-colors hover:bg-[#0d7a77]"
        >
          <Plus className="h-4 w-4" />
          {t("doctor.appointmentsTab.bookNew")}
        </button>
      </motion.div>

      {appointments.map((appointment, index) => {
        const status = statusMap[appointment.status] ?? {
          label: appointment.status ?? t("doctor.appointmentsTab.status.unknown"),
          tone: "bg-[#F3F4F6] text-[#475467] ring-1 ring-inset ring-[#E5E7EB]",
        };
        const patientName =
          appointment.patientName ??
          appointment.patient?.userId?.fullName ??
          appointment.patient?.fullName ??
          t("doctor.appointmentsTab.patientFallback");
        const patientPhone =
          appointment.patientPhone ??
          appointment.patient?.userId?.phone ??
          appointment.patient?.phone ??
          "—";
        const type =
          appointment.type ??
          (appointment.mode === "video" ? "video" : "clinic");
        const modeLine =
          type === "video"
            ? t("doctor.appointmentsTab.mode.online")
            : t("doctor.appointmentsTab.mode.clinic");
        const kindLabel =
          type === "video"
            ? t("doctor.appointmentsTab.kind.consultation")
            : type === "home"
              ? t("doctor.appointmentsTab.kind.homeVisit")
              : t("doctor.appointmentsTab.kind.followUp");

        return (
          <motion.article
            key={appointment._id ?? index}
            variants={TAB_STAGGER_ITEM}
            className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="px-4 py-4 sm:px-5 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary font-cairo text-[18px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
                    {patientInitialsFromName(patientName, t)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="font-cairo text-[17px] font-extrabold leading-tight text-[#101828]">
                      {patientName}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-cairo text-[13px] font-semibold text-[#667085]">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-primary" />
                        {patientPhone}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-primary">
                        {type === "video" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Hospital className="h-4 w-4" />
                        )}
                        {modeLine}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.startTime ?? appointment.time ?? "—"}
                      </span>
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary">
                        <Calendar className="h-3.5 w-3.5" />
                        {appointment.date ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:items-start">
                  <span className="rounded-lg bg-primary px-2.5 py-1 font-cairo text-[11px] font-bold text-white">
                    {kindLabel}
                  </span>
                  <span
                    className={`rounded-lg px-2.5 py-1 font-cairo text-[11px] font-bold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#EEF2F6] pt-4">
                <div className="rounded-[10px] border border-[#EEF2F6] bg-[#FAFBFC] px-3">
                  <div className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0">
                    <Calendar className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                    <div className="flex min-w-0 flex-1 items-center gap-4 text-start">
                      <div className="font-cairo text-[16px] font-bold text-primary">{t("doctor.appointmentsTab.fields.date")}</div>
                      <div className="mt-0.5 font-cairo text-[16px] font-normal text-[#1F2937]">
                        {formatAppointmentDate(appointment.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0">
                    <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                    <div className="flex min-w-0 flex-1 items-center gap-4 text-start">
                      <div className="font-cairo text-[16px] font-bold text-primary">{t("doctor.appointmentsTab.fields.time")}</div>
                      <div className="mt-0.5 font-cairo text-[16px] font-normal text-[#1F2937]">
                        {formatAppointmentTime(appointment.startTime ?? appointment.time, locale)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0">
                    <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                    <div className="flex min-w-0 flex-1 items-center gap-4 text-start">
                      <div className="font-cairo text-[16px] font-bold text-primary">{t("doctor.appointmentsTab.fields.status")}</div>
                      <div className="mt-0.5 font-cairo text-[16px] font-normal text-[#1F2937]">
                        {status.label}
                      </div>
                    </div>
                  </div>
                  {(appointment.appointmentTypeNameSnapshot ?? appointment.appointmentType?.name) ? (
                    <div className="flex items-start gap-3 py-3">
                      <Hospital className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                      <div className="flex min-w-0 flex-1 items-center gap-4 text-start">
                        <div className="font-cairo text-[16px] font-bold text-primary">{t("doctor.encounterCard.fields.appointmentType")}</div>
                        <div className="mt-0.5 font-cairo text-[16px] font-normal text-[#1F2937]">
                          {appointment.appointmentTypeNameSnapshot ?? appointment.appointmentType?.name}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
