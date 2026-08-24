"use client";

import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AuthFlowError, useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";
import { persistClaimAccountPending } from "@/lib/auth/claimAccountNavState";
import {
  sanitizePostLoginNextPath,
  shouldRedirectToRestore,
} from "@/lib/auth/accountDeletionSession";
import {
  isValidAuthPhoneIdentifier,
  normalizeAuthPhoneIdentifier,
} from "@/lib/phone/normalizeAuthPhone";
import { useI18n } from "@/i18n/provider";

type LoginMethod = "phone" | "email";

function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

function createLoginSchema(t: (key: string, fallback?: string) => string) {
  return z
    .object({
      method: z.enum(["phone", "email"]),
      identifier: z.string().min(1, t("auth.validation.required", "This field is required")),
      password: z
        .string()
        .min(6, t("auth.validation.passwordMin6", "Password must be at least 6 characters")),
    })
    .superRefine((val, ctx) => {
      if (val.method === "email") {
        const res = z.string().email().safeParse(val.identifier);
        if (!res.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["identifier"],
            message: t("auth.validation.emailInvalid", "Please enter a valid email address"),
          });
        }
      }

      if (val.method === "phone") {
        if (countPhoneDigits(val.identifier) < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["identifier"],
            message: t("auth.validation.phoneMin10", "Phone number must contain at least 10 digits"),
          });
          return;
        }

        if (!isValidAuthPhoneIdentifier(val.identifier)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["identifier"],
            message: t(
              "auth.validation.phoneE164",
              "Enter a valid international phone number like +963912345678",
            ),
          });
        }
      }
    });
}

type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

export default function LoginForm({
  onBack,
  onSignUp,
  onForgotPassword,
  onOtpLogin,
}: {
  onBack: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onOtpLogin: () => void;
}) {
  const { t, locale, dir } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [methodDirection, setMethodDirection] = useState<1 | -1>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      method: "email",
      identifier: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const methodLabel = useMemo(() => {
    return method === "phone"
      ? t("auth.login.method.phone", "Phone")
      : t("auth.login.method.email", "Email");
  }, [method, t]);

  const methodPlaceholder = useMemo(() => {
    return method === "phone"
      ? t("auth.login.placeholder.phone", "+963912345678")
      : t("auth.login.placeholder.email", "example@email.com");
  }, [method]);

  const MethodIcon = method === "phone" ? Phone : Mail;

  const roleRoot: Record<string, string> = {
    doctor: "/doctor/dashboard",
    admin: "/admin/dashboard",
    secretary: "/secretary/dashboard",
    "data-entry": "/data-entry/dashboard",
    patient: "/patient/dashboard",
  };

  const onSubmit = handleSubmit(async (values) => {
    setLoginError(null);

    try {
      const loginIdentifier =
        values.method === "email"
          ? values.identifier.trim()
          : normalizeAuthPhoneIdentifier(values.identifier);

      const loginData = await useAuthStore
        .getState()
        .login(loginIdentifier, values.password, "web");

      const userRole = useAuthStore.getState().user?.role ?? "";

      if (
        shouldRedirectToRestore({
          accountDeletionStatus: loginData.accountDeletionStatus,
          recoverUntil: loginData.recoverUntil ?? null,
        })
      ) {
        toast(t("auth.login.recoveryActive.body"), {
          title: t("auth.login.recoveryActive.title"),
          variant: "info",
          durationMs: 5200,
        });
        return;
      }

      const LOGIN_SUCCESS_BY_ROLE: Record<string, string> = {
        admin: t("auth.login.success.admin"),
        doctor: t("auth.login.success.doctor"),
        secretary: t("auth.login.success.secretary"),
        patient: t("auth.login.success.patient"),
        "data-entry": t("auth.login.success.dataEntry"),
      };
      toast(LOGIN_SUCCESS_BY_ROLE[userRole] ?? t("auth.login.success.default"), {
        title: t("auth.login.success.title"),
        variant: "success",
        durationMs: 3800,
      });

      if (userRole === "admin") {
        void queryClient.invalidateQueries({
          queryKey: ["admin", "notifications"],
        });
      }

      const safeNext = sanitizePostLoginNextPath(searchParams.get("next"), {
        accountDeletionStatus: loginData.accountDeletionStatus,
        recoverUntil: loginData.recoverUntil ?? null,
      });
      if (safeNext) {
        navigate(safeNext, { replace: true });
        return;
      }

      navigate(roleRoot[userRole] ?? "/welcome", { replace: true });
    } catch (error: unknown) {
      const code = error instanceof AuthFlowError ? error.code : "UNKNOWN";
      const loginErrorByMethod: Record<
        "phone" | "email",
        Record<string, string>
      > = {
        phone: {
          INVALID_CREDENTIALS: t("auth.login.error.phone.invalidCredentials"),
          NOT_VERIFIED: t("auth.login.error.phone.notVerified"),
          INACTIVE: t("auth.login.error.common.inactive"),
          PENDING_APPROVAL: t("auth.login.error.common.pendingApproval"),
          NOT_ALLOWED: t("auth.login.error.common.notAllowed"),
          TEMPORARY: t("auth.login.error.common.temporary"),
          LOCKED: t("auth.login.error.common.locked"),
          DELETED: t("auth.login.error.phone.deleted"),
          DELETION_RECOVERY: t("auth.login.error.common.deletionRecovery"),
          NETWORK_ERROR: t("auth.login.error.common.network"),
          UNKNOWN: t("auth.login.error.common.unknown"),
        },
        email: {
          INVALID_CREDENTIALS: t("auth.login.error.email.invalidCredentials"),
          NOT_VERIFIED: t("auth.login.error.email.notVerified"),
          INACTIVE: t("auth.login.error.common.inactive"),
          PENDING_APPROVAL: t("auth.login.error.common.pendingApproval"),
          NOT_ALLOWED: t("auth.login.error.common.notAllowed"),
          TEMPORARY: t("auth.login.error.common.temporary"),
          LOCKED: t("auth.login.error.common.locked"),
          DELETED: t("auth.login.error.email.deleted"),
          DELETION_RECOVERY: t("auth.login.error.common.deletionRecovery"),
          NETWORK_ERROR: t("auth.login.error.common.network"),
          UNKNOWN: t("auth.login.error.common.unknown"),
        },
      };
      const normalized = String(code).trim().toUpperCase();
      const message =
        loginErrorByMethod[values.method][normalized]
        ?? loginErrorByMethod.email.UNKNOWN;
      setLoginError(message);
      toast(message, {
        title: t("auth.login.error.title"),
        variant: "error",
        durationMs: 5600,
      });

      if (code === "DELETED") {
        toast(t("auth.login.error.accountBlocked.body"), {
          title: t("auth.login.error.accountBlocked.title"),
          variant: "info",
          durationMs: 5200,
        });
        return;
      }

      if (code === "DELETION_RECOVERY") {
        const details =
          error instanceof AuthFlowError ? error.authError?.details : null;
        const detailsRecord =
          details && typeof details === "object" && !Array.isArray(details)
            ? (details as Record<string, unknown>)
            : null;
        const recoverUntil =
          typeof detailsRecord?.recoveryExpiresAt === "string"
            ? detailsRecord.recoveryExpiresAt
            : typeof detailsRecord?.recoverUntil === "string"
              ? detailsRecord.recoverUntil
              : null;

        toast(
          t("auth.login.error.deletionRecoveryExpired"),
          {
            title: t("auth.login.error.title"),
            variant: "error",
            durationMs: 5200,
          },
        );
        return;
      }

      if (code === "TEMPORARY") {
        const identifier =
          values.method === "email"
            ? values.identifier.trim()
            : normalizeAuthPhoneIdentifier(values.identifier);

        persistClaimAccountPending({
          channel: values.method === "email" ? "email" : "whatsapp",
          email: values.method === "email" ? identifier : undefined,
          phone: values.method === "phone" ? identifier : undefined,
          destination: identifier,
        });

        navigate("/claim-account", { replace: true });
        return;
      }

      if (!(error instanceof AuthFlowError)) {
        console.error("Unexpected login failure:", error);
      }
    }
  });

  return (
    <section className="flex flex-col items-center px-4 pt-2 pb-16 mx-auto w-full min-h-svh">
      <div className="my-[35px] shrink-0">
        <img
          src="/images/syr-health-logo.png"
          alt="LMJ Health"
          width={226}
          height={120}
          className="max-h-[120px]"
          loading="eager"
        />
      </div>
      <div dir={dir} lang={locale} className="relative mb-8 w-full max-w-[448px]">
        <div className="relative z-10 h-[4px] w-full max-w-[448px] bg-gradient-to-b from-[#0F8F8B] via-[#65BFEC] to-[#0F8F8B]" />
        <div className="z-10 rounded-[6px] bg-[#FFFFFFF2] px-7 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
          <div className="text-start">
            <h1 className="font-cairo text-[16px] font-bold leading-[32px] text-[#1F2937]">
              {t("auth.login.title")}
            </h1>
            <p className="mt-2 font-cairo text-[16px] font-medium leading-[24px] text-[#6B7280]">
              {t("auth.login.subtitle")}
            </p>
          </div>

          <form className="" noValidate onSubmit={onSubmit}>
            <div className="mx-auto max-w-[330px] gap-[24px] py-[35px] px-[24px]">
              <div className="relative flex h-[35px] w-full rounded-[6px] bg-[#F2F4F7] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.10)]">
                <div className="flex relative flex-1">
                  {method === "phone" && (
                    <motion.div
                      layoutId="loginMethodPill"
                      className="absolute inset-0 rounded-[6px] bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 40,
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMethodDirection(-1);
                      setMethod("phone");
                      setValue("method", "phone");
                      setValue("identifier", "");
                      clearErrors("identifier");
                    }}
                    className={
                      method === "phone"
                        ? "relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-normal text-[#FFFFFF]"
                        : "relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-bold text-[#667085]"
                    }
                  >
                    {t("auth.login.method.phone")}
                  </button>
                </div>

                <div className="flex relative flex-1">
                  {method === "email" && (
                    <motion.div
                      layoutId="loginMethodPill"
                      className="absolute inset-0 rounded-[6px] bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 40,
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMethodDirection(1);
                      setMethod("email");
                      setValue("method", "email");
                      setValue("identifier", "");
                      clearErrors("identifier");
                    }}
                    className={
                      method === "email"
                        ? "relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-normal text-[#FFFFFF]"
                        : "relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-bold text-[#667085]"
                    }
                  >
                    {t("auth.login.method.email")}
                  </button>
                </div>
              </div>

              <div className="gap-[16px] mt-4">
                <div>
                  <label className="block mb-1 text-start font-cairo text-[14px] font-bold text-[#101828]">
                    {methodLabel}
                  </label>
                  <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={methodDirection}
                  >
                    <motion.div
                      key={method}
                      custom={methodDirection}
                      variants={{
                        enter: (dir: 1 | -1) => ({
                          opacity: 0,
                          x: dir === 1 ? -14 : 14,
                        }),
                        center: { opacity: 1, x: 0 },
                        exit: (dir: 1 | -1) => ({
                          opacity: 0,
                          x: dir === 1 ? 14 : -14,
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex h-[35px] bg-[#F3F3F5] max-w-[330px] items-center rounded-[8px] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
                    >
                      <MethodIcon className="h-5 w-5 text-[#B5B7BA]" />
                      <input
                        dir="ltr"
                        inputMode={method === "phone" ? "tel" : "email"}
                        type={method === "phone" ? "tel" : "email"}
                        placeholder={methodPlaceholder}
                        {...register("identifier")}
                        className="h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium"
                      />
                    </motion.div>
                  </AnimatePresence>
                  {errors.identifier ? (
                    <div className="mt-2 break-words text-start font-cairo text-[12px] font-bold leading-snug text-[#D92D20]">
                      {errors.identifier.message}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="mt-5 mb-1 block text-start font-cairo text-[14px] font-bold text-[#101828]">
                    {t("auth.login.passwordLabel")}
                  </label>
                  <div className=" flex h-[35px] bg-[#F3F3F5] max-w-[330px] items-center rounded-[8px] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="flex items-center justify-center text-[#B5B7BA] transition-colors hover:text-primary focus:outline-none"
                      aria-label={
                        showPassword
                          ? t("auth.common.hidePassword", "Hide password")
                          : t("auth.common.showPassword", "Show password")
                      }
                      title={
                        showPassword
                          ? t("auth.common.hidePassword", "Hide password")
                          : t("auth.common.showPassword", "Show password")
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      dir="ltr"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.login.placeholder.password", "password123")}
                      {...register("password")}
                      className="h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium"
                    />
                  </div>
                  {errors.password ? (
                    <div className="mt-2 break-words text-start font-cairo text-[12px] font-bold leading-snug text-[#D92D20]">
                      {errors.password.message}
                    </div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex h-[36px] w-full max-w-[330px] items-center justify-center rounded-[8px] bg-primary text-[14px] text-white shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
                >
                  {isSubmitting ? t("auth.login.pending") : t("auth.login.submit")}
                </button>

                {loginError && (
                  <div
                    role="alert"
                    className="mt-3 break-words rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-start font-cairo text-[13px] font-semibold leading-snug text-[#D92D20]"
                  >
                    {loginError}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between px-1 font-cairo text-[14px] text-primary">
                <button
                  type="button"
                  className="transition-colors hover:text-[#14B3AE]"
                  onClick={onForgotPassword}
                >
                  {t("auth.login.forgotPassword")}
                </button>
                <button
                  type="button"
                  className="transition-colors hover:text-[#14B3AE]"
                  onClick={onOtpLogin}
                >
                  {t("auth.login.otpLogin")}
                </button>
              </div>
            </div>

            <div className="mt-10 text-center font-cairo text-[13px] text-[#667085]">
              {t("auth.login.noAccount")}{" "}
              <button
                type="button"
                onClick={onSignUp}
                className="ps-2 text-primary transition-colors hover:text-[#14B3AE]"
              >
                {t("auth.login.createAccount")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
