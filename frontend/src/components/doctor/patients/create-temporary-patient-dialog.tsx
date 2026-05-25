'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Phone, UserRound, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import StyledSelect from '@/components/ui/styled-select';
import { useToast } from '@/components/ui/ToastProvider';
import {
  SIGNUP_PHONE_DIAL_OPTIONS,
  normalizePhoneLocalDigits,
  validatePhoneByDialCode,
} from '@/components/auth/signUp/signup-schemas';
import { cn } from '@/lib/utils/utils';
import { resolveCreateTemporaryPatientServerFeedback } from '@/lib/doctor/temporaryPatientFormErrors';

const TEMP_PATIENT_PHONE_DIAL_CODES = SIGNUP_PHONE_DIAL_OPTIONS.map(
  (option) => option.value,
) as [string, ...string[]];

const tempPatientSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'الاسم مطلوب')
      .max(200, 'الاسم طويل جداً'),
    email: z
      .string()
      .trim()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('البريد الإلكتروني غير صالح'),
    phoneDialCode: z.enum(TEMP_PATIENT_PHONE_DIAL_CODES, {
      message: 'اختر رمز دولة صحيحاً',
    }),
    phoneLocal: z
      .string()
      .trim()
      .min(1, 'رقم الهاتف مطلوب')
      .regex(/^\d+$/, 'أدخل أرقاماً فقط بدون مسافات أو رمز الدولة'),
  })
  .superRefine((data, ctx) => {
    const local = normalizePhoneLocalDigits(data.phoneLocal);

    if (!local.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'أدخل الرقم المحلي بدون الصفر الأول',
        path: ['phoneLocal'],
      });
      return;
    }

    const phoneError = validatePhoneByDialCode(
      data.phoneDialCode as Parameters<typeof validatePhoneByDialCode>[0],
      data.phoneLocal,
    );
    if (phoneError && phoneError !== 'أدخل رقم الهاتف بدون رمز الدولة') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: phoneError,
        path: ['phoneLocal'],
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
  'h-[50px] w-full rounded-[14px] border bg-white px-4 ps-8 font-cairo text-[13px] font-bold text-[#101828] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3]';
const inputNormalBorder =
  'border-[#E4E7EC] hover:border-primary/35 focus-visible:border-primary focus-visible:bg-[#FAFFFE] focus-visible:shadow-[0_0_0_4px_rgba(15,143,139,0.11),inset_0_1px_2px_rgba(0,0,0,0.03)]';
const inputInvalidBorder =
  'border-[#F04438] bg-[#FFFBFB] shadow-[inset_0_1px_2px_rgba(240,68,56,0.06)] ring-2 ring-[#FECDCA]/70 focus-visible:border-[#F04438] focus-visible:shadow-[0_0_0_4px_rgba(240,68,56,0.12)]';

export default function CreateTemporaryPatientDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Values) => void | Promise<void>;
  busy?: boolean;
}) {
  const { toast } = useToast();
  const dialListboxOutletRef = useRef<HTMLDivElement | null>(null);

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
      fullName: '',
      email: '',
      phoneDialCode: '+963',
      phoneLocal: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    clearErrors();
  }, [open, clearErrors]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            className='fixed inset-0 z-[9999] bg-slate-900/55 backdrop-blur-[3px]'
          />
        </Dialog.Overlay>
        <div
          dir='ltr'
          className='pointer-events-none fixed inset-0 z-[10000] box-border grid place-items-center p-4 sm:p-6'
        >
          <Dialog.Content forceMount asChild>
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{
                opacity: open ? 1 : 0,
                y: open ? 0 : 16,
                scale: open ? 1 : 0.98,
              }}
              className='pointer-events-auto relative box-border w-full max-w-[min(96vw,920px)] shrink-0 origin-center overflow-visible rounded-[22px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFFFE] via-white to-[#F8FAFC] shadow-[0_24px_64px_-12px_rgba(15,23,42,0.22),0_0_1px_rgba(15,143,139,0.08)] outline-none'
              dir='rtl'
              lang='ar'
            >
              <div
                ref={dialListboxOutletRef}
                className='pointer-events-none absolute inset-0 z-[120] isolate overflow-visible'
                style={{ contain: 'layout' }}
              />
              <div className='relative flex flex-col'>
                <div
                  aria-hidden
                  className='h-[4px] w-full shrink-0 bg-gradient-to-l from-[#0F766E] via-primary to-[#5EEAD4]'
                />

                <div className='relative shrink-0 border-b border-[#EEF2F6] px-6 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-6'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white/90 text-[#667085] shadow-sm transition-colors hover:bg-[#F9FAFB] hover:text-[#344054]'
                      aria-label='إغلاق'
                    >
                      <X className='w-5 h-5' strokeWidth={2.25} />
                    </button>
                  </Dialog.Close>

                  <div className='flex gap-2 text-right'>
                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-[0_10px_24px_rgba(15,143,139,0.12)]'>
                      <UserRound
                        className='w-7 h-7 text-primary'
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    <div className='flex-1 min-w-0 ps-2'>
                      <Dialog.Title className='font-cairo text-[clamp(1.15rem,2.8vw,1.45rem)] font-black tracking-tight text-[#101828]'>
                        إضافة مريض مؤقت
                      </Dialog.Title>
                      <p className='mt-1.5 font-cairo text-[12.5px] font-semibold leading-relaxed text-[#667085]'>
                        أنشئ سجلاً مؤقتاً واربطه بحسابك لمواصلة الزيارات والتواصل.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='relative overflow-visible px-6 py-5 sm:px-8 sm:py-5'>
                  {errors.root?.message ? (
                    <div
                      role='alert'
                      className='mb-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3.5 text-right font-cairo text-[13px] font-semibold leading-relaxed text-[#B42318] shadow-sm'
                    >
                      {errors.root.message}
                    </div>
                  ) : null}

                  <form
                    className='flex flex-col gap-5'
                    onSubmit={handleSubmit(async (values) => {
                      clearErrors();
                      try {
                        await onSubmit(values);
                        onOpenChange(false);
                        reset();
                      } catch (err: unknown) {
                        const fb =
                          resolveCreateTemporaryPatientServerFeedback(err);
                        toast(fb.toastMessage, {
                          title: 'تعذّر إنشاء المريض المؤقت',
                          variant: 'error',
                          durationMs: Math.min(
                            10500,
                            Math.max(
                              5200,
                              Math.round(fb.toastMessage.length * 42),
                            ),
                          ),
                        });
                        (
                          [
                            'fullName',
                            'email',
                            'phoneLocal',
                            'phoneDialCode',
                          ] as const
                        ).forEach((name) => {
                          const msg = fb.fields[name];
                          if (msg)
                            setError(name, { type: 'server', message: msg });
                        });
                        if (fb.rootBanner)
                          setError('root', {
                            type: 'server',
                            message: fb.rootBanner,
                          });
                      }
                    })}
                >
                  <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6'>
                  <section className='rounded-[18px] border border-[#E6F7F6] bg-white/95 p-4 shadow-[0_10px_32px_rgba(15,143,139,0.07)]'>
                    <p className='mb-3 text-right font-cairo text-[12px] font-black tracking-wide text-primary'>
                      خطوة ١ — الهوية
                    </p>
                    <label
                      htmlFor='temp-patient-fullname'
                      className='mb-2 flex items-center justify-start gap-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                    >
                      الاسم الكامل
                    </label>
                    <div className='relative'>
                      <UserRound
                        className='pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary/65'
                        aria-hidden
                      />
                      <input
                        id='temp-patient-fullname'
                        autoComplete='name'
                        placeholder='مثال: سارة عبد الله العلي'
                        {...register('fullName')}
                        className={cn(
                          inputBaseClass,
                          errors.fullName ? inputInvalidBorder : inputNormalBorder,
                        )}
                        aria-invalid={Boolean(errors.fullName)}
                      />
                    </div>
                    {errors.fullName ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.fullName.message}
                      </div>
                    ) : null}
                  </section>

                  <section className='rounded-[18px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFBFC] to-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]'>
                    <p className='mb-3 text-right font-cairo text-[12px] font-black tracking-wide text-[#475467]'>
                      خطوة ٢ — التواصل
                    </p>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4'>
                      <div>
                        <label
                          htmlFor='temp-patient-email'
                          className='mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]'
                        >
                          البريد الإلكتروني
                        </label>
                        <div className='relative'>
                          <Mail
                            className='pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary/60'
                            aria-hidden
                          />
                          <input
                            id='temp-patient-email'
                            type='email'
                            dir='ltr'
                            autoComplete='email'
                            placeholder='patient@example.com'
                            {...register('email')}
                            className={cn(
                              inputBaseClass,
                              'text-left',
                              errors.email ? inputInvalidBorder : inputNormalBorder,
                            )}
                            aria-invalid={Boolean(errors.email)}
                          />
                        </div>
                        {errors.email ? (
                          <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                            {errors.email.message}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <label
                          htmlFor='temp-patient-phone-local'
                          className='mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#344054]'
                        >
                          رقم الهاتف
                        </label>
                        <div
                          className={cn(
                            'overflow-hidden rounded-[14px] border bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow]',
                            errors.phoneLocal || errors.phoneDialCode
                              ? 'border-[#F04438] ring-2 ring-[#FECDCA]/70'
                              : 'border-[#E4E7EC] hover:border-primary/35 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(15,143,139,0.11)]',
                          )}
                        >
                          <div className='grid grid-cols-1 gap-0 sm:grid-cols-[minmax(132px,150px)_1fr]'>
                            <div className='border-b border-[#EEF2F6] bg-[#FAFBFC] p-2 sm:border-b-0 sm:border-e sm:border-[#EEF2F6] sm:min-h-[50px]'>
                              <Controller
                                name='phoneDialCode'
                                control={control}
                                render={({ field }) => (
                                  <StyledSelect
                                    className='w-full min-w-0'
                                    triggerClassName='rounded-[11px]'
                                    options={SIGNUP_PHONE_DIAL_OPTIONS.map((option) => ({
                                      value: option.value,
                                      label: option.label,
                                    }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    size='sm'
                                    tone='muted'
                                    listboxAriaLabel='رمز الاتصال'
                                    listboxPortalRef={dialListboxOutletRef}
                                  />
                                )}
                              />
                            </div>
                            <div className='relative flex min-h-[50px] items-stretch'>
                              <Phone
                                className='pointer-events-none absolute right-3 top-1/2 h-[17px] w-[17px] z-[1] -translate-y-1/2 text-primary/55'
                                aria-hidden
                              />
                              <input
                                id='temp-patient-phone-local'
                                {...register('phoneLocal')}
                                inputMode='numeric'
                                dir='ltr'
                                placeholder='912345678'
                                className={cn(
                                  'h-[50px] min-h-[50px] w-full flex-1 border-0 bg-transparent px-4 pe-11 ps-4 font-mono text-[14px] font-semibold tracking-wide text-[#101828]',
                                  'outline-none placeholder:text-[#98A2B3] focus-visible:ring-0',
                                )}
                                aria-invalid={Boolean(
                                  errors.phoneLocal || errors.phoneDialCode,
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <p className='mt-1.5 flex flex-wrap items-center justify-start gap-x-2 text-right font-cairo text-[10.5px] font-semibold leading-snug text-[#667085]'>
                          <span className='inline-flex items-center rounded-lg bg-[#EFF8FF] px-2 py-0.5 text-[10px] font-extrabold text-[#175CD3]'>
                            بدون الصفر الأول
                          </span>
                          <span>
                            يُرسل للخادم بصيغة دولية مثل{' '}
                            <span dir='ltr' className='font-mono text-[#344054]'>
                              +963912345678
                            </span>
                          </span>
                        </p>
                        {errors.phoneLocal ? (
                          <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                            {errors.phoneLocal.message}
                          </div>
                        ) : errors.phoneDialCode ? (
                          <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                            {errors.phoneDialCode.message}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>
                  </div>

                  <div className='flex flex-col-reverse gap-3 pt-1 sm:flex-row-reverse'>
                    <button
                      type='submit'
                      disabled={busy || isSubmitting}
                      className='inline-flex h-[52px] min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#119B94] via-primary to-[#0F766E] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_32px_rgba(15,143,139,0.32)] transition-[transform,box-shadow] active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-[0.62]'
                    >
                      {(busy || isSubmitting) && (
                        <Loader2 className='w-5 h-5 animate-spin shrink-0' aria-hidden />
                      )}
                      حفظ وربط بالعيادة
                    </button>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='inline-flex h-[52px] min-h-[52px] flex-1 items-center justify-center rounded-xl border-2 border-[#E4E7EC] bg-white font-cairo text-[14px] font-extrabold text-[#344054] shadow-sm transition-colors hover:border-[#D0D5DD] hover:bg-[#F9FAFB]'
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>
                  </div>
                </form>
                </div>
              </div>
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
