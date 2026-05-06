'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export type BookAppointmentValues = {
  patientId: string;
  date: string;
  time: string;
  consultationType: 'clinic' | 'video';
  notes?: string;
};

const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'يرجى اختيار المريض'),
  date: z
    .string()
    .min(1, 'يرجى اختيار التاريخ')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة'),
  time: z
    .string()
    .min(1, 'يرجى اختيار الوقت')
    .regex(/^\d{2}:\d{2}/, 'صيغة الوقت غير صحيحة'),
  consultationType: z.enum(['clinic', 'video']),
  notes: z.string().max(500, 'الحد الأقصى للملاحظات 500 حرف').optional(),
});

type BookAppointmentFormValues = z.infer<typeof bookAppointmentSchema>;

export default function BookAppointmentDialog({
  open,
  onOpenChange,
  patients,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: { id: string; name: string }[];
  onSubmit: (values: BookAppointmentValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BookAppointmentFormValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      patientId: '',
      date: '',
      time: '',
      consultationType: 'clinic',
      notes: '',
    },
  });

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
        if (!next)
          reset({
            patientId: '',
            date: '',
            time: '',
            consultationType: 'clinic',
            notes: '',
          });
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          asChild
        >
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transition: { duration: 0.22, ease: 'easeOut' },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.22, ease: 'easeOut' },
                pointerEvents: 'none',
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>

        <Dialog.Content
          forceMount
          asChild
        >
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transition: { duration: 0.18, ease: 'easeOut' },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.18, ease: 'easeOut' },
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
                  transition: { duration: 0.22, ease: 'easeOut' },
                },
              }}
              style={{ transformOrigin: 'center' }}
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

                <Dialog.Title className='text-center font-cairo text-[20px] font-extrabold leading-[26px] text-[#111827]'>
                  حجز موعد جديد
                </Dialog.Title>
              </div>

              <div className='mt-6 h-px w-full bg-[#EEF2F6]' />

              <form
                className='px-8 pb-7 pt-7'
                onSubmit={handleSubmit((values) => {
                  onSubmit({
                    patientId: values.patientId,
                    date: values.date,
                    time: values.time,
                    consultationType: values.consultationType,
                    notes: values.notes?.trim()
                      ? values.notes.trim()
                      : undefined,
                  });
                  onOpenChange(false);
                  reset({
                    patientId: '',
                    date: '',
                    time: '',
                    consultationType: 'clinic',
                    notes: '',
                  });
                })}
              >
                <div className='space-y-5'>
                  <div>
                    <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      اختر المريض
                    </div>
                    <div className='relative'>
                      <select
                        {...register('patientId')}
                        className={`h-[46px] w-full appearance-none rounded-[12px] border-[1.82px] ${errors.patientId ? 'border-[#F04438]' : 'border-primary'} bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none`}
                      >
                        <option
                          value=''
                          disabled
                        >
                          اختر...
                        </option>
                        {patients.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                        <ChevronDown className='h-4 w-4' />
                      </div>
                    </div>
                    {errors.patientId ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.patientId.message}
                      </div>
                    ) : null}
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                        الوقت
                      </div>
                      <input
                        type='time'
                        {...register('time')}
                        className={`h-[46px] w-full rounded-[12px] border-[1.82px] ${errors.time ? 'border-[#F04438]' : 'border-primary'} bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none`}
                      />
                      {errors.time ? (
                        <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                          {errors.time.message}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                        التاريخ
                      </div>
                      <input
                        type='date'
                        {...register('date')}
                        className={`h-[46px] w-full rounded-[12px] border-[1.82px] ${errors.date ? 'border-[#F04438]' : 'border-primary'} bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none`}
                      />
                      {errors.date ? (
                        <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                          {errors.date.message}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      نوع الاستشارة
                    </div>
                    <div className='relative'>
                      <select
                        {...register('consultationType')}
                        className={`h-[46px] w-full appearance-none rounded-[12px] border-[1.82px] ${errors.consultationType ? 'border-[#F04438]' : 'border-primary'} bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none`}
                      >
                        <option value='clinic'>حضوري</option>
                        <option value='video'>أونلاين</option>
                      </select>
                      <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                        <ChevronDown className='h-4 w-4' />
                      </div>
                    </div>
                    {errors.consultationType ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.consultationType.message}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      ملاحظات (اختياري)
                    </div>
                    <textarea
                      {...register('notes')}
                      placeholder='أضف أي ملاحظات...'
                      className={`min-h-[96px] w-full resize-none rounded-[12px] border-[1.82px] ${errors.notes ? 'border-[#F04438]' : 'border-primary'} bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]`}
                    />
                    {errors.notes ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.notes.message}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className='mt-7 grid grid-cols-2 gap-4'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[46px] w-full rounded-[10px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#344054]'
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>

                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='h-[46px] w-full rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)]'
                  >
                    تأكيد الحجز
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
