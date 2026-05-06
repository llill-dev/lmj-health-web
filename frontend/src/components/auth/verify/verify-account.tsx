"use client";

import { CircleCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  VERIFY_CODE_SCHEMA_HINT_AR,
  formatVerifyFlowError,
} from "@/lib/auth/signupMessaging";

const verifyAccountSchema = z.object({
  code: z.string().regex(new RegExp("^\\d{6}$"), VERIFY_CODE_SCHEMA_HINT_AR),
});

type VerifyAccountValues = z.infer<typeof verifyAccountSchema>;

export default function VerifyAccount({
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
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyAccountValues>({
    resolver: zodResolver(verifyAccountSchema),
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
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    const merged = code.map((c, i) => (i === index ? next : c)).join("");
    setValue("code", merged, { shouldDirty: true });
    if (next && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;
    if (code[index]) {
      const nextDigits = code.map((c, i) => (i === index ? "" : c));
      setCode(nextDigits);
      setValue("code", nextDigits.join(""), { shouldDirty: true });
      return;
    }
    if (index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    setCode(next);
    setValue("code", next.join(""), { shouldDirty: true });
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
  };

  const submitOtp = async (values: VerifyAccountValues) => {
    if (!onVerify) return;
    setFlowError(null);
    setIsVerifying(true);
    try {
      await onVerify(values.code);
    } catch (error) {
      setFlowError(formatVerifyFlowError(error));
    } finally {
      setIsVerifying(false);
    }
  };

  const inlineError = errors.code?.message ?? flowError;

  return (
    <section className="flex flex-col items-center mx-auto">
      <div className="my-[50px]">
        <img
          src="/images/syr-health-logo.png"
          alt="LMJ Health"
          width={300}
          height={200}
          className="max-h-[200px]"
          loading="eager"
        />
      </div>
      <h1 className="my-6 text-center text-[28px] font-bold leading-tight text-[#1F2937]">
        تحقّق من حسابك
      </h1>
      <div lang="ar" className="relative">
        <div className="relative w-fit">
          <div className="pointer-events-none absolute -right-[100px] -top-[170px] z-10">
            <div className="relative w-44 h-44">
              <div className="absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
            </div>
          </div>

          <div className="mt-8 min-h-[280px] w-[557px] rounded-[6px] bg-white px-[108px] py-[28px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <form onSubmit={handleSubmit(submitOtp)}>
              <div className="text-center">
                <p className="font-cairo text-[15px] font-semibold leading-[24px] text-[#374151]">
                  أدخل الرمز المكوّن من ٦ أرقام الذي وصل إلى
                </p>
                <p className="mt-2 font-cairo text-[16px] font-bold leading-snug text-[#101828]">
                  {destination}
                </p>
              </div>

              <div className="mx-auto mt-8 flex w-[307.84px] items-center justify-center gap-1">
                {code.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={v}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={isVerifying}
                    className="h-[47.99px] w-[47.99px] rounded-[8px] border-[1.9px] border-[#E5E7EB] bg-[#EFEFEF] text-center font-cairo text-[18px] font-extrabold text-[#101828] shadow-[0_10px_25px_rgba(0,0,0,0.06)] outline-none focus:border-primary focus:bg-white"
                  />
                ))}
              </div>

              <div
                className={`mx-auto mt-3 min-h-[22px] w-full max-w-[340px] text-center font-cairo text-[13px] font-semibold leading-snug ${inlineError ? "text-red-500" : "text-transparent"}`}
                aria-live="polite"
              >
                {inlineError ?? "\u00A0"}
              </div>

              <div className="mt-8 flex w-[341.21px] items-center justify-center">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex h-[43.98px] w-[341.22px] items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] text-[#FFFFFF] shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
                >
                  <CircleCheck className="w-4 h-4 shrink-0" />
                  {isVerifying ? "جاري التحقق…" : "تأكيد"}
                </button>
              </div>

              <div className="flex flex-col gap-3 items-center mt-8 text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="font-cairo text-[14px] font-semibold text-[#6B7280] transition-colors hover:text-primary"
                >
                  رجوع
                </button>
                <div className="font-cairo text-[13px] font-semibold text-[#9CA3AF]">
                  {secondsLeft > 0 ? (
                    <span>
                      لم تستلم الرمز؟ يمكن الإرسال مجدداً خلال {secondsLeft} ث
                    </span>
                  ) : (
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
                        } catch (error) {
                          setFlowError(formatVerifyFlowError(error));
                        } finally {
                          setIsResending(false);
                        }
                      }}
                      className="text-primary transition-colors hover:text-[#14B3AE] disabled:opacity-60"
                    >
                      {isResending ? "جاري الإرسال…" : "إعادة إرسال الرمز"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
