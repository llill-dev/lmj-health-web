"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  Ban,
  Tag,
  Wallet,
  FileText,
  FolderOpen,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";
import { formatPatientLabel } from "@/components/admin/appointments/appointmentListUtils";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";

export default function AdminAppointmentDetailsDialog({
  open,
  onOpenChange,
  appointmentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
}) {
  const { locale, dir, t } = useI18n();
  const enabled = open && !!appointmentId;

  const detailsQuery = useQuery({
    queryKey: ["admin", "appointment", appointmentId],
    queryFn: async () =>
      adminApi.appointments.getDetails(String(appointmentId)),
    enabled,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  const appointment = detailsQuery.data?.appointment;
  const appointmentFiles = appointment?.files ?? [];
  const detailsAwaiting = isAwaitingInitialQueryData(
    detailsQuery.data,
    detailsQuery.isError,
  );

  function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");
  }

  function formatBytes(value?: number | null) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return "—";
    }

    if (value < 1024)
      return `${value.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")} B`;
    const kb = value / 1024;
    if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative w-[720px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            dir={dir}
            lang={locale}
          >
            <div className="relative px-8 pb-7 pt-7">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute end-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-start font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]">
                {t("adminAppointments.details.title")}
              </h2>

              {detailsAwaiting ? (
                <div className="mt-6 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("adminAppointments.details.loading")}
                </div>
              ) : detailsQuery.isError ? (
                <div className="mt-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#991B1B]">
                  {t("adminAppointments.details.loadError")}
                </div>
              ) : !appointment ? (
                <div className="mt-6 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("adminAppointments.details.noData")}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <CalendarDays className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.dateTime")}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 font-cairo text-[12px] font-bold text-[#344054]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{appointment.startTime ?? "—"}</span>
                        </div>
                        <div className="text-[#667085]">
                          {appointment.date ??
                            (appointment.startDateTime
                              ? new Date(
                                  appointment.startDateTime,
                                ).toLocaleString()
                              : "—")}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Ban className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("common.statusLabel")}
                        </div>
                      </div>
                      <div className="mt-3 font-cairo text-[13px] font-extrabold text-[#111827]">
                        {appointment.status}
                      </div>
                      {appointment.cancelReason ? (
                        <div className="mt-2 font-cairo text-[12px] font-semibold text-[#667085]">
                          {t("adminAppointments.details.cancelReasonPrefix")}{appointment.cancelReason}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <User className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.panel.patientLabel").replace(":", "")}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085]">
                        <span>{t("adminAppointments.panel.patientLabel")}</span>
                        <span className="text-[#111827]">
                          {formatPatientLabel(appointment.patient)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Stethoscope className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.doctorTitle")}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085]">
                        <span>{t("adminAppointments.panel.doctorLabel")}</span>
                        <span className="text-[#111827]">
                          {appointment.doctor?.userId?.fullName ?? "—"}
                        </span>
                      </div>
                      {appointment.doctor?.specialization ? (
                        <div className="mt-2 flex items-center gap-2 font-cairo text-[12px] font-semibold text-[#667085]">
                          <span>{t("adminAppointments.panel.specializationLabel")}</span>
                          <span className="text-[#111827]">
                            {appointment.doctor.specialization}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Tag className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.appointmentType")}
                        </div>
                      </div>
                      <div className="mt-3 font-cairo text-[13px] font-extrabold text-[#111827]">
                        {appointment.appointmentTypeNameSnapshot ??
                          appointment.appointmentType ??
                          "—"}
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Wallet className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.priceSnapshot")}
                        </div>
                      </div>
                      <div className="mt-3 font-cairo text-[13px] font-extrabold text-[#111827]">
                        {typeof appointment.priceSnapshot === "number"
                          ? appointment.priceSnapshot.toLocaleString(
                              locale === "ar" ? "ar-SA" : "en-US",
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {appointment.notes ? (
                    <div className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <FileText className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminMedicalOrders.field.notes.label")}
                        </div>
                      </div>
                      <div className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#344054]">
                        {appointment.notes}
                      </div>
                    </div>
                  ) : null}

                  {appointment.encounter ? (
                    <div className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <FolderOpen className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.encounterSummary")}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-[10px] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#344054]">
                          <div className="text-[#98A2B3]">{t("adminMedicalOrders.details.id")}</div>
                          <div className="mt-1 break-all font-bold text-[#111827]">
                            {appointment.encounter._id ?? "—"}
                          </div>
                        </div>

                        <div className="rounded-[10px] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#344054]">
                          <div className="text-[#98A2B3]">{t("adminAppointments.details.statusSourceLabel")}</div>
                          <div className="mt-1 font-bold text-[#111827]">
                            {appointment.encounter.status ?? "—"}
                            {appointment.encounter.origin
                              ? ` • ${appointment.encounter.origin}`
                              : ""}
                          </div>
                        </div>

                        <div className="rounded-[10px] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#344054]">
                          <div className="text-[#98A2B3]">{t("adminAppointments.details.startedAt")}</div>
                          <div className="mt-1 font-bold text-[#111827]">
                            {formatDateTime(appointment.encounter.startedAt)}
                          </div>
                        </div>

                        <div className="rounded-[10px] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-semibold text-[#344054]">
                          <div className="text-[#98A2B3]">{t("adminAppointments.details.closedAt")}</div>
                          <div className="mt-1 font-bold text-[#111827]">
                            {formatDateTime(appointment.encounter.closedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {appointmentFiles.length > 0 ? (
                    <div className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Paperclip className="h-4 w-4" />
                        <div className="font-cairo text-[12px] font-extrabold">
                          {t("adminAppointments.details.attachments")}
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        {appointmentFiles.map((file) => (
                          <div
                            key={file.id ?? file._id}
                            className="rounded-[10px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 text-start">
                                <div className="break-all font-cairo text-[12px] font-extrabold text-[#111827]">
                                  {file.originalName ?? file.id ?? file._id}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center justify-end gap-2 font-cairo text-[11px] font-semibold text-[#667085]">
                                  <span dir="ltr">{file.mimeType ?? "—"}</span>
                                  <span>•</span>
                                  <span>{formatBytes(file.sizeBytes)}</span>
                                  <span>•</span>
                                  <span>
                                    {file.isArchived ? t("adminAppointments.details.archived") : t("common.active")}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-[8px] bg-white px-3 py-2 text-start font-cairo text-[11px] font-semibold text-[#475467]">
                                <div className="flex items-center justify-end gap-1 text-[#16A34A]">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span>{file.linkedByRole ?? "—"}</span>
                                </div>
                                <div className="mt-1">
                                  {formatDateTime(file.linkedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="h-[40px] rounded-[10px] bg-primary px-8 font-cairo text-[12px] font-extrabold text-white"
                    >
                      {t("common.close")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
