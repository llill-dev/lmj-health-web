'use client';

import { CircleCheck, Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  VERIFY_CODE_SCHEMA_HINT_AR,
  formatVerifyFlowError,
} from '@/lib/auth/signupMessaging';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';

const claimVerifySchema = z
  .object({
    code: z.string().regex(new RegExp('^\\d{6}$'), VERIFY_CODE_SCHEMA_HINT_AR),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'يرجى تأكيد كلمة المرور'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

type ClaimVerifyValues = z.infer<typeof claimVerifySchema>;

export default function ClaimAccountVerifyForm({
  destination,
  onBack,
  onSubmit,
  onResend,
}: {
  destination: string;
  onBack: () => void;
  onSubmit: (values: ClaimVerifyValues) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClaimVerifyValues>({
    resolver: zodResolver(claimVerifySchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const [code, setCode] = useState<string[]>(
    Array.from({ length: 6 }, () => ''),
  );
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const { toast } = useToast();

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    const merged = code.map((c, i) => (i === index ? next : c)).join('');
    setValue('code', merged, { shouldDirty: true });
    if (next && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    if (code[index]) {
      const nextDigits = code.map((c, i) => (i === index ? '' : c));
      setCode(nextDigits);
      setValue('code', nextDigits.join(''), { shouldDirty: true });
      return;
    }
    if (index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? '');
    setCode(next);
    setValue('code', next.join(''), { shouldDirty: true });
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
  };

  const submitForm = async (values: ClaimVerifyValues) => {
    setFlowError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      const formatted = formatVerifyFlowError(error);
      setFlowError(formatted);
      toast(formatted.replace(/\s+/g, ' ').trim().slice(0, 220), {
        title: tr('تعذّر تفعيل الحساب', 'Account activation failed'),
        variant: 'error',
        durationMs: 4800,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inlineError =
    errors.code?.message ??
    errors.password?.message ??
    errors.confirmPassword?.message ??
    flowError;

  return (
    <section dir={dir} lang={locale} className="mx-auto flex flex-col items-center">
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

      <h1 className="my-4 text-center font-cairo text-[28px] font-bold leading-tight text-[#1F2937]">
        {tr('تفعيل حسابك', 'Activate your account')}
      </h1>

      <div className="relative">
        <div className="relative w-fit">
          <div className="pointer-events-none absolute -end-[100px] -top-[170px] z-10">
            <div className="relative h-44 w-44">
              <div className="absolute start-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
              <div className="absolute start-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
            </div>
          </div>

          <div className="mt-4 min-h-[420px] w-[557px] rounded-[6px] bg-white px-[108px] py-[28px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="text-center">
                <p className="font-cairo text-[15px] font-semibold leading-[24px] text-[#374151]">
                  {tr('أدخل الرمز المرسل إلى', 'Enter the code sent to')}
                </p>
                <p className="mt-2 font-cairo text-[16px] font-bold leading-snug text-[#101828]">
                  {destination}
                </p>
                <p className="mt-3 font-cairo text-[13px] font-semibold text-[#6B7280]">
                  {tr(
                    'ثم عيّن كلمة مرور جديدة لتفعيل حسابك.',
                    'Then set a new password to activate your account.',
                  )}
                </p>
              </div>

              <div className="mx-auto mt-6 flex w-[307.84px] items-center justify-center gap-1">
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
                    disabled={isSubmitting}
                    className="h-[47.99px] w-[47.99px] rounded-[8px] border-[1.9px] border-[#E5E7EB] bg-[#EFEFEF] text-center font-cairo text-[18px] font-extrabold text-[#101828] shadow-[0_10px_25px_rgba(0,0,0,0.06)] outline-none focus:border-primary focus:bg-white"
                  />
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-start font-cairo text-[14px] font-bold text-[#1F2937]">
                    {tr('كلمة المرور', 'Password')}
                  </label>
                  <div className="mt-2 flex h-[36px] items-center rounded-[6px] border-[1.82px] border-[#E5E7EB] bg-[#F3F4F6] px-[12px] py-[4px]">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      disabled={isSubmitting}
                      className="h-full w-full bg-transparent px-2 font-cairo text-[14px] font-semibold text-[#101828] outline-none"
                    />
                    {passwordValue?.length ? (
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="shrink-0 text-[#98A2B3] hover:text-[#667085]"
                        aria-label={
                          showPassword
                            ? tr('إخفاء كلمة المرور', 'Hide password')
                            : tr('إظهار كلمة المرور', 'Show password')
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-start font-cairo text-[14px] font-bold text-[#1F2937]">
                    {tr('تأكيد كلمة المرور', 'Confirm password')}
                  </label>
                  <div className="mt-2 flex h-[36px] items-center rounded-[6px] border-[1.82px] border-[#E5E7EB] bg-[#F3F4F6] px-[12px] py-[4px]">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      disabled={isSubmitting}
                      className="h-full w-full bg-transparent px-2 font-cairo text-[14px] font-semibold text-[#101828] outline-none"
                    />
                    {confirmPasswordValue?.length ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="shrink-0 text-[#98A2B3] hover:text-[#667085]"
                        aria-label={
                          showConfirmPassword
                            ? tr('إخفاء كلمة المرور', 'Hide password')
                            : tr('إظهار كلمة المرور', 'Show password')
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                className={`mx-auto mt-3 min-h-[22px] w-full max-w-[340px] text-center font-cairo text-[13px] font-semibold leading-snug ${inlineError ? 'text-red-500' : 'text-transparent'}`}
                aria-live="polite"
              >
                {inlineError ?? '\u00A0'}
              </div>

              <div className="mt-6 flex w-full items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-[43.98px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] text-white shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
                >
                  <CircleCheck className="h-4 w-4 shrink-0" />
                  {isSubmitting
                    ? tr('جاري التفعيل…', 'Activating…')
                    : tr('تفعيل الحساب', 'Activate account')}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="font-cairo text-[14px] font-semibold text-[#6B7280] transition-colors hover:text-primary"
                >
                  {tr('رجوع', 'Back')}
                </button>
                <div className="font-cairo text-[13px] font-semibold text-[#9CA3AF]">
                  {secondsLeft > 0 ? (
                    <span>
                      {tr(
                        `لم تستلم الرمز؟ يمكن الإرسال مجدداً خلال ${secondsLeft} ث`,
                        `Didn't get the code? Resend in ${secondsLeft}s`,
                      )}
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
                          toast(
                            tr(
                              'تم إرسال رمز تحقّق جديد.',
                              'A new verification code was sent.',
                            ),
                            {
                              title: tr('أُعيد الإرسال', 'Code resent'),
                              variant: 'success',
                              durationMs: 3200,
                            },
                          );
                        } catch (error) {
                          const formatted = formatVerifyFlowError(error);
                          setFlowError(formatted);
                          toast(
                            formatted.replace(/\s+/g, ' ').trim().slice(0, 220),
                            {
                              title: tr(
                                'تعذّر إعادة الإرسال',
                                'Resend failed',
                              ),
                              variant: 'error',
                              durationMs: 4800,
                            },
                          );
                        } finally {
                          setIsResending(false);
                        }
                      }}
                      className="text-primary transition-colors hover:text-[#14B3AE] disabled:opacity-60"
                    >
                      {isResending
                        ? tr('جاري الإرسال…', 'Sending…')
                        : tr('إعادة إرسال الرمز', 'Resend code')}
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
