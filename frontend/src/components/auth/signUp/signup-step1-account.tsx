"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  step1AccountSchema,
  type Step1AccountFormInput,
  type Step1AccountValues,
  type SignUpValues,
  splitSignupPhone,
  SIGNUP_PHONE_DIAL_OPTIONS,
  SIGNUP_NAME_PREFIX_AR,
  SIGNUP_NAME_PREFIX_EN,
  buildSignupFullName,
  detectSignupNameScript,
  stripSignupNamePrefix,
} from "./signup-schemas";

import type { SignupFieldConflictMessages } from "@/lib/auth/signupMessaging";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

export default function SignUpStep1Account({
  onBack,
  onNext,
  defaultValues,
  contactFieldErrors,
  contactPrecheckBusy = false,
  onDismissContactConflict,
}: {
  onBack: () => void;
  onNext: (values: Step1AccountValues) => void | Promise<void>;
  defaultValues?: Partial<SignUpValues>;
  contactFieldErrors?: SignupFieldConflictMessages;
  contactPrecheckBusy?: boolean;
  onDismissContactConflict?: (field: "email" | "phone") => void;
}) {
  const { t, locale } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const phoneDefaults = useMemo(
    () => splitSignupPhone(defaultValues?.phone),
    [defaultValues?.phone],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<Step1AccountFormInput, unknown, Step1AccountValues>({
    resolver: zodResolver(step1AccountSchema(locale)),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
      confirmPassword: "",
      phoneDialCode: phoneDefaults.phoneDialCode,
      phoneLocal: phoneDefaults.phoneLocal,
      channel: defaultValues?.channel ?? "whatsapp",
    },
    /** تحقّق من البريد والحقول عند الخروج من الحقل؛ وعند الإرسال للخطوة التالية أيضاً */
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const channel = watch("channel");

  /**
   * بادئة "د./Dr." ثابتة في بداية الاسم الكامل: "د." للاسم العربي و"Dr." للاسم
   * الأجنبي، حسب أول حرف يكتبه المستخدم. تُعرض كجزء ثابت من الحقل لا يمكن حذفه،
   * والقيمة الفعلية المُرسلة (`fullName`) تتضمّنها دائماً — انظر buildSignupFullName.
   */
  const [nameRest, setNameRest] = useState(() =>
    stripSignupNamePrefix(defaultValues?.fullName ?? ""),
  );
  const nameScript = useMemo(
    () => detectSignupNameScript(nameRest),
    [nameRest],
  );
  const namePrefix =
    nameScript === "ar" ? SIGNUP_NAME_PREFIX_AR : SIGNUP_NAME_PREFIX_EN;

  useEffect(() => {
    setValue("fullName", buildSignupFullName(nameRest), {
      shouldValidate: false,
    });
  }, [nameRest, setValue]);

  const emailField = register("email");
  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");
  const phoneLocalField = register("phoneLocal");

  const emailRemote = contactFieldErrors?.email?.trim();
  const phoneRemote = contactFieldErrors?.phone?.trim();
  const emailErrText = errors.email?.message ?? emailRemote;
  const phoneErrText =
    errors.phoneLocal?.message ?? errors.phoneDialCode?.message ?? phoneRemote;

  return (
    <>
      <div className="flex flex-col items-center mt-7 text-center">
        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]">
          <User className="w-9 h-9 text-white" />
        </div>
        <div className="flex gap-3 justify-center items-center mt-4">
          <h2 className="font-cairo text-[22px] font-extrabold text-[#101828]">
            معلومات الحساب
          </h2>
        </div>
        <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
          أدخل بياناتك الأساسية لإنشاء حساب
        </p>
      </div>

      <form
        className="mt-6"
        /** بدون هذا يعترض المتصفح عن الإرسال عند `type="email"` قبل Zod، فلا تظهر رسالة التحقق العربية تحت الحقل. */
        noValidate
        aria-busy={contactPrecheckBusy}
        onSubmit={handleSubmit(async (values) => {
          await Promise.resolve(onNext(values));
        })}
      >
        <div className="space-y-5">
          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <User className="w-4 h-4 text-primary" />
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                الاسم الكامل
              </span>
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                *
              </span>
            </div>
            <input type="hidden" {...register("fullName")} />
            <div className="mt-2 flex h-[48px] w-full items-center gap-2 rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)] focus-within:border-primary">
              {/* بادئة "د./Dr." ثابتة، تُكتشف من لغة الاسم ولا يمكن للمستخدم حذفها أو تعديلها. */}
              <span
                className="shrink-0 select-none font-cairo text-[14px] font-bold text-[#6B7280]"
                aria-hidden
              >
                {namePrefix}
              </span>
              <input
                type="text"
                dir={nameScript === "ar" ? "rtl" : "ltr"}
                placeholder={nameScript === "ar" ? "محمد أحمد" : "John Smith"}
                value={nameRest}
                onChange={(ev) => setNameRest(ev.target.value)}
                onBlur={() => void trigger("fullName")}
                className="h-full min-w-0 flex-1 bg-transparent font-cairo text-[14px] font-semibold text-[#6B7280] outline-none"
              />
            </div>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.fullName?.message ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.fullName?.message ?? "x"}
            </div>
          </div>

          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                البريد الإلكتروني
              </span>
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                *
              </span>
            </div>
            <input
              type="email"
              placeholder="doctor@example.com"
              {...emailField}
              onBlur={(ev) => {
                void emailField.onBlur(ev);
                if (dirtyFields.email) onDismissContactConflict?.("email");
              }}
              className="mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-12 py-[4px] font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary"
            />
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                emailErrText ? "text-red-500" : "text-transparent"
              }`}
            >
              {emailErrText ?? "x"}
            </div>
          </div>

          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <LockKeyhole className="w-4 h-4 text-primary" />
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                كلمة المرور
              </span>
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                *
              </span>
            </div>
            <div className="mt-2 flex h-[48px] w-full items-center gap-2 rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)] focus-within:border-primary">
              <input
                dir="rlt"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...passwordField}
                className="h-full min-w-0 px-12 flex-1 bg-transparent font-cairo text-[14px] font-semibold text-[#6B7280] outline-none placeholder:font-cairo placeholder:font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="justify-start shrink-0 items-center text-[#6B7280] transition-colors hover:text-primary focus:outline-none"
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.password?.message ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.password?.message ?? "x"}
            </div>
            <p className="mt-0.5 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]">
              {t("auth.signup.passwordRequirements")}
            </p>
          </div>

          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <LockKeyhole className="w-4 h-4 text-primary" />
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                {t("auth.confirmPassword")}
              </span>
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                *
              </span>
            </div>
            <div className="mt-2 flex h-[48px] w-full items-center gap-2 rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)] focus-within:border-primary">
              <input
                dir="rlt"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                autoComplete="new-password"
                {...confirmPasswordField}
                className="h-full min-w-0 px-12 flex-1 bg-transparent font-cairo text-[14px] font-semibold text-[#6B7280] outline-none placeholder:font-cairo placeholder:font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="justify-start shrink-0 items-center text-[#6B7280] transition-colors hover:text-primary focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "إخفاء تأكيد كلمة المرور"
                    : "إظهار تأكيد كلمة المرور"
                }
                title={
                  showConfirmPassword
                    ? "إخفاء تأكيد كلمة المرور"
                    : "إظهار تأكيد كلمة المرور"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.confirmPassword?.message
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.confirmPassword?.message ?? "x"}
            </div>
          </div>

          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                رقم الهاتف
              </span>
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                *
              </span>
            </div>
            <div className="flex flex-row gap-2 mt-2 w-full">
              <input
                type="tel"
                dir="rlt"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="912345678"
                {...phoneLocalField}
                onBlur={(ev) => {
                  void phoneLocalField.onBlur(ev);
                  if (dirtyFields.phoneLocal || dirtyFields.phoneDialCode)
                    onDismissContactConflict?.("phone");
                }}
                className="h-[48px] min-w-0 flex-1 rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] font-cairo text-[14px] font-semibold tabular-nums text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary"
              />
              <Controller
                name="phoneDialCode"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    className="w-[11rem] shrink-0"
                    triggerClassName="h-[48px] rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-2 font-cairo text-[12px] font-bold text-[#374151] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary"
                    size="md"
                    tone="brand"
                    options={SIGNUP_PHONE_DIAL_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    onBlur={() => {
                      field.onBlur();
                      if (dirtyFields.phoneLocal || dirtyFields.phoneDialCode)
                        onDismissContactConflict?.("phone");
                    }}
                    name={field.name}
                    listboxAriaLabel="رمز الاتصال"
                  />
                )}
              />
            </div>
            <p className="mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]">
              اختر مفتاح الدولة ثم أدخل الرقم المحلي فقط (بدون الصفر الأول)
            </p>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                phoneErrText ? "text-red-500" : "text-transparent"
              }`}
            >
              {phoneErrText ?? "x"}
            </div>
          </div>

          <div>
            <div className="flex gap-2 justify-start items-center text-start">
              <span className="font-cairo text-[14px] font-bold text-[#374151]">
                قناة التحقق
              </span>
              <span className="font-cairo text-[14px] font-bold text-primary">
                *
              </span>
            </div>

            <input type="hidden" {...register("channel")} />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                type="button"
                disabled={contactPrecheckBusy}
                onClick={() => setValue("channel", "whatsapp")}
                className={
                  channel === "whatsapp"
                    ? "flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[14px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                    : "flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#6B7280]"
                }
              >
                واتساب
                <Phone className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled={contactPrecheckBusy}
                onClick={() => setValue("channel", "email")}
                className={
                  channel === "email"
                    ? "flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[14px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                    : "flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#6B7280]"
                }
              >
                البريد
                <Mail className="w-5 h-5" />
              </button>
            </div>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.channel?.message ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.channel?.message ?? "x"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>

            <button
              type="submit"
              disabled={contactPrecheckBusy}
              className="flex h-[54px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15, 143, 139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:pointer-events-none disabled:opacity-70"
            >
              {contactPrecheckBusy ? (
                <Loader2
                  className="h-5 w-5 shrink-0 animate-spin"
                  aria-hidden
                />
              ) : null}
              {contactPrecheckBusy ? "جاري التحقق…" : "التالي"}
              {!contactPrecheckBusy ? (
                <ArrowLeft className="w-4 h-4 shrink-0" />
              ) : null}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
