"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Phone, UserRound } from "lucide-react";
import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import {
  SIGNUP_PHONE_DIAL_OPTIONS,
  normalizePhoneLocalDigits,
  validatePhoneByDialCode,
} from "@/components/auth/signUp/signup-schemas";
import { cn } from "@/lib/utils/utils";
import { resolveCreateTemporaryPatientServerFeedback } from "@/lib/doctor/patients/temporaryPatientFormErrors";
import { useI18n } from "@/i18n/provider";

const TEMP_PATIENT_PHONE_DIAL_CODES = SIGNUP_PHONE_DIAL_OPTIONS.map(
  (option) => option.value,
) as [string, ...string[]];

const tempPatientSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "الاسم مطلوب")
      .max(200, "الاسم طويل جداً"),
    email: z
      .string()
      .trim()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("البريد الإلكتروني غير صالح"),
    phoneDialCode: z.enum(TEMP_PATIENT_PHONE_DIAL_CODES, {
      message: "اختر رمز دولة صحيحاً",
    }),
    phoneLocal: z
      .string()
      .trim()
      .min(1, "رقم الهاتف مطلوب")
      .regex(/^\d+$/, "أدخل أرقاماً فقط بدون مسافات أو رمز الدولة"),
  })
  .superRefine((data, ctx) => {
    const local = normalizePhoneLocalDigits(data.phoneLocal);

    if (!local.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "أدخل الرقم المحلي بدون الصفر الأول",
        path: ["phoneLocal"],
      });
      return;
    }

    const phoneError = validatePhoneByDialCode(
      data.phoneDialCode as Parameters<typeof validatePhoneByDialCode>[0],
      data.phoneLocal,
    );
    if (phoneError && phoneError !== "أدخل رقم الهاتف بدون رمز الدولة") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: phoneError,
        path: ["phoneLocal"],
      });
    }
  })
  .transform((data) => {
    const local = normalizePhoneLocalDigits(data.phoneLocal);
    return {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: `${data.phoneDialCode}${local}`,
    };
  });

type FormValues = z.input<typeof tempPatientSchema>;
type Values = z.output<typeof tempPatientSchema>;

const inputBaseClass =
  "h-[50px] w-full rounded-[14px] border bg-white px-4 ps-8 font-cairo text-[13px] font-bold text-[#101828] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3]";
const inputNormalBorder =
  "border-[#E4E7EC] hover:border-primary/35 focus-visible:border-primary focus-visible:bg-[#FAFFFE] focus-visible:shadow-[0_0_0_4px_rgba(15,143,139,0.11),inset_0_1px_2px_rgba(0,0,0,0.03)]";
const inputInvalidBorder =
  "border-[#F04438] bg-[#FFFBFB] shadow-[inset_0_1px_2px_rgba(240,68,56,0.06)] ring-2 ring-[#FECDCA]/70 focus-visible:border-[#F04438] focus-visible:shadow-[0_0_0_4px_rgba(240,68,56,0.12)]";
const fieldCardClass =
  "rounded-[18px] border border-[#E8ECF3] bg-white/95 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]";

/**
 * Inline (non-dialog) rendition of the temporary-patient form used by the
 * secretary "create temporary patient" page. Same fields/validation/submit
 * behavior as the doctor-facing CreateTemporaryPatientDialog, laid out as a
 * full-width page section instead of a modal so it gets more room to breathe.
 */
export default function CreateTemporaryPatientPanel({
  onSubmit,
  onCancel,
  busy,
}: {
  onSubmit: (values: Values) => void | Promise<void>;
  onCancel: () => void;
  busy?: boolean;
}) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const listboxOutletRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, undefined, Values>({
    resolver: zodResolver(tempPatientSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneDialCode: "+963",
      phoneLocal: "",
    },
  });

  return (
    <div
      dir={dir}
      lang={locale}
      className="relative w-full overflow-visible rounded-[22px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFFFE] via-white to-[#F8FAFC] shadow-[0_18px_48px_-16px_rgba(15,23,42,0.16),0_0_1px_rgba(15,143,139,0.08)]"
    >
      <div
        ref={listboxOutletRef}
        className="pointer-events-none absolute inset-0 z-[120] isolate overflow-visible"
        style={{ contain: "layout" }}
      />

      <div
        aria-hidden
        className="h-[4px] w-full rounded-t-[22px] bg-gradient-to-l from-[#0F766E] via-primary to-[#5EEAD4]"
      />

      <div className="relative border-b border-[#EEF2F6] px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex gap-3 text-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-[0_10px_24px_rgba(15,143,139,0.12)]">
            <UserRound
              className="w-7 h-7 text-primary"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-cairo text-[clamp(1.15rem,2.4vw,1.5rem)] font-black tracking-tight text-[#101828]">
              {t("secretary.temporaryPatient.title")}
            </h1>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
              {t("secretary.temporaryPatient.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-visible px-6 py-6 sm:px-8 sm:py-7">
        {errors.root?.message ? (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3.5 text-start font-cairo text-[13px] font-semibold leading-relaxed text-[#B42318] shadow-sm"
          >
            {errors.root.message}
          </div>
        ) : null}

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(async (values) => {
            clearErrors();
            try {
              await onSubmit(values);
              reset();
            } catch (err: unknown) {
              const fb = resolveCreateTemporaryPatientServerFeedback(err);
              toast(fb.toastMessage, {
                title: t("secretary.temporaryPatient.createError"),
                variant: "error",
                durationMs: Math.min(
                  10500,
                  Math.max(5200, Math.round(fb.toastMessage.length * 42)),
                ),
              });
              (
                ["fullName", "email", "phoneLocal", "phoneDialCode"] as const
              ).forEach((name) => {
                const msg = fb.fields[name];
                if (msg) setError(name, { type: "server", message: msg });
              });
              if (fb.rootBanner)
                setError("root", { type: "server", message: fb.rootBanner });
            }
          })}
        >
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:gap-6">
            <section className={fieldCardClass}>
              <label
                htmlFor="temp-patient-fullname"
                className="mb-2 flex items-center justify-start gap-2 font-cairo text-[13px] font-extrabold text-[#344054]"
              >
                {t("secretary.temporaryPatient.fullNameLabel")}
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary/65"
                  aria-hidden
                />
                <input
                  id="temp-patient-fullname"
                  autoComplete="name"
                  placeholder={t(
                    "secretary.temporaryPatient.fullNamePlaceholder",
                  )}
                  {...register("fullName")}
                  className={cn(
                    inputBaseClass,
                    errors.fullName ? inputInvalidBorder : inputNormalBorder,
                  )}
                  aria-invalid={Boolean(errors.fullName)}
                />
              </div>
              {errors.fullName ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.fullName.message}
                </div>
              ) : null}
            </section>

            <section className={fieldCardClass}>
              <label
                htmlFor="temp-patient-email"
                className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#344054]"
              >
                {t("secretary.temporaryPatient.emailLabel")}
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary/60"
                  aria-hidden
                />
                <input
                  id="temp-patient-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder="patient@example.com"
                  {...register("email")}
                  className={cn(
                    inputBaseClass,
                    errors.email ? inputInvalidBorder : inputNormalBorder,
                  )}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email ? (
                <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                  {errors.email.message}
                </div>
              ) : null}
            </section>
          </div>

          <section className={fieldCardClass}>
            <label
              htmlFor="temp-patient-phone-local"
              className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#344054]"
            >
              {t("secretary.temporaryPatient.phoneLabel")}
            </label>
            <div
              className={cn(
                "overflow-hidden rounded-[14px] border bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow]",
                errors.phoneLocal || errors.phoneDialCode
                  ? "border-[#F04438] ring-2 ring-[#FECDCA]/70"
                  : "border-[#E4E7EC] hover:border-primary/35 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(15,143,139,0.11)]",
              )}
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-[minmax(150px,172px)_1fr]">
                <div className="border-b border-[#EEF2F6] bg-[#FAFBFC] p-2 sm:border-b-0 sm:border-e sm:border-[#EEF2F6] sm:min-h-[52px]">
                  <Controller
                    name="phoneDialCode"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        className="w-full min-w-0"
                        triggerClassName="rounded-[11px] !text-[15px] !font-extrabold text-[#101828]"
                        options={SIGNUP_PHONE_DIAL_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        size="md"
                        tone="muted"
                        listboxAriaLabel={t(
                          "secretary.temporaryPatient.dialCodeLabel",
                        )}
                        listboxPortalRef={listboxOutletRef}
                      />
                    )}
                  />
                </div>
                <div className="relative flex min-h-[52px] items-stretch">
                  <Phone
                    className="pointer-events-none absolute start-3 top-1/2 h-[17px] w-[17px] z-[1] -translate-y-1/2 text-primary/55"
                    aria-hidden
                  />
                  <input
                    id="temp-patient-phone-local"
                    {...register("phoneLocal")}
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="912345678"
                    className={cn(
                      "h-[52px] min-h-[52px] w-full flex-1 border-0 bg-transparent px-4 ps-11 pe-4 font-mono text-[16px] font-extrabold tracking-wider text-[#0B1220]",
                      "outline-none placeholder:font-semibold placeholder:text-[#98A2B3] focus-visible:ring-0",
                    )}
                    aria-invalid={Boolean(
                      errors.phoneLocal || errors.phoneDialCode,
                    )}
                  />
                </div>
              </div>
            </div>

            <p className="mt-1.5 flex flex-wrap items-center justify-start gap-x-2 text-start font-cairo text-[10.5px] font-semibold leading-snug text-[#667085]">
              <span className="inline-flex items-center rounded-lg bg-[#EFF8FF] px-2 py-0.5 text-[10px] font-extrabold text-[#175CD3]">
                {t("secretary.temporaryPatient.withoutLeadingZero")}
              </span>
              <span>
                {t("secretary.temporaryPatient.internationalFormatNote")}{" "}
                <span dir="ltr" className="font-mono text-[#344054]">
                  +963912345678
                </span>
              </span>
            </p>
            {errors.phoneLocal ? (
              <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                {errors.phoneLocal.message}
              </div>
            ) : errors.phoneDialCode ? (
              <div className="mt-2 text-start font-cairo text-[12px] font-bold text-[#D92D20]">
                {errors.phoneDialCode.message}
              </div>
            ) : null}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] pt-5 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={busy || isSubmitting}
              className="inline-flex h-[52px] min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#119B94] via-primary to-[#0F766E] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_32px_rgba(15,143,139,0.32)] transition-[transform,box-shadow] active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-[0.62] sm:flex-none sm:min-w-[220px]"
            >
              {(busy || isSubmitting) && (
                <Loader2
                  className="w-5 h-5 animate-spin shrink-0"
                  aria-hidden
                />
              )}
              {t("secretary.temporaryPatient.saveButton")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-[52px] min-h-[52px] flex-1 items-center justify-center rounded-xl border-2 border-[#E4E7EC] bg-white font-cairo text-[14px] font-extrabold text-[#344054] shadow-sm transition-colors hover:border-[#D0D5DD] hover:bg-[#F9FAFB] sm:flex-none sm:min-w-[140px]"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
