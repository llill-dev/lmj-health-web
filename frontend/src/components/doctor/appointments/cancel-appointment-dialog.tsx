'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const cancelAppointmentSchema = z.object({
  medicalNotes: z.string().min(1, 'هذا الحقل مطلوب'),
});

type CancelAppointmentFormValues = z.infer<typeof cancelAppointmentSchema>;

export default function CancelAppointmentDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onConfirm: (medicalNotes: string) => void | Promise<void>;
  confirmDisabled?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CancelAppointmentFormValues>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: {
      medicalNotes: '',
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
        if (!next) reset({ medicalNotes: '' });
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

                <Dialog.Title className='text-right font-cairo text-[24px] font-extrabold leading-[30px] text-[#101828]'>
                  إنهاء الموعد
                </Dialog.Title>

                <div className='mt-10 text-right'>
                  <div className='font-cairo text-[14px] font-bold text-[#101828]'>
                    المريض
                  </div>
                  <div className='mt-1 font-cairo text-[16px] font-extrabold text-[#101828]'>
                    {patientName}
                  </div>
                </div>

                <div className='mt-7'>
                  <div className='mb-2 text-right font-cairo text-[14px] font-extrabold text-[#101828]'>
                    الملاحظات الطبية:
                    <span className='ms-1 text-[#F04438]'>*</span>
                  </div>
                  <textarea
                    {...register('medicalNotes')}
                    placeholder='اكتب التشخيص والملاحظات الطبية هنا...'
                    className='min-h-[120px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                    required
                  />
                </div>

                <div className='mt-8 grid grid-cols-2 gap-4 pb-7'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[46px] w-full rounded-[10px] border border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#F04438]'
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>

                  <button
                    type='button'
                    disabled={confirmDisabled || isSubmitting}
                    onClick={handleSubmit(async (values) => {
                      await onConfirm(values.medicalNotes.trim());
                      onOpenChange(false);
                      reset({ medicalNotes: '' });
                    })}
                    className='flex h-[46px] w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)] disabled:opacity-60'
                  >
                    <span>حفظ وإنهاء</span>
                    <Check className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
