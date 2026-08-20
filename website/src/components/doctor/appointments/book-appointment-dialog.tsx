"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAvailableAppointmentTypes } from "@/hooks/doctor";
import { useSlots } from "@/hooks";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
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

export default function BookAppointmentDialog({
  open,
  onOpenChange,
  patients,
  onSubmit,
  doctorId,
  submitDisabledReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: { id: string; name: string }[];
  onSubmit: (values: BookAppointmentValues) => Promise<void>;
  doctorId?: string;
  submitDisabledReason?: string | null;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const bookSelectOutletRef = useRef<HTMLDivElement>(null);
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
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting && !next) return;
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{
              opacity: open ? 1 : 0,
              backdropFilter: open ? "blur(6px)" : "blur(0px)",
            }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-[radial-gradient(circle_at_top,#0f8f8b24,transparent_35%),rgba(15,23,42,0.5)]"
          />
        </Dialog.Overlay>

        <div className="pointer-events-none fixed inset-0 z-[10000] box-border grid place-items-center">
          <Dialog.Content
            forceMount
            onEscapeKeyDown={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
            onInteractOutside={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
            className="contents"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 42,
                scale: 0.94,
                rotateX: -6,
              }}
              animate={{
                opacity: open ? 1 : 0,
                y: open ? 0 : 42,
                scale: open ? 1 : 0.94,
                rotateX: open ? 0 : -6,
              }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 28,
                mass: 0.9,
              }}
              className="pointer-events-auto flex w-[720px] max-h-[calc(100vh-56px)] max-w-[calc(100vw-28px)] flex-col overflow-visible rounded-[28px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(2,6,23,0.28)] outline-none"
              dir={dir}
              lang={locale}
              style={{ transformOrigin: "center top" }}
            >
                  <div
                    ref={bookSelectOutletRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[99999] isolate overflow-visible"
                  />

                  <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_62%,#dff8f6_100%)] px-8 pb-7 pt-7 text-white">
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl bg-white/15" />
                    <div className="absolute -bottom-14 right-8 h-28 w-28 rounded-full bg-[#083344]/20 blur-2xl" />

                    <div className="relative max-w-[520px] pr-12 text-right lg:max-w-none lg:pr-0">
                      <Dialog.Title className="font-cairo text-[24px] font-black leading-[30px]">
                        {tr("حجز موعد جديد", "Book new appointment")}
                      </Dialog.Title>
                      <p className="mt-2 font-cairo text-[13px] font-semibold leading-6 text-white/85">
                        {tr(
                          "اختر المريض والتاريخ والوقت المناسب، ثم أكد الحجز ليتم إنشاء الموعد مباشرة في جدول الطبيب.",
                          "Choose the patient, date, and time, then confirm to create the appointment on the doctor's schedule.",
                        )}
                      </p>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="flex absolute top-5 left-5 z-10 justify-center items-center w-10 h-10 text-white rounded-full border transition border-white/20 bg-white/12 hover:bg-white/20 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={tr("إغلاق", "Close")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>

                  </div>

                  <form
                    className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-7 [scrollbar-color:#0f8f8b_#dff6f5] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-[#E6F7F6] [&::-webkit-scrollbar]:w-2"
                    onSubmit={handleSubmit(async (values) => {
                      setSubmitError(null);
                      try {
                        await onSubmit({
                          patientId: values.patientId,
                          date: values.date,
                          time: values.time,
                          appointmentTypeId:
                            values.appointmentTypeId?.trim() || undefined,
                          notes: values.notes?.trim()
                            ? values.notes.trim()
                            : undefined,
                        });
                        onOpenChange(false);
                        resetForm();
                      } catch (error) {
                        setSubmitError(getUserFacingRequestErrorMessage(error));
                      }
                    })}
                  >
                    <div className="space-y-5">
                      {submitError ? (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-right"
                        >
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
                          <div>
                            <div className="font-cairo text-[13px] font-extrabold text-[#991B1B]">
                              {tr("تعذر إتمام الحجز", "Could not complete booking")}
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#B42318]">
                              {submitError}
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      {submitDisabledReason ? (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 rounded-[18px] border border-[#FEDF89] bg-[#FFFAEB] px-4 py-4 text-right"
                        >
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B54708]" />
                          <div>
                            <div className="font-cairo text-[13px] font-extrabold text-[#93370D]">
                              {tr("الحجز غير جاهز بعد", "Booking is not ready yet")}
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#B54708]">
                              {submitDisabledReason}
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      <div>
                        <div className="mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                          {tr("اختر المريض", "Select patient")}
                        </div>
                        <Controller
                          name="patientId"
                          control={control}
                          render={({ field }) => (
                            <StyledSelect
                              listboxPortalRef={bookSelectOutletRef}
                              options={patients.map((p) => ({
                                value: p.id,
                                label: p.name,
                              }))}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder={tr("اختر...", "Select...")}
                              error={Boolean(errors.patientId)}
                              emptyTriggerLabel={tr(
                                "لا يوجد مرضى في القائمة",
                                "No patients in the list",
                              )}
                              emptyState={tr(
                                "لا يوجد مرضى متاحين للاختيار.",
                                "No patients available to select.",
                              )}
                            />
                          )}
                        />
                        {errors.patientId ? (
                          <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                            {errors.patientId.message}
                          </div>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                            {tr("التاريخ", "Date")}
                          </div>
                          <input
                            type="date"
                            {...register("date")}
                            min={today}
                            className={`h-[48px] w-full rounded-[16px] border-[1.82px] ${
                              errors.date
                                ? "border-[#F04438]"
                                : "border-primary/60"
                            } bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none`}
                          />
                          {errors.date ? (
                            <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                              {errors.date.message}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <div className="flex gap-3 justify-between items-center mb-2">
                            <div className="text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                              {tr("الوقت المتاح", "Available time")}
                            </div>
                            {selectedDate ? (
                              <div className="font-cairo text-[11px] font-bold text-[#667085]">
                                {isAwaitingSlots
                                  ? tr("جارٍ تحميل الفترات...", "Loading slots...")
                                  : `${totalFreeSlots} ${tr("فترات متاحة", "available slots")}`}
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
                              <div className="rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#98A2B3]">
                                {tr(
                                  "اختر التاريخ أولاً حتى تظهر لك المواعيد المتاحة فقط.",
                                  "Select a date first to see available appointments only.",
                                )}
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
                              <div className="rounded-[12px] bg-[#F9FAFB] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#667085]">
                                {tr(
                                  "جارٍ تحميل الأوقات المتاحة...",
                                  "Loading available times...",
                                )}
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
                              <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#B42318]">
                                {tr(
                                  "تعذر تحميل الأوقات المتاحة لهذا التاريخ.",
                                  "Could not load available times for this date.",
                                )}
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
                              <div className="rounded-[12px] bg-[#FFF7ED] px-4 py-4 text-right font-cairo text-[12px] font-semibold text-[#C2410C]">
                                {tr(
                                  "لا توجد أوقات متاحة في هذا التاريخ. اختر تاريخاً آخر.",
                                  "No available times on this date. Choose another date.",
                                )}
                              </div>
                            </div>
                          ) : (
                            <Controller
                              name="time"
                              control={control}
                              render={({ field }) => (
                                <StyledSelect
                                  listboxPortalRef={bookSelectOutletRef}
                                  listboxId="book-appointment-time-options"
                                  options={availableTimes.map((t) => ({
                                    value: t,
                                    label: t,
                                  }))}
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  placeholder={tr(
                                    "اختر وقتاً متاحاً...",
                                    "Select an available time...",
                                  )}
                                  error={Boolean(errors.time || !isSelectedTimeAvailable)}
                                  dropdownResetKey={selectedDate}
                                  listboxAriaLabel={tr(
                                    "الأوقات المتاحة",
                                    "Available times",
                                  )}
                                  chevronAriaLabelClose={tr(
                                    "فتح قائمة الأوقات المتاحة",
                                    "Open available times list",
                                  )}
                                  chevronAriaLabelOpen={tr(
                                    "إغلاق قائمة الأوقات المتاحة",
                                    "Close available times list",
                                  )}
                                  renderOptionTrailing={(_, isSelected) =>
                                    isSelected
                                      ? tr("محدد", "Selected")
                                      : tr("متاح", "Available")
                                  }
                                />
                              )}
                            />
                          )}

                          {errors.time ? (
                            <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                              {errors.time.message}
                            </div>
                          ) : !isSelectedTimeAvailable ? (
                            <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                              {tr(
                                "الوقت المحدد لم يعد متاحاً. اختر وقتاً من الأوقات المتاحة.",
                                "Selected time is no longer available. Choose another available time.",
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]">
                              {tr(
                                "تظهر لك فقط الأوقات المتاحة حسب جدول الطبيب.",
                                "Only available times from the doctor's schedule are shown.",
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {appointmentTypes.length > 0 ? (
                        <div>
                          <div className="mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                            {tr("نوع الموعد", "Appointment type")}
                          </div>
                          <Controller
                            name="appointmentTypeId"
                            control={control}
                            render={({ field }) => (
                              <StyledSelect
                                listboxPortalRef={bookSelectOutletRef}
                                options={[
                                  {
                                    value: "",
                                    label: tr(
                                      "بدون تحديد نوع",
                                      "No type selected",
                                    ),
                                  },
                                  ...appointmentTypes.map((type) => ({
                                    value: type._id,
                                    label:
                                      type.name +
                                      (type.priceVisibleToPatient && type.price
                                        ? ` - ${type.price}`
                                        : ""),
                                  })),
                                ]}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={isAwaitingTypes}
                                placeholder={tr(
                                  "بدون تحديد نوع",
                                  "No type selected",
                                )}
                                listboxAriaLabel={tr(
                                  "نوع الموعد",
                                  "Appointment type",
                                )}
                              />
                            )}
                          />
                        </div>
                      ) : null}

                      <div>
                        <div className="mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
                          {tr("ملاحظات", "Notes")}
                        </div>
                        <textarea
                          {...register("notes")}
                          placeholder={tr(
                            "أضف ملاحظات داخلية للطبيب أو السكرتيرة...",
                            "Add internal notes for the doctor or secretary...",
                          )}
                          className={`min-h-[104px] w-full resize-none rounded-[16px] border-[1.82px] ${
                            errors.notes
                              ? "border-[#F04438]"
                              : "border-primary/60"
                          } bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]`}
                        />
                        {errors.notes ? (
                          <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                            {errors.notes.message}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-8 overflow-hidden rounded-[22px] border border-primary/20 bg-[linear-gradient(135deg,#f3fffd_0%,#ffffff_48%,#e7faf7_100%)] p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_22px_55px_rgba(15,143,139,0.1)]"
                    >
                      <div className="rounded-[21px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.65))] px-4 py-5 sm:px-5">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="text-right font-cairo text-[13px] font-black text-[#0f766e]">
                            {tr("ملخص الحجز", "Booking summary")}
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/28 to-primary/10" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                            <div className="flex items-center justify-end gap-2 font-cairo text-[11px] font-bold text-[#667085]">
                              <span>{tr("المريض", "Patient")}</span>
                              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f8f8b18,#14b8a612)]">
                                <UserRound className="h-3.5 w-3.5 text-primary" />
                              </span>
                            </div>
                            <div className="mt-2 truncate font-cairo text-[14px] font-extrabold text-[#111827]">
                              {selectedPatient?.name ??
                                tr("غير محدد", "Not specified")}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                            <div className="flex items-center justify-end gap-2 font-cairo text-[11px] font-bold text-[#667085]">
                              <span>{tr("التاريخ", "Date")}</span>
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
                              <span>{tr("الوقت", "Time")}</span>
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
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4 mt-7">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="h-[50px] w-full rounded-[16px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {tr("إلغاء", "Cancel")}
                        </button>
                      </Dialog.Close>

                      <button
                        type="submit"
                        disabled={isSubmitting || Boolean(submitDisabledReason)}
                        className="h-[50px] w-full rounded-[16px] bg-[linear-gradient(135deg,#0f8f8b_0%,#14b8a6_100%)] font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitDisabledReason
                          ? tr("أكمل المتطلبات أولاً", "Complete prerequisites first")
                          : isSubmitting
                          ? tr("جارٍ إنشاء الموعد...", "Creating appointment...")
                          : tr("تأكيد الحجز", "Confirm booking")}
                      </button>
                    </div>
                  </form>
            </motion.div>
          </Dialog.Content>
        </div>
          </Dialog.Portal>
    </Dialog.Root>
  );
}
