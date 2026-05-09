'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  SIGNUP_PHONE_DIAL_OPTIONS,
  normalizePhoneLocalDigits,
  validatePhoneByDialCode,
} from '@/components/auth/signUp/signup-schemas';

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
  const {
    register,
    handleSubmit,
    reset,
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
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
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
              className='pointer-events-auto box-border max-h-[min(calc(100dvh-2rem),900px)] w-full max-w-[640px] shrink-0 origin-center overflow-y-auto overscroll-contain rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
              dir='rtl'
              lang='ar'
            >
              <div className='relative px-8 pb-7 pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-right font-cairo text-[22px] font-extrabold text-[#101828]'>
                  إضافة مريض مؤقت
                </Dialog.Title>
                <p className='mt-2 text-right font-cairo text-[13px] font-semibold text-[#667085]'>
                  هذا الإجراء يستخدم المسار الموثق
                  <span dir='ltr'> POST /doctors/patients/temp</span>.
                </p>

                <form
                  className='mt-7 space-y-4'
                  onSubmit={handleSubmit(async (values) => {
                    await onSubmit(values);
                    onOpenChange(false);
                    reset();
                  })}
                >
                  <div>
                    <label className='mb-2 block text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                      الاسم الكامل
                    </label>
                    <input
                      {...register('fullName')}
                      className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none'
                    />
                    {errors.fullName ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.fullName.message}
                      </div>
                    ) : null}
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='mb-2 block text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                        البريد الإلكتروني
                      </label>
                      <input
                        type='email'
                        {...register('email')}
                        className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none'
                      />
                      {errors.email ? (
                        <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                          {errors.email.message}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label className='mb-2 block text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                        رقم الهاتف
                      </label>
                      <div className='grid grid-cols-[145px,minmax(0,1fr)] gap-2'>
                        <select
                          {...register('phoneDialCode')}
                          className='h-[46px] rounded-[12px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none'
                        >
                          {SIGNUP_PHONE_DIAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          {...register('phoneLocal')}
                          inputMode='numeric'
                          placeholder='912345678'
                          className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none'
                        />
                      </div>
                      <p className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#667085]'>
                        أدخل الرقم المحلي بدون الصفر الأول. سيتم إرساله بصيغة
                        دولية مثل <span dir='ltr'>+963912345678</span>.
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

                  <div className='grid grid-cols-2 gap-4 pt-2'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='h-[46px] rounded-[10px] border border-[#D0D5DD] bg-white font-cairo text-[14px] font-extrabold text-[#344054]'
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>
                    <button
                      type='submit'
                      disabled={busy || isSubmitting}
                      className='h-[46px] rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.25)] disabled:opacity-60'
                    >
                      حفظ وربط
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
