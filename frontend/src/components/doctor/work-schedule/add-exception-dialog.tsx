"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, AlertCircle, Clock } from "lucide-react";
import StyledSelect from "@/components/ui/styled-select";
import { useEffect, useMemo, useState } from "react";
import type { ScheduleDayKey } from "@/lib/doctor/types";
import { useI18n } from "@/i18n/provider";

export type ExceptionFormValues = {
  date: string;
  exceptionType: "closed" | "custom_hours";
  slots: Array<{ startTime: string; endTime: string }>;
  note: string;
};

interface AddExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExceptionFormValues) => void;
  enabledDays?: ScheduleDayKey[];
}

type FormErrors = {
  date?: string;
  slots?: { [key: number]: { startTime?: string; endTime?: string } };
  general?: string;
};

export default function AddExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  enabledDays = [],
}: AddExceptionDialogProps) {
  const { t, locale, dir } = useI18n();
  const [date, setDate] = useState("");
  const [exceptionType, setExceptionType] =
    useState<ExceptionFormValues["exceptionType"]>("closed");
  const [note, setNote] = useState("");
  const [slots, setSlots] = useState<
    Array<{ startTime: string; endTime: string }>
  >([{ startTime: "", endTime: "" }]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayLabels = useMemo(
    () =>
      ({
        Sunday: t("doctor.schedule.exception.days.sunday"),
        Monday: t("doctor.schedule.exception.days.monday"),
        Tuesday: t("doctor.schedule.exception.days.tuesday"),
        Wednesday: t("doctor.schedule.exception.days.wednesday"),
        Thursday: t("doctor.schedule.exception.days.thursday"),
        Friday: t("doctor.schedule.exception.days.friday"),
        Saturday: t("doctor.schedule.exception.days.saturday"),
      }) as Record<ScheduleDayKey, string>,
    [t],
  );

  const typeLabel = useMemo(() => {
    return exceptionType === "closed"
      ? t("doctor.schedule.exception.closedDay")
      : t("doctor.schedule.exception.customHours");
  }, [exceptionType, t]);

  // Add new slot
  const handleAddSlot = () => {
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  // Remove slot
  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // Update slot
  const handleSlotChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  // Validate date against enabled days
  const validateDate = (selectedDate: string): boolean => {
    if (!selectedDate) {
      setErrors((prev) => ({
        ...prev,
        date: t("doctor.schedule.exception.validation.dateRequired"),
      }));
      return false;
    }

    if (enabledDays.length === 0) {
      setErrors((prev) => ({ ...prev, date: undefined }));
      return true;
    }

    const date = new Date(selectedDate + "T00:00:00");
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    }) as ScheduleDayKey;

    if (!enabledDays.includes(dayName)) {
      const available = enabledDays
        .map((d) => dayLabels[d])
        .join(locale === "ar" ? "، " : ", ");
      setErrors((prev) => ({
        ...prev,
        date: t("doctor.schedule.exception.validation.dateNotInSchedule", {
          day: dayLabels[dayName],
          availableDays: available,
        }),
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, date: undefined }));
    return true;
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    validateDate(newDate);
  };

  // Validate time slot
  const validateSlot = (
    index: number,
    startTime: string,
    endTime: string,
  ): boolean => {
    const newSlotErrors = { ...errors.slots };

    if (!startTime) {
      if (!newSlotErrors[index]) newSlotErrors[index] = {};
      newSlotErrors[index].startTime = t(
        "doctor.schedule.exception.validation.startTimeRequired",
      );
    } else {
      if (newSlotErrors[index]) delete newSlotErrors[index].startTime;
    }

    if (!endTime) {
      if (!newSlotErrors[index]) newSlotErrors[index] = {};
      newSlotErrors[index].endTime = t(
        "doctor.schedule.exception.validation.endTimeRequired",
      );
    } else {
      if (newSlotErrors[index]) delete newSlotErrors[index].endTime;
    }

    // Validate time range
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        if (!newSlotErrors[index]) newSlotErrors[index] = {};
        newSlotErrors[index].endTime = t(
          "doctor.schedule.exception.validation.endTimeAfterStart",
        );
      } else {
        if (newSlotErrors[index]) delete newSlotErrors[index].endTime;
      }
    }

    // Clean up empty error objects
    if (
      newSlotErrors[index] &&
      Object.keys(newSlotErrors[index]).length === 0
    ) {
      delete newSlotErrors[index];
    }

    setErrors((prev) => ({ ...prev, slots: newSlotErrors }));
    return Object.keys(newSlotErrors).length === 0;
  };

  // Validate all form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {};

    // Validate date
    if (!date) {
      newErrors.date = t("doctor.schedule.exception.validation.dateRequired");
      isValid = false;
    } else if (!validateDate(date)) {
      isValid = false;
    }

    // Validate slots for custom hours
    if (exceptionType === "custom_hours") {
      const slotErrors: {
        [key: number]: { startTime?: string; endTime?: string };
      } = {};

      slots.forEach((slot, index) => {
        if (!slot.startTime) {
          if (!slotErrors[index]) slotErrors[index] = {};
          slotErrors[index].startTime = t(
            "doctor.schedule.exception.validation.startTimeRequired",
          );
          isValid = false;
        }
        if (!slot.endTime) {
          if (!slotErrors[index]) slotErrors[index] = {};
          slotErrors[index].endTime = t(
            "doctor.schedule.exception.validation.endTimeRequired",
          );
          isValid = false;
        }

        if (slot.startTime && slot.endTime) {
          const [startHour, startMin] = slot.startTime.split(":").map(Number);
          const [endHour, endMin] = slot.endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          if (endMinutes <= startMinutes) {
            if (!slotErrors[index]) slotErrors[index] = {};
            slotErrors[index].endTime = t(
              "doctor.schedule.exception.validation.endTimeAfterStart",
            );
            isValid = false;
          }
        }
      });

      if (Object.keys(slotErrors).length > 0) {
        newErrors.slots = slotErrors;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                transition: { duration: 0.22, ease: "easeOut" },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.22, ease: "easeOut" },
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]"
            style={{ touchAction: "none" }}
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                visibility: "visible",
                pointerEvents: "auto",
                transition: { duration: 0.18, ease: "easeOut" },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.18, ease: "easeOut" },
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
              },
            }}
            className="fixed start-1/2 top-1/2 z-[10000] w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none"
            dir={dir}
            lang={locale}
          >
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
                  transition: { duration: 0.22, ease: "easeOut" },
                },
              }}
              style={{ transformOrigin: "center" }}
            >
              <div className="relative px-8 pt-7">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="absolute start-6 top-6 flex h-9 w-9 items-center justify-center rounded-f6l text-[#667085] hover:bg-[#F2F4F7]"
                    aria-label={t("doctor.schedule.exception.close")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>

                <Dialog.Title className="text-center font-cairo text-[20px] font-extrabold leading-[26px] text-[#111827]">
                  {t("doctor.schedule.exception.title")}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-center font-cairo text-[12px] font-semibold leading-[18px] text-[#98A2B3]">
                  {t("doctor.schedule.exception.subtitle")}
                </Dialog.Description>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!validateForm()) {
                      return;
                    }

                    setIsSubmitting(true);
                    setErrors((prev) => ({ ...prev, general: undefined }));

                    try {
                      const finalSlots =
                        exceptionType === "closed"
                          ? []
                          : slots.filter((s) => s.startTime && s.endTime);

                      await onSubmit({
                        date,
                        exceptionType,
                        slots: finalSlots,
                        note: note.trim() || typeLabel,
                      });

                      // Reset form on success
                      onOpenChange(false);
                      setDate("");
                      setExceptionType("closed");
                      setNote("");
                      setSlots([{ startTime: "", endTime: "" }]);
                      setErrors({});
                    } catch (error: any) {
                      // Handle backend errors
                      setErrors((prev) => ({
                        ...prev,
                        general:
                          error?.message ||
                          t("doctor.schedule.exception.generalError"),
                      }));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div>
                    <div className="mb-2 text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                      {t("doctor.schedule.exception.date")}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={`h-[44px] w-full rounded-[6px] border-[1.82px] ${
                        errors.date ? "border-[#F04438]" : "border-primary"
                      } bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none transition-colors`}
                    />
                    {errors.date && (
                      <div className="mt-2 flex items-start gap-2 rounded-[6px] bg-[#FEF3F2] border border-[#FEE4E2] p-3">
                        <AlertCircle className="h-4 w-4 text-[#F04438] mt-0.5 shrink-0" />
                        <p className="font-cairo text-[12px] font-semibold text-[#D92D20] text-start leading-relaxed">
                          {errors.date}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                      {t("doctor.schedule.exception.exceptionType")}
                    </div>
                    <StyledSelect
                      value={exceptionType}
                      onChange={(v) => {
                        const newType =
                          v as ExceptionFormValues["exceptionType"];
                        setExceptionType(newType);
                        if (newType === "closed") {
                          setSlots([]);
                        } else if (slots.length === 0) {
                          setSlots([{ startTime: "", endTime: "" }]);
                        }
                      }}
                      options={[
                        {
                          value: "closed",
                          label: t(
                            "doctor.schedule.exception.closedDayDescription",
                          ),
                        },
                        {
                          value: "custom_hours",
                          label: t(
                            "doctor.schedule.exception.customHoursDescription",
                          ),
                        },
                      ]}
                      listboxAriaLabel={t(
                        "doctor.schedule.exception.exceptionType",
                      )}
                    />
                    <p className="mt-2 text-start font-cairo text-[11px] font-semibold text-[#667085]">
                      {exceptionType === "closed"
                        ? t("doctor.schedule.exception.closedDayInfo")
                        : t("doctor.schedule.exception.customHoursInfo")}
                    </p>
                  </div>

                  {exceptionType === "custom_hours" && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                          {t("doctor.schedule.exception.timeSlots")}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSlot}
                          className="rounded-[6px] bg-primary/10 px-3 py-1 font-cairo text-[11px] font-extrabold text-primary hover:bg-primary/20"
                        >
                          + {t("doctor.schedule.exception.addSlot")}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {slots.map((slot, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-start gap-2">
                              {/* Start Time */}
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => {
                                      handleSlotChange(
                                        index,
                                        "startTime",
                                        e.target.value,
                                      );
                                      if (slot.endTime) {
                                        validateSlot(
                                          index,
                                          e.target.value,
                                          slot.endTime,
                                        );
                                      }
                                    }}
                                    onBlur={() => {
                                      if (slot.endTime) {
                                        validateSlot(
                                          index,
                                          slot.startTime,
                                          slot.endTime,
                                        );
                                      }
                                    }}
                                    className={`h-[40px] w-full rounded-[6px] border-[1.82px] ${
                                      errors.slots?.[index]?.startTime
                                        ? "border-[#F04438]"
                                        : "border-primary"
                                    } bg-white ps-3 pe-10 font-cairo text-[13px] font-bold text-[#111827] outline-none transition-colors`}
                                  />
                                  <Clock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] pointer-events-none" />
                                </div>
                                {errors.slots?.[index]?.startTime && (
                                  <p className="mt-1 font-cairo text-[11px] font-semibold text-[#F04438] text-start">
                                    {errors.slots[index].startTime}
                                  </p>
                                )}
                              </div>

                              <span className="font-cairo text-[12px] font-semibold text-[#667085] mt-2">
                                {t("doctor.schedule.exception.to")}
                              </span>

                              {/* End Time */}
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => {
                                      handleSlotChange(
                                        index,
                                        "endTime",
                                        e.target.value,
                                      );
                                      if (slot.startTime) {
                                        validateSlot(
                                          index,
                                          slot.startTime,
                                          e.target.value,
                                        );
                                      }
                                    }}
                                    onBlur={() => {
                                      if (slot.startTime) {
                                        validateSlot(
                                          index,
                                          slot.startTime,
                                          slot.endTime,
                                        );
                                      }
                                    }}
                                    className={`h-[40px] w-full rounded-[6px] border-[1.82px] ${
                                      errors.slots?.[index]?.endTime
                                        ? "border-[#F04438]"
                                        : "border-primary"
                                    } bg-white ps-3 pe-10 font-cairo text-[13px] font-bold text-[#111827] outline-none transition-colors`}
                                  />
                                  <Clock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] pointer-events-none" />
                                </div>
                                {errors.slots?.[index]?.endTime && (
                                  <p className="mt-1 font-cairo text-[11px] font-semibold text-[#F04438] text-start">
                                    {errors.slots[index].endTime}
                                  </p>
                                )}
                              </div>

                              {/* Remove Button */}
                              {slots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(index)}
                                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-[#FEF3F2] text-[#F04438] hover:bg-[#F04438] hover:text-white transition-colors flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                      {t("doctor.schedule.exception.noteOptional")}
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t(
                        "doctor.schedule.exception.notePlaceholderExample",
                      )}
                      className="min-h-[88px] w-full resize-none rounded-[6px] border-[1.82px] border-primary bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]"
                    />
                  </div>

                  {/* General Error Message */}
                  {errors.general && (
                    <div className="flex items-start gap-2 rounded-[6px] bg-[#FEF3F2] border border-[#FEE4E2] p-3">
                      <AlertCircle className="h-4 w-4 text-[#F04438] mt-0.5 shrink-0" />
                      <p className="font-cairo text-[12px] font-semibold text-[#D92D20] text-start leading-relaxed">
                        {errors.general}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pb-7 pt-2">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="h-[40px] rounded-[6px] border border-[#E5E7EB] bg-white px-6 font-cairo text-[13px] font-extrabold text-[#344054] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("doctor.schedule.exception.cancel")}
                      </button>
                    </Dialog.Close>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-[40px] rounded-[6px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("doctor.schedule.exception.adding")}
                        </>
                      ) : (
                        t("doctor.schedule.exception.add")
                      )}
                    </button>
                  </div>

                  <div className="hidden">{typeLabel}</div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
