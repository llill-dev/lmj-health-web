"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordResetShell from "@/components/auth/password/PasswordResetShell";
import {
  formatVerifyFlowError,
  getVerifyCodeSchemaHint,
} from "@/lib/auth/signupMessaging";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

function buildVerifySchema(locale: "ar" | "en") {
  return z.object({
    code: z.string().regex(/^\d{6}$/, getVerifyCodeSchemaHint(locale)),
  });
}

type VerifyValues = z.infer<ReturnType<typeof buildVerifySchema>>;

export default function ResetPasswordVerifyForm({
  destination,
  onBack,
  onVerify,
  onResend,
}: {
  destination: string;
  onBack: () => void;
  onVerify?: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const verifySchema = useMemo(() => buildVerifySchema(locale), [locale]);
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  const [code, setCode] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const syncCode = (nextDigits: string[]) => {
    setCode(nextDigits);
    setValue("code", nextDigits.join(""), { shouldDirty: true });
  };

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, "").slice(-1);
    const nextDigits = code.map((digit, i) => (i === index ? next : digit));
    syncCode(nextDigits);
    if (next && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Backspace") return;
    if (code[index]) {
      syncCode(code.map((digit, i) => (i === index ? "" : digit)));
      return;
    }
    if (index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    syncCode(next);
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
  };

  const submitOtp = async (values: VerifyValues) => {
    if (!onVerify) return;
    setFlowError(null);
    setIsVerifying(true);
    try {
      await onVerify(values.code);
    } catch (error) {
      const formatted = formatVerifyFlowError(error, locale);
      setFlowError(formatted);
      toast(formatted.replace(/\s+/g, " ").trim().slice(0, 220), {
        title: t("auth.resetPassword.verificationFailed"),
        variant: "error",
        durationMs: 4800,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const inlineError = errors.code?.message ?? flowError;

  return (
    <PasswordResetShell step={2}>
      <div className="text-center">
        <h2 className="font-cairo text-[15px] font-extrabold text-[#1F2937]">
          {t("auth.resetPassword.enterVerificationCode")}
        </h2>
        <p className="mt-2 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085]">
          {t("auth.resetPassword.codeSentTo")}{" "}
          <span dir="ltr" className="font-bold text-primary">
            {destination}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(submitOtp)} className="mt-6" noValidate>
        <div className="mx-auto flex max-w-[340px] items-center justify-center gap-2">
          {code.map((value, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              value={value}
              inputMode="numeric"
              autoComplete="one-time-code"
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className="h-12 w-12 rounded-[8px] border border-[#E5E7EB] bg-[#F3F4F6] text-center font-cairo text-[18px] font-extrabold text-[#101828] shadow-[0_8px_20px_rgba(0,0,0,0.05)] outline-none transition focus:border-primary focus:bg-white"
            />
          ))}
        </div>

        <div
          className={`mx-auto mt-3 min-h-[22px] max-w-[360px] text-center font-cairo text-[12px] font-semibold leading-snug ${inlineError ? "text-[#D92D20]" : "text-transparent"}`}
          aria-live="polite"
        >
          {inlineError ?? "\u00A0"}
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="mt-6 flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.32)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
        >
          <span>
            {isVerifying
              ? t("auth.verifying")
              : t("auth.resetPassword.verifyCode")}
          </span>
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        </button>

        <div className="mt-5 text-center font-cairo text-[13px] font-semibold text-[#667085]">
          {secondsLeft > 0 ? (
            <span>
              {t("auth.claim.resendIn").replace(
                "{seconds}",
                String(secondsLeft),
              )}
            </span>
          ) : (
            <>
              <span>{t("auth.claim.didntReceiveCode")} </span>
              <button
                type="button"
                disabled={isResending}
                onClick={async () => {
                  if (!onResend) return;
                  setIsResending(true);
                  try {
                    await onResend();
                    setFlowError(null);
                    setSecondsLeft(60);
                    toast(t("auth.claim.codeResent"), {
                      title: t("auth.claim.resent"),
                      variant: "success",
                      durationMs: 3200,
                    });
                  } catch (error) {
                    const formatted = formatVerifyFlowError(error, locale);
                    setFlowError(formatted);
                    toast(formatted.replace(/\s+/g, " ").trim().slice(0, 220), {
                      title: t("auth.claim.resendFailed"),
                      variant: "error",
                      durationMs: 4800,
                    });
                  } finally {
                    setIsResending(false);
                  }
                }}
                className="font-bold text-primary transition-colors hover:text-[#14B3AE] disabled:opacity-60"
              >
                {isResending ? t("auth.sending") : t("auth.claim.resendCode")}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 flex w-full items-center justify-center gap-1 font-cairo text-[13px] font-semibold text-primary transition-colors hover:text-[#14B3AE]"
        >
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t("auth.resetPassword.changeChannel")}</span>
        </button>
      </form>
    </PasswordResetShell>
  );
}
