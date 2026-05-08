'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  fullName: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(8, 'رقم الهاتف غير صالح'),
});

type Values = z.infer<typeof schema>;

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
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
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
        <Dialog.Content forceMount asChild>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{
              opacity: open ? 1 : 0,
              y: open ? 0 : 16,
              scale: open ? 1 : 0.98,
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[640px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
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
                هذا الإجراء يستخدم المسار الموثق `POST /doctors/patients/temp`.
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
                    <input
                      {...register('phone')}
                      className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none'
                    />
                    {errors.phone ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.phone.message}
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
      </Dialog.Portal>
    </Dialog.Root>
  );
}
