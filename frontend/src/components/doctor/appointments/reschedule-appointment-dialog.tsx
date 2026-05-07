'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { CalendarDays, Clock3, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const rescheduleSchema = z.object({
  date: z.string().min(1, 'يرجى اختيار التاريخ'),
  startTime: z.string().min(1, 'يرجى اختيار الوقت'),
  reason: z.string().max(500, 'الحد الأقصى 500 حرف').optional(),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

export default function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  patientName,
  initialDate,
  initialTime,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  initialDate?: string;
  initialTime?: string;
  onConfirm: (values: {
    date: string;
    startTime: string;
    reason?: string;
  }) => void | Promise<void>;
  confirmDisabled?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: initialDate ?? '',
      startTime: initialTime ?? '',
      reason: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      date: initialDate ?? '',
      startTime: initialTime ?? '',
      reason: '',
    });
  }, [initialDate, initialTime, open, reset]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          reset({
            date: initialDate ?? '',
            startTime: initialTime ?? '',
            reason: '',
          });
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none',
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none',
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[680px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 520, damping: 38 },
                },
                closed: {
                  opacity: 0,
                  y: 24,
                  scale: 0.96,
                },
              }}
            >
              <div className='relative px-8 pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-right font-cairo text-[24px] font-extrabold leading-[30px] text-[#101828]'>
                  إعادة جدولة الموعد
                </Dialog.Title>

                <div className='mt-8 text-right font-cairo text-[16px] font-extrabold text-[#101828]'>
                  {patientName}
                </div>

                <form
                  className='mt-8 space-y-5 pb-7'
                  onSubmit={handleSubmit(async (values) => {
                    await onConfirm({
                      date: values.date,
                      startTime: values.startTime,
                      reason: values.reason?.trim() || undefined,
                    });
                    onOpenChange(false);
                  })}
                >
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-2 flex items-center gap-2 text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                        <CalendarDays className='h-4 w-4 text-primary' />
                        التاريخ الجديد
                      </label>
                      <input
                        type='date'
                        {...register('date')}
                        className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                      />
                      {errors.date ? (
                        <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                          {errors.date.message}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label className='mb-2 flex items-center gap-2 text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                        <Clock3 className='h-4 w-4 text-primary' />
                        الوقت الجديد
                      </label>
                      <input
                        type='time'
                        {...register('startTime')}
                        className='h-[46px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                      />
                      {errors.startTime ? (
                        <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                          {errors.startTime.message}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className='mb-2 block text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                      سبب إعادة الجدولة
                    </label>
                    <textarea
                      {...register('reason')}
                      placeholder='اختياري...'
                      className='min-h-[110px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]'
                    />
                    {errors.reason ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.reason.message}
                      </div>
                    ) : null}
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='h-[46px] w-full rounded-[10px] border border-[#D0D5DD] bg-white font-cairo text-[14px] font-extrabold text-[#344054]'
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>

                    <button
                      type='submit'
                      disabled={confirmDisabled || isSubmitting}
                      className='h-[46px] w-full rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.25)] disabled:opacity-60'
                    >
                      حفظ الموعد الجديد
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
