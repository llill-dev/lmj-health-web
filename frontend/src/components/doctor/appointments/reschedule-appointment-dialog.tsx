"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import StyledSelect from "@/components/ui/styled-select";
import { useAvailableAppointmentTypes, useSlots } from "@/hooks/doctor";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useI18n } from "@/i18n/provider";

const rescheduleSchema = z.object({
  date: z
    .string()
    .min(1, "doctor.appointments.reschedule.validation.dateRequired")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "doctor.appointments.reschedule.validation.invalidDateFormat",
    ),
  startTime: z
    .string()
    .min(1, "doctor.appointments.reschedule.validation.timeRequired")
    .regex(
      /^\d{2}:\d{2}$/,
      "doctor.appointments.reschedule.validation.invalidTimeFormat",
    ),
  appointmentTypeId: z.string().optional(),
  reason: z
    .string()
    .max(300, "doctor.appointments.reschedule.validation.reasonTooLong")
    .optional(),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

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

export default function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  patientName,
  initialDate,
  initialTime,
  initialAppointmentTypeId,
  doctorId,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  initialDate?: string;
  initialTime?: string;
  initialAppointmentTypeId?: string;
  doctorId?: string;
  onConfirm: (values: {
    date: string;
    startTime: string;
    appointmentTypeId?: string;
    reason?: string;
  }) => void | boolean | Promise<void | boolean>;
  confirmDisabled?: boolean;
}) {
  const { t, locale, dir } = useI18n();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: initialDate ?? "",
      startTime: initialTime ?? "",
      appointmentTypeId: initialAppointmentTypeId ?? "",
      reason: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("startTime");
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const rescheduleSelectOutletRef = useRef<HTMLDivElement>(null);

  const { appointmentTypes, isAwaitingData: isAwaitingTypes } =
    useAvailableAppointmentTypes(doctorId);
  const {
    freeSlots,
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

  useEffect(() => {
    if (!open) return;
    reset({
      date: initialDate ?? "",
      startTime: initialTime ?? "",
      appointmentTypeId: initialAppointmentTypeId ?? "",
      reason: "",
    });
  }, [initialAppointmentTypeId, initialDate, initialTime, open, reset]);

  useEffect(() => {
    if (!selectedDate) {
      if (selectedTime !== "") {
        setValue("startTime", "", { shouldValidate: false });
      }
      return;
    }
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setValue("startTime", "", { shouldValidate: false });
    }
  }, [availableTimes, selectedDate, selectedTime, setValue]);

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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting && !next) return;
        onOpenChange(next);
        if (!next) {
          reset({
            date: initialDate ?? "",
            startTime: initialTime ?? "",
            appointmentTypeId: initialAppointmentTypeId ?? "",
            reason: "",
          });
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
              },
              closed: {
                opacity: 0,
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]"
          />
        </Dialog.Overlay>

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
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
              },
              closed: {
                opacity: 0,
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed left-1/2 top-1/2 z-[10000] w-[680px] max-h-[calc(100dvh-24px)] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none"
            dir={dir}
            lang={locale}
          >
            <div
              ref={rescheduleSelectOutletRef}
              className="pointer-events-none absolute inset-0 z-[99999] isolate overflow-visible"
            />
            <motion.div
              initial={false}
              animate={open ? "open" : "closed"}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 520, damping: 38 },
                },
                closed: {
                  opacity: 0,
                  y: 24,
                  scale: 0.96,
                },
              }}
            >
              <div className="relative max-h-[calc(100dvh-24px)] overflow-y-auto px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="absolute start-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-60 sm:start-5 sm:top-5 lg:start-6 lg:top-6"
                    aria-label={t("doctor.appointments.reschedule.close")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>

                <Dialog.Title className="text-start font-cairo text-[24px] font-extrabold leading-[30px] text-[#101828]">
                  {t("doctor.appointments.reschedule.title")}
                </Dialog.Title>

                <div className="mt-6 text-start font-cairo text-[16px] font-extrabold text-[#101828] sm:mt-8">
                  {patientName}
                </div>

                <form
                  className="mt-6 space-y-5 pb-5 sm:mt-8 sm:pb-6 lg:pb-7"
                  onSubmit={handleSubmit(async (values) => {
                    const result = await onConfirm({
                      date: values.date,
                      startTime: values.startTime,
                      appointmentTypeId:
                        values.appointmentTypeId?.trim() || undefined,
                      reason: values.reason?.trim() || undefined,
                    });
                    if (result !== false) {
                      onOpenChange(false);
                    }
                  })}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-start font-cairo text-[14px] font-extrabold text-[#101828]">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {t("doctor.appointments.reschedule.newDate")}
                      </label>
                      <input
                        type="date"
                        {...register("date")}
                        min={today}
                        className="h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none"
                      />
                      {errors.date ? (
                        <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                          {errors.date.message}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-start font-cairo text-[14px] font-extrabold text-[#101828]">
                        <Clock3 className="h-4 w-4 text-primary" />
                        {t("doctor.appointments.reschedule.availableTime")}
                      </label>
                      <Controller
                        name="startTime"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            disabled={!selectedDate || isAwaitingSlots}
                            placeholder={
                              !selectedDate
                                ? t(
                                    "doctor.appointments.reschedule.selectDateFirst",
                                  )
                                : isAwaitingSlots
                                  ? t(
                                      "doctor.appointments.reschedule.loadingTimes",
                                    )
                                  : availableTimes.length === 0
                                    ? t(
                                        "doctor.appointments.reschedule.noTimesAvailable",
                                      )
                                    : t(
                                        "doctor.appointments.reschedule.selectAvailableTime",
                                      )
                            }
                            options={availableTimes.map((time) => ({
                              value: time,
                              label: time,
                            }))}
                            listboxAriaLabel={t(
                              "doctor.appointments.reschedule.availableTimes",
                            )}
                            error={Boolean(errors.startTime)}
                            listboxPortalRef={rescheduleSelectOutletRef}
                          />
                        )}
                      />
                      {errors.startTime ? (
                        <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                          {errors.startTime.message}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-start font-cairo text-[14px] font-extrabold text-[#101828]">
                      <Tag className="h-4 w-4 text-primary" />
                      {t("doctor.appointments.reschedule.appointmentType")}
                    </label>
                    <Controller
                      name="appointmentTypeId"
                      control={control}
                      render={({ field }) => (
                        <StyledSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          disabled={isAwaitingTypes}
                          placeholder={t(
                            "doctor.appointments.reschedule.keepCurrentTypeOrChoose",
                          )}
                          options={[
                            {
                              value: "",
                              label: t(
                                "doctor.appointments.reschedule.keepCurrentType",
                              ),
                            },
                            ...appointmentTypes.map((type) => ({
                              value: type._id,
                              label:
                                typeof type.price === "number"
                                  ? `${type.name} - ${type.price}`
                                  : type.name,
                            })),
                          ]}
                          listboxAriaLabel={t(
                            "doctor.appointments.reschedule.appointmentType",
                          )}
                          listboxPortalRef={rescheduleSelectOutletRef}
                        />
                      )}
                    />
                  </div>

                  {slotsError ? (
                    <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-start">
                      <div className="flex items-start gap-2 font-cairo text-[12px] font-bold text-[#B42318]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {getUserFacingRequestErrorMessage(slotsError)}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {selectedDate && isAwaitingSlots ? (
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-start font-cairo text-[12px] font-bold text-[#667085]">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        {t("doctor.appointments.reschedule.loadingTimesForDay")}
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-start font-cairo text-[14px] font-extrabold text-[#101828]">
                      {t("doctor.appointments.reschedule.rescheduleReason")}
                    </label>
                    <textarea
                      {...register("reason")}
                      placeholder={t("doctor.appointments.reschedule.optional")}
                      className="min-h-[110px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]"
                    />
                    {errors.reason ? (
                      <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                        {errors.reason.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="h-[46px] w-full rounded-[10px] border border-[#D0D5DD] bg-white font-cairo text-[14px] font-extrabold text-[#344054] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("doctor.appointments.reschedule.cancel")}
                      </button>
                    </Dialog.Close>

                    <button
                      type="submit"
                      disabled={
                        confirmDisabled ||
                        isSubmitting ||
                        !selectedDate ||
                        availableTimes.length === 0
                      }
                      className="h-[46px] w-full rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.25)] disabled:opacity-60"
                    >
                      {t("doctor.appointments.reschedule.saveNewAppointment")}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
