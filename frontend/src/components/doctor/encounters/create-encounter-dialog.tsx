import * as Dialog from "@radix-ui/react-dialog";
import {
  ClipboardPlus,
  FileText,
  Loader2,
  MessageSquareText,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import type {
  DoctorEncounterOrigin,
  DoctorPatientListItem,
} from "@/lib/doctor/types";
import {
  CreateEncounterSubmitError,
  isValidAppointmentObjectId,
} from "@/lib/doctor/encounters/createEncounterFormErrors";
import { cn } from "@/lib/utils/utils";

type CreateEncounterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: DoctorPatientListItem[];
  defaultPatientId?: string;
  submitting?: boolean;
  onSubmit: (payload: {
    patientId: string;
    origin: DoctorEncounterOrigin;
    notes: string;
    appointmentId: string;
  }) => Promise<void> | void;
};

type EncounterFormValues = {
  patientId: string;
  origin: DoctorEncounterOrigin | "";
  appointmentId: string;
  notes: string;
};

type EncounterFormErrors = Partial<Record<keyof EncounterFormValues, string>>;

const ORIGIN_OPTIONS: Array<{
  value: DoctorEncounterOrigin;
  label: string;
}> = [
  { value: "manual", label: "زيارة يدوية" },
  { value: "appointment", label: "مرتبطة بموعد" },
  { value: "walk_in", label: "زيارة مباشرة" },
  { value: "follow_up", label: "متابعة" },
];

const INITIAL_VALUES: EncounterFormValues = {
  patientId: "",
  origin: "manual",
  appointmentId: "",
  notes: "",
};

function validateField(
  name: keyof EncounterFormValues,
  values: EncounterFormValues,
): string {
  switch (name) {
    case "patientId":
      return values.patientId ? "" : "يرجى اختيار المريض قبل إنشاء الزيارة.";
    case "origin":
      return values.origin ? "" : "يرجى اختيار نوع الزيارة.";
    case "appointmentId": {
      const trimmed = values.appointmentId.trim();
      if (values.origin === "appointment" && !trimmed) {
        return "رقم الموعد مطلوب عند اختيار زيارة مرتبطة بموعد.";
      }
      if (trimmed && !isValidAppointmentObjectId(trimmed)) {
        return "رقم الموعد غير صالح. أدخل معرّف الموعد كاملاً (24 حرفاً hex) من نظام المواعيد.";
      }
      return "";
    }
    case "notes": {
      const trimmed = values.notes.trim();
      if (!trimmed) {
        return "يرجى كتابة ملاحظات افتتاحية مختصرة عن سبب الزيارة.";
      }
      if (trimmed.length < 10) {
        return "الملاحظات يجب أن تكون أوضح قليلًا، 10 أحرف على الأقل.";
      }
      if (trimmed.length > 500) {
        return "الملاحظات طويلة جدًا. الحد الأقصى 500 حرف.";
      }
      return "";
    }
    default:
      return "";
  }
}

function validateForm(values: EncounterFormValues): EncounterFormErrors {
  return {
    patientId: validateField("patientId", values) || undefined,
    origin: validateField("origin", values) || undefined,
    appointmentId: validateField("appointmentId", values) || undefined,
    notes: validateField("notes", values) || undefined,
  };
}

function hasErrors(errors: EncounterFormErrors) {
  return Object.values(errors).some(Boolean);
}

export function CreateEncounterDialog({
  open,
  onOpenChange,
  patients,
  defaultPatientId,
  submitting = false,
  onSubmit,
}: CreateEncounterDialogProps) {
  const { toast } = useToast();
  const selectListboxOutletRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<EncounterFormValues>(INITIAL_VALUES);

  const [values, setValues] = useState<EncounterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<EncounterFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof EncounterFormValues, boolean>>
  >({});

  const sortedPatients = useMemo(
    () =>
      [...patients].sort((a, b) =>
        (a.user?.fullName ?? "").localeCompare(b.user?.fullName ?? "", "ar"),
      ),
    [patients],
  );

  const patientOptions = useMemo(
    () =>
      sortedPatients.map((patient) => ({
        value: patient._id,
        label: (
          <div className="flex gap-3 items-center w-full">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-primary/10 text-primary">
              <UserRound className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                {patient.user?.fullName ?? "مريض"}
              </div>
              <div className="mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]">
                {patient.publicId
                  ? `رقم الملف: ${patient.publicId}`
                  : "بدون رقم ملف ظاهر"}
              </div>
            </div>
          </div>
        ),
      })),
    [sortedPatients],
  );

  useEffect(() => {
    if (!open) {
      setValues(INITIAL_VALUES);
      valuesRef.current = INITIAL_VALUES;
      setErrors({});
      setTouched({});
      return;
    }

    const prefillPatientId =
      defaultPatientId &&
      patients.some((patient) => patient._id === defaultPatientId)
        ? defaultPatientId
        : "";

    const next = {
      ...INITIAL_VALUES,
      patientId: prefillPatientId,
    };
    setValues(next);
    valuesRef.current = next;
    setErrors({});
    setTouched({});
  }, [open, defaultPatientId, patients]);

  const setFieldValue = <K extends keyof EncounterFormValues>(
    field: K,
    value: EncounterFormValues[K],
  ) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "origin" && value !== "appointment") {
        next.appointmentId = "";
      }

      valuesRef.current = next;

      setErrors((prevErrors) => {
        const updated: EncounterFormErrors = { ...prevErrors };
        updated[field] = validateField(field, next) || undefined;
        if (field === "origin") {
          updated.appointmentId =
            validateField("appointmentId", next) || undefined;
        }
        return updated;
      });

      return next;
    });
  };

  const markTouched = (field: keyof EncounterFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        validateField(field, valuesRef.current) || undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setTouched({
      patientId: true,
      origin: true,
      appointmentId: true,
      notes: true,
    });
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      toast("يرجى مراجعة الحقول المعلّمة بالأحمر قبل إنشاء الزيارة.", {
        title: "بيانات ناقصة أو غير صحيحة",
        variant: "warning",
      });
      return;
    }

    try {
      await onSubmit({
        patientId: values.patientId,
        origin: values.origin as DoctorEncounterOrigin,
        appointmentId: values.appointmentId.trim(),
        notes: values.notes.trim(),
      });
    } catch (error) {
      if (error instanceof CreateEncounterSubmitError) {
        setTouched({
          patientId: true,
          origin: true,
          appointmentId: true,
          notes: true,
        });
        setErrors((prev) => ({
          ...prev,
          ...error.fields,
        }));
        toast(error.message, {
          title: "تعذّر إنشاء الزيارة",
          variant: "error",
          durationMs: 5200,
        });
        return;
      }
      throw error;
    }
  };

  const fieldShell = (hasError: boolean) =>
    cn(
      "rounded-[18px] border bg-white px-2 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition",
      hasError
        ? "border-[#F04438] ring-2 ring-[#FECDCA]/70"
        : "border-[#E4E7EC] hover:border-primary/35 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(15,143,139,0.11)]",
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-[#101828]/55 backdrop-blur-[2px]" />
        <Dialog.Content
          dir="rtl"
          lang="ar"
          className="fixed left-1/2 top-1/2 z-[121] flex w-[min(760px,calc(100vw-24px))] max-h-[calc(100vh-28px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[26px] border border-[#D0D5DD] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        >
          <div
            ref={selectListboxOutletRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[99999] isolate overflow-visible"
          />
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#EAECF0] bg-[linear-gradient(180deg,#F8FFFE_0%,#FFFFFF_100%)] px-6 py-5">
            <div className="text-right">
              <Dialog.Title className="mt-3 font-cairo text-[24px] font-black text-[#101828]">
                إنشاء زيارة طبية
              </Dialog.Title>
              <Dialog.Description className="mt-1 font-cairo text-[13px] font-semibold leading-6 text-[#667085]">
                جهّز الزيارة بدقة من أول خطوة: اختر المريض، حدّد نوع الزيارة،
                وأضف ملاحظات افتتاحية واضحة قبل البدء.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] text-[#667085] transition hover:bg-[#F9FAFB]"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form
            className="flex overflow-hidden flex-col flex-1 min-h-0"
            onSubmit={handleSubmit}
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 [scrollbar-color:#0f8f8b_#dff6f5] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-[#E6F7F6] [&::-webkit-scrollbar]:w-2">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]">
                    المريض
                  </label>
                  <div className={fieldShell(Boolean(errors.patientId))}>
                    <StyledSelect
                      options={patientOptions}
                      value={values.patientId}
                      onChange={(next) => setFieldValue("patientId", next)}
                      onBlur={() => markTouched("patientId")}
                      placeholder="اختر المريض الذي ستبدأ له الزيارة"
                      error={Boolean(errors.patientId)}
                      emptyTriggerLabel="لا يوجد مرضى متاحون"
                      emptyState="لا يوجد مرضى متاحون حاليًا لإنشاء زيارة جديدة."
                      listboxAriaLabel="اختيار المريض"
                      triggerClassName="rounded-[14px]"
                      dropdownMaxHeight={240}
                      listboxPortalRef={selectListboxOutletRef}
                    />
                  </div>
                  {errors.patientId ? (
                    <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                      {errors.patientId}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]">
                    نوع الزيارة
                  </label>
                  <div className={fieldShell(Boolean(errors.origin))}>
                    <StyledSelect
                      options={ORIGIN_OPTIONS}
                      value={values.origin}
                      onChange={(next) =>
                        setFieldValue("origin", next as DoctorEncounterOrigin)
                      }
                      onBlur={() => markTouched("origin")}
                      placeholder="اختر نوع الزيارة"
                      error={Boolean(errors.origin)}
                      listboxAriaLabel="اختيار نوع الزيارة"
                      triggerClassName="rounded-[14px]"
                      dropdownMaxHeight={240}
                      listboxPortalRef={selectListboxOutletRef}
                    />
                  </div>
                  {errors.origin ? (
                    <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                      {errors.origin}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]">
                  رقم الموعد المرتبط
                </label>
                <div className={fieldShell(Boolean(errors.appointmentId))}>
                  <div className="flex gap-3 items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-primary/10 text-primary">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={values.appointmentId}
                      onChange={(event) =>
                        setFieldValue("appointmentId", event.target.value)
                      }
                      onBlur={() => markTouched("appointmentId")}
                      placeholder={
                        values.origin === "appointment"
                          ? "أدخل معرّف الموعد (24 حرفاً) من نظام المواعيد"
                          : "اختياري — اتركه فارغاً إن لم تربط بموعد"
                      }
                      className="h-12 w-full border-0 bg-transparent px-0 text-right font-cairo text-[14px] font-bold text-[#101828] outline-none placeholder:font-semibold placeholder:text-[#98A2B3]"
                      aria-invalid={Boolean(errors.appointmentId)}
                    />
                  </div>
                </div>
                {errors.appointmentId ? (
                  <div className="mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                    {errors.appointmentId}
                  </div>
                ) : (
                  <div className="mt-2 text-right font-cairo text-[11px] font-semibold text-[#667085]">
                    {values.origin === "appointment"
                      ? "عند اختيار «مرتبطة بموعد» يصبح معرّف الموعد مطلوباً."
                      : "إذا أدخلت معرّف موعد، يجب أن يكون صالحاً بالكامل."}
                  </div>
                )}
              </div>
              <div className="rounded-[20px] border border-[#D9F1EF] bg-[linear-gradient(180deg,#F7FFFE_0%,#FFFFFF_100%)] px-4 py-4 text-right">
                <div className="flex gap-3 items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.22)]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                      تهيئة احترافية للزيارة
                    </div>
                    <div className="mt-1 font-cairo text-[11px] font-semibold leading-6 text-[#667085]">
                      الملاحظات الأولية ستظهر ضمن تفاصيل الزيارة، لذلك اكتب سبب
                      الزيارة أو الهدف الطبي بشكل مختصر وواضح.
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]">
                  ملاحظات افتتاحية
                </label>
                <div className={fieldShell(Boolean(errors.notes))}>
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-primary/10 text-primary">
                      <MessageSquareText className="w-4 h-4" />
                    </div>
                    <textarea
                      value={values.notes}
                      onChange={(event) =>
                        setFieldValue("notes", event.target.value)
                      }
                      onBlur={() => markTouched("notes")}
                      placeholder="اكتب ملخصًا افتتاحيًا يوضح سبب الزيارة، الشكوى الأساسية، أو الهدف من المتابعة."
                      rows={5}
                      className="min-h-[132px] w-full resize-none border-0 bg-transparent px-0 py-1 text-right font-cairo text-[14px] font-bold text-[#101828] outline-none placeholder:font-semibold placeholder:text-[#98A2B3]"
                      aria-invalid={Boolean(errors.notes)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-between items-center mt-2">
                  {errors.notes ? (
                    <div className="text-right font-cairo text-[12px] font-bold text-[#D92D20]">
                      {errors.notes}
                    </div>
                  ) : (
                    <div className="text-right font-cairo text-[11px] font-semibold text-[#667085]">
                      يفضّل أن تكون الملاحظات مباشرة وواضحة منذ بداية الزيارة.
                    </div>
                  )}
                  <div className="shrink-0 font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    {values.notes.trim().length}/500
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#EAECF0] bg-white px-6 py-5 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#D0D5DD] px-5 font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB]"
                >
                  إلغاء
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary px-5 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_30px_rgba(15,143,139,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ClipboardPlus className="w-4 h-4" />
                )}
                إنشاء الزيارة
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
