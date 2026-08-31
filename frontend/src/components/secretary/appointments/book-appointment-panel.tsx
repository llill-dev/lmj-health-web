"use client";
import { AlertCircle, CalendarDays, Clock3, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAvailableAppointmentTypes } from "@/hooks/doctor";
import { useSlots } from "@/hooks";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { formatBillingAmount } from "@/lib/doctor/billing/format";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

export type BookAppointmentValues = {
  patientId: string;
  date: string;
  time: string;
  appointmentTypeId?: string;
  notes?: string;
};

const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, "يرجى اختيار المريض."),
  date: z
    .string()
    .min(1, "يرجى اختيار تاريخ الموعد.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة."),
  time: z
    .string()
    .min(1, "يرجى اختيار وقت الموعد.")
    .regex(/^\d{2}:\d{2}$/, "صيغة الوقت غير صحيحة."),
  appointmentTypeId: z.string().optional(),
  notes: z.string().max(500, "الحد الأقصى للملاحظات هو 500 حرف.").optional(),
});

type BookAppointmentFormValues = z.infer<typeof bookAppointmentSchema>;

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPastSlot(selectedDate: string, startTime: string) {
  const slotDateTime = new Date(`${selectedDate}T${startTime}:00`);
  return slotDateTime <= new Date();
}

/**
 * Inline (non-dialog) rendition of the appointment-booking form used by the
 * secretary "book appointment" page. Same fields/validation/submit behavior
 * as the doctor-facing BookAppointmentDialog, laid out as a full-width page
 * section instead of a modal so the fields and summary get more room.
 */
export default function BookAppointmentPanel({
  patients,
  onSubmit,
  onCancel,
  doctorId,
  submitDisabledReason,
}: {
  patients: { id: string; name: string }[];
  onSubmit: (values: BookAppointmentValues) => Promise<void>;
  onCancel: () => void;
  doctorId?: string;
  submitDisabledReason?: string | null;
}) {
  const { t, dir, locale } = useI18n();
  const selectOutletRef = useRef<HTMLDivElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<BookAppointmentFormValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      patientId: "",
      date: "",
      time: "",
      appointmentTypeId: "",
      notes: "",
    },
  });

  const selectedPatientId = watch("patientId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const { appointmentTypes, isAwaitingData: isAwaitingTypes } =
    useAvailableAppointmentTypes(doctorId);
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const {
    freeSlots,
    totalFreeSlots,
    isAwaitingData: isAwaitingSlots,
    error: slotsError,
  } = useSlots(selectedDate, "free", doctorId);
  const availableTimes = useMemo(() => {
    return freeSlots
      .filter((slot) => {
        if (!selectedDate) return false;
        if (selectedDate !== today) return true;
        return !isPastSlot(selectedDate, slot.startTime);
      })
      .map((slot) => slot.startTime);
  }, [freeSlots, selectedDate, today]);
  const isSelectedTimeAvailable =
    !selectedTime || availableTimes.includes(selectedTime);

  useEffect(() => {
    if (!selectedDate) {
      if (selectedTime !== "") {
        setValue("time", "", { shouldValidate: true });
      }
      return;
    }
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setValue("time", "", { shouldValidate: true });
    }
  }, [availableTimes, selectedDate, selectedTime, setValue]);

  const resetForm = () => {
    setSubmitError(null);
    reset({
      patientId: "",
      date: "",
      time: "",
      appointmentTypeId: "",
      notes: "",
    });
  };

  return (
    <div
      dir={dir}
      lang={locale}
      className="relative w-full overflow-visible rounded-[28px] border border-white/60 bg-white shadow-[0_18px_54px_rgba(2,6,23,0.12)]"
    >
      <div
        ref={selectOutletRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[99999] isolate overflow-visible"
      />

      <div className="relative overflow-hidden rounded-t-[28px] bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_62%,#dff8f6_100%)] px-8 pb-7 pt-7 text-white">
        <div className="absolute -top-10 -start-10 w-32 h-32 rounded-full blur-2xl bg-white/15" />
        <div className="absolute -bottom-14 end-8 h-28 w-28 rounded-full bg-[#083344]/20 blur-2xl" />

        <div className="relative max-w-[620px] text-start">
          <h1 className="font-cairo text-[24px] font-black leading-[30px]">
            {t("secretary.appointments.book.title")}
          </h1>
          <p className="mt-2 font-cairo text-[13px] font-semibold leading-6 text-white/85">
            {t("secretary.appointments.book.subtitle")}
          </p>
        </div>
      </div>

      <form
        className="px-6 pb-8 pt-7 sm:px-8"
        onSubmit={handleSubmit(async (values) => {
          setSubmitError(null);
          try {
            await onSubmit({
              patientId: values.patientId,
              date: values.date,
              time: values.time,
              appointmentTypeId: values.appointmentTypeId?.trim() || undefined,
              notes: values.notes?.trim() ? values.notes.trim() : undefined,
            });
            resetForm();
          } catch (error) {
            setSubmitError(getUserFacingRequestErrorMessage(error));
          }
        })}
      >
        <div className="space-y-5">
          {submitError ? (
            <div className="flex items-start gap-3 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-start">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
              <div>
                <div className="font-cairo text-[13px] font-extrabold text-[#991B1B]">
                  {t("secretary.appointments.book.error.title")}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#B42318]">
                  {submitError}
                </div>
              </div>
            </div>
          ) : null}

          {submitDisabledReason ? (
            <div className="flex items-start gap-3 rounded-[18px] border border-[#FEDF89] bg-[#FFFAEB] px-4 py-4 text-start">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B54708]" />
              <div>
                <div className="font-cairo text-[13px] font-extrabold text-[#93370D]">
                  {t("secretary.appointments.book.notReady.title")}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#B54708]">
                  {submitDisabledReason}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="mb-2 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("secretary.appointments.book.selectPatient")}
              </div>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    listboxPortalRef={selectOutletRef}
                    options={patients.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("secretary.appointments.book.select")}
                    error={Boolean(errors.patientId)}
                    emptyTriggerLabel={t(
                      "secretary.appointments.book.noPatients",
                    )}
                    emptyState={t(
                      "secretary.appointments.book.noPatientsAvailable",
                    )}
                  />
                )}
              />
              {errors.patientId ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.patientId.message}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-1">
              <div className="mb-2 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("secretary.appointments.book.date")}
              </div>
              <input
                type="date"
                {...register("date")}
                min={today}
                className={`h-[48px] w-full rounded-[16px] border-[1.82px] ${
                  errors.date ? "border-[#F04438]" : "border-primary/60"
                } bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none`}
              />
              {errors.date ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.date.message}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-1">
              <div className="flex gap-3 justify-between items-center mb-2">
                <div className="text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                  {t("secretary.appointments.book.availableTime")}
                </div>
                {selectedDate ? (
                  <div className="font-cairo text-[11px] font-bold text-[#667085]">
                    {isAwaitingSlots
                      ? t("secretary.appointments.book.loadingSlots")
                      : `${totalFreeSlots} ${t("secretary.appointments.book.availableSlots")}`}
                  </div>
                ) : null}
              </div>

              {!selectedDate ? (
                <div
                  className={`rounded-[16px] border-[1.82px] ${
                    errors.time || !isSelectedTimeAvailable
                      ? "border-[#F04438]"
                      : "border-primary/60"
                  } bg-white p-3`}
                >
                  <div className="rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-start font-cairo text-[12px] font-semibold text-[#98A2B3]">
                    {t("secretary.appointments.book.selectDateFirst")}
                  </div>
                </div>
              ) : isAwaitingSlots ? (
                <div
                  className={`rounded-[16px] border-[1.82px] ${
                    errors.time || !isSelectedTimeAvailable
                      ? "border-[#F04438]"
                      : "border-primary/60"
                  } bg-white p-3`}
                >
                  <div className="rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-start font-cairo text-[12px] font-semibold text-[#667085]">
                    {t("secretary.appointments.book.loadingTimes")}
                  </div>
                </div>
              ) : slotsError ? (
                <div
                  className={`rounded-[16px] border-[1.82px] ${
                    errors.time || !isSelectedTimeAvailable
                      ? "border-[#F04438]"
                      : "border-primary/60"
                  } bg-white p-3`}
                >
                  <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-4 text-start font-cairo text-[12px] font-semibold text-[#B42318]">
                    {t("secretary.appointments.book.loadTimesError")}
                  </div>
                </div>
              ) : availableTimes.length === 0 ? (
                <div
                  className={`rounded-[16px] border-[1.82px] ${
                    errors.time || !isSelectedTimeAvailable
                      ? "border-[#F04438]"
                      : "border-primary/60"
                  } bg-white p-3`}
                >
                  <div className="rounded-[12px] bg-[#FFF7ED] px-4 py-4 text-start font-cairo text-[12px] font-semibold text-[#C2410C]">
                    {t("secretary.appointments.book.noAvailableTimes")}
                  </div>
                </div>
              ) : (
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      listboxPortalRef={selectOutletRef}
                      listboxId="secretary-book-appointment-time-options"
                      options={availableTimes.map((t) => ({
                        value: t,
                        label: t,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={t(
                        "secretary.appointments.book.selectAvailableTime",
                      )}
                      error={Boolean(errors.time || !isSelectedTimeAvailable)}
                      dropdownResetKey={selectedDate}
                      listboxAriaLabel={t(
                        "secretary.appointments.book.availableTimes",
                      )}
                      chevronAriaLabelClose={t(
                        "secretary.appointments.book.openTimesList",
                      )}
                      chevronAriaLabelOpen={t(
                        "secretary.appointments.book.closeTimesList",
                      )}
                      renderOptionTrailing={(_, isSelected) =>
                        isSelected
                          ? t("secretary.appointments.book.selected")
                          : t("secretary.appointments.book.available")
                      }
                    />
                  )}
                />
              )}

              {errors.time ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.time.message}
                </div>
              ) : !isSelectedTimeAvailable ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {t("secretary.appointments.book.timeNotAvailable")}
                </div>
              ) : (
                <div className="mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  {t("secretary.appointments.book.onlyAvailableTimes")}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {appointmentTypes.length > 0 ? (
              <div className="lg:col-span-1">
                <div className="mb-2 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                  {t("secretary.appointments.book.appointmentType")}
                </div>
                <Controller
                  name="appointmentTypeId"
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      listboxPortalRef={selectOutletRef}
                      options={[
                        {
                          value: "",
                          label: t(
                            "secretary.appointments.book.noTypeSelected",
                          ),
                        },
                        ...appointmentTypes.map((type) => ({
                          value: type._id,
                          label:
                            type.name +
                            (type.priceVisibleToPatient && type.price
                              ? ` - ${formatBillingAmount(type.price)}`
                              : ""),
                        })),
                      ]}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isAwaitingTypes}
                      placeholder={t(
                        "secretary.appointments.book.noTypeSelected",
                      )}
                      listboxAriaLabel={t(
                        "secretary.appointments.book.appointmentType",
                      )}
                    />
                  )}
                />
              </div>
            ) : null}

            <div
              className={
                appointmentTypes.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
              }
            >
              <div className="mb-2 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("secretary.appointments.book.notes")}
              </div>
              <textarea
                {...register("notes")}
                placeholder={t("secretary.appointments.book.notesPlaceholder")}
                className={`min-h-[104px] w-full resize-none rounded-[16px] border-[1.82px] ${
                  errors.notes ? "border-[#F04438]" : "border-primary/60"
                } bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]`}
              />
              {errors.notes ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.notes.message}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[22px] border border-primary/20 bg-[linear-gradient(135deg,#f3fffd_0%,#ffffff_48%,#e7faf7_100%)] p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_22px_55px_rgba(15,143,139,0.1)]">
          <div className="rounded-[21px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.65))] px-4 py-5 sm:px-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="text-start font-cairo text-[13px] font-black text-[#0f766e]">
                {t("secretary.appointments.book.bookingSummary")}
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/28 to-primary/10" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-end gap-2 font-cairo text-[11px] font-bold text-[#667085]">
                  <span>{t("secretary.appointments.book.patient")}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f8f8b18,#14b8a612)]">
                    <UserRound className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
                <div className="mt-2 truncate font-cairo text-[14px] font-extrabold text-[#111827]">
                  {selectedPatient?.name ??
                    t("secretary.appointments.book.notSpecified")}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-end gap-2 font-cairo text-[11px] font-bold text-[#667085]">
                  <span>{t("secretary.appointments.book.date")}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f8f8b18,#14b8a612)]">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
                <div className="mt-2 truncate font-cairo text-[13px] font-extrabold tabular-nums text-[#111827]">
                  {selectedDate || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-end gap-2 font-cairo text-[11px] font-bold text-[#667085]">
                  <span>{t("secretary.appointments.book.time")}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f8f8b18,#14b8a612)]">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
                <div className="mt-2 truncate font-cairo text-[13px] font-extrabold tabular-nums text-[#111827]">
                  {selectedTime || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-7">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="h-[50px] w-full rounded-[16px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("secretary.appointments.book.cancel")}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(submitDisabledReason)}
            className="h-[50px] w-full rounded-[16px] bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_100%)] font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitDisabledReason
              ? t("secretary.appointments.book.completePrerequisites")
              : isSubmitting
                ? t("secretary.appointments.book.creatingAppointment")
                : t("secretary.appointments.book.confirmBooking")}
          </button>
        </div>
      </form>
    </div>
  );
}
