'use client';

import { Mail, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SIGNUP_EMAIL_INVALID_MESSAGE_AR } from '@/components/auth/signUp/signup-schemas';

type IdentityMethod = 'phone' | 'email';

const requestSchema = z
  .object({
    method: z.enum(['phone', 'email']),
    identifier: z.string().min(1, 'هذا الحقل مطلوب'),
  })
  .superRefine((val, ctx) => {
    if (val.method === 'email') {
      const res = z.string().email().safeParse(val.identifier);
      if (!res.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: SIGNUP_EMAIL_INVALID_MESSAGE_AR,
        });
      }
    }

    if (val.method === 'phone') {
      const phone = val.identifier.replace(/[\s-]/g, '');
      const ok = /^\+?[0-9]{7,15}$/.test(phone);
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: 'أدخل رقم هاتف صحيح',
        });
      }
    }
  });

type RequestValues = z.infer<typeof requestSchema>;

export default function ForgotPasswordRequest({
  onBack,
  onSubmit,
  title = 'استعادة كلمة المرور',
  subtitle = 'أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رمز تحقّق لإعادة تعيين كلمة المرور.',
  submitLabel = 'إرسال رمز التحقق',
  defaultMethod = 'email',
  defaultIdentifier = '',
}: {
  onBack: () => void;
  onSubmit: (values: RequestValues) => void | Promise<void>;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  defaultMethod?: IdentityMethod;
  defaultIdentifier?: string;
}) {
  const [method, setMethod] = useState<IdentityMethod>(defaultMethod);
  const [methodDirection, setMethodDirection] = useState<1 | -1>(1);
  const [flowError, setFlowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      method: defaultMethod,
      identifier: defaultIdentifier,
    },
    mode: 'onSubmit',
  });

  const methodLabel = useMemo(
    () => (method === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'),
    [method],
  );

  const methodPlaceholder = useMemo(
    () => (method === 'phone' ? '+963 9XX XXX XXX' : 'example@email.com'),
    [method],
  );

  const MethodIcon = method === 'phone' ? Phone : Mail;

  const switchMethod = (next: IdentityMethod) => {
    if (next === method) return;
    setMethodDirection(next === 'phone' ? 1 : -1);
    setMethod(next);
    setValue('method', next);
    setValue('identifier', '');
    clearErrors('identifier');
    setFlowError(null);
  };

  const submit = handleSubmit(async (values) => {
    setFlowError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'تعذّر إرسال رمز إعادة التعيين. حاول مجدداً.';
      setFlowError(message);
    }
  });

  const inlineError = errors.identifier?.message ?? flowError;

  return (
    <section className="mx-auto flex flex-col items-center px-4">
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

      <div dir="rtl" lang="ar" className="relative">
        <div className="relative w-fit">
          <div className="pointer-events-none absolute -right-[100px] -top-[70px] z-10">
            <div className="relative h-44 w-44">
              <div className="absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="py-6 font-cairo text-[22px] font-bold leading-[24px] text-[#1F2937]">
              {title}
            </h1>
            <p className="mx-auto max-w-md font-cairo text-[14px] font-semibold leading-relaxed text-[#6B7280]">
              {subtitle}
            </p>
          </div>

          <form
            onSubmit={submit}
            className="mt-8 w-[557px] rounded-[6px] border-[1.9px] border-[#E5E7EB] bg-white px-[108px] py-[28px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => switchMethod('email')}
                className={`rounded-[8px] px-4 py-2 font-cairo text-[13px] font-bold transition-colors ${
                  method === 'email'
                    ? 'bg-primary text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-primary'
                }`}
              >
                بريد إلكتروني
              </button>
              <button
                type="button"
                onClick={() => switchMethod('phone')}
                className={`rounded-[8px] px-4 py-2 font-cairo text-[13px] font-bold transition-colors ${
                  method === 'phone'
                    ? 'bg-primary text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-primary'
                }`}
              >
                واتساب
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={method}
                initial={{ opacity: 0, x: 20 * methodDirection }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 * methodDirection }}
                transition={{ duration: 0.18 }}
              >
                <label className="block text-right font-cairo text-[14px] font-bold leading-[24px] text-[#1F2937]">
                  {methodLabel}
                </label>
                <div className="mt-2 flex h-[36px] items-center rounded-[6px] border-[1.82px] border-[#E5E7EB] bg-[#F3F4F6] px-[12px] py-[4px] shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                  <MethodIcon className="h-4 w-4 shrink-0 text-[#98A2B3]" />
                  <input
                    type={method === 'email' ? 'email' : 'tel'}
                    placeholder={methodPlaceholder}
                    autoComplete={method === 'email' ? 'email' : 'tel'}
                    {...register('identifier')}
                    className="h-full w-full bg-transparent px-3 font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div
              className={`mt-2 min-h-[18px] text-right font-cairo text-[12px] font-semibold ${inlineError ? 'text-red-500' : 'text-transparent'}`}
              aria-live="polite"
            >
              {inlineError ?? '\u00A0'}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60"
            >
              {isSubmitting ? 'جاري الإرسال…' : submitLabel}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="mt-6 w-full font-cairo text-[14px] font-semibold text-[#6B7280] transition-colors hover:text-primary"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
