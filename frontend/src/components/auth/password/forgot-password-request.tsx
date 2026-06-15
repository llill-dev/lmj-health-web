'use client';

import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import PasswordResetShell from '@/components/auth/password/PasswordResetShell';
import { SIGNUP_EMAIL_INVALID_MESSAGE_AR } from '@/components/auth/signUp/signup-schemas';
import { isValidAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';

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
      if (!isValidAuthPhoneIdentifier(val.identifier)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message:
            'أدخل رقم هاتف صحيح بصيغة دولية مثل +963912345678 أو 009639912345678',
        });
      }
    }
  });

type RequestValues = z.infer<typeof requestSchema>;

export default function ForgotPasswordRequest({
  onBack,
  onSubmit,
  submitLabel = 'إرسال رمز التحقق',
  defaultMethod = 'email',
  defaultIdentifier = '',
  variant = 'reset',
  title,
  subtitle,
}: {
  onBack: () => void;
  onSubmit: (values: RequestValues) => void | Promise<void>;
  submitLabel?: string;
  defaultMethod?: IdentityMethod;
  defaultIdentifier?: string;
  variant?: 'reset' | 'plain';
  title?: string;
  subtitle?: string;
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
    () =>
      method === 'phone' ? '+963912345678' : 'patient1@example.com',
    [method],
  );

  const sectionTitle = useMemo(
    () =>
      method === 'phone' ? 'أدخل رقم هاتفك' : 'أدخل بريدك الإلكتروني',
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

  const formBody = (
    <>
      <div className='text-center'>
        <h2 className='font-cairo text-[15px] font-extrabold text-[#1F2937]'>
          {sectionTitle}
        </h2>
        <p className='mt-1 font-cairo text-[13px] font-semibold text-[#667085]'>
          سنرسل لك رمز التحقق للتأكد من هويتك
        </p>
      </div>

      <div className='relative mt-5 flex h-[38px] w-full rounded-[8px] bg-[#F2F4F7] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.08)]'>
        <div className='relative flex flex-1'>
          {method === 'phone' ? (
            <motion.div
              layoutId='resetMethodPill'
              className='absolute inset-0 rounded-[6px] bg-primary'
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
            />
          ) : null}
          <button
            type='button'
            onClick={() => switchMethod('phone')}
            className={
              method === 'phone'
                ? 'relative z-10 flex-1 rounded-[6px] font-cairo text-[13px] font-bold text-white'
                : 'relative z-10 flex-1 rounded-[6px] font-cairo text-[13px] font-bold text-[#667085]'
            }
          >
            رقم الهاتف
          </button>
        </div>
        <div className='relative flex flex-1'>
          {method === 'email' ? (
            <motion.div
              layoutId='resetMethodPill'
              className='absolute inset-0 rounded-[6px] bg-primary'
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
            />
          ) : null}
          <button
            type='button'
            onClick={() => switchMethod('email')}
            className={
              method === 'email'
                ? 'relative z-10 flex-1 rounded-[6px] font-cairo text-[13px] font-bold text-white'
                : 'relative z-10 flex-1 rounded-[6px] font-cairo text-[13px] font-bold text-[#667085]'
            }
          >
            البريد الإلكتروني
          </button>
        </div>
      </div>

      <form
        onSubmit={submit}
        className='mt-5'
        noValidate
      >
        <label className='mb-2 block text-right font-cairo text-[14px] font-bold text-[#101828]'>
          {methodLabel}
        </label>

        <AnimatePresence
          mode='wait'
          initial={false}
        >
          <motion.div
            key={method}
            initial={{ opacity: 0, x: 16 * methodDirection }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 * methodDirection }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className='flex h-[40px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F3F3F5] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.06)]'>
              <MethodIcon
                className='h-4 w-4 shrink-0 text-[#98A2B3]'
                aria-hidden
              />
              <input
                dir='ltr'
                type={method === 'email' ? 'email' : 'tel'}
                inputMode={method === 'phone' ? 'tel' : 'email'}
                placeholder={methodPlaceholder}
                autoComplete={method === 'email' ? 'email' : 'tel'}
                {...register('identifier')}
                className='h-full w-full bg-transparent px-3 text-right font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div
          className={`mt-2 min-h-[20px] text-right font-cairo text-[12px] font-semibold leading-snug ${inlineError ? 'text-[#D92D20]' : 'text-transparent'}`}
          aria-live='polite'
        >
          {inlineError ?? '\u00A0'}
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='mt-2 flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.32)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60'
        >
          <span>{isSubmitting ? 'جارٍ الإرسال…' : submitLabel}</span>
          <ArrowLeft
            className='h-4 w-4 shrink-0'
            aria-hidden
          />
        </button>

        <button
          type='button'
          onClick={onBack}
          className='mt-5 w-full font-cairo text-[13px] font-semibold text-primary transition-colors hover:text-[#14B3AE]'
        >
          العودة لتسجيل الدخول
        </button>
      </form>
    </>
  );

  if (variant === 'plain') {
    return (
      <section className='mx-auto flex w-full max-w-[520px] flex-col items-center px-4'>
        <div className='my-[35px]'>
          <img
            src='/images/syr-health-logo.png'
            alt='LMJ Health'
            width={226}
            height={120}
            className='max-h-[120px]'
            loading='eager'
          />
        </div>
        <div className='w-full rounded-[12px] bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.12)] sm:px-8'>
          {formBody}
        </div>
      </section>
    );
  }

  return (
    <PasswordResetShell
      step={1}
      title={title}
      subtitle={subtitle}
    >
      {formBody}
    </PasswordResetShell>
  );
}
