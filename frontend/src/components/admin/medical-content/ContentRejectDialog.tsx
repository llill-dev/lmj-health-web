'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  reason: z
    .string()
    .min(4, 'أدخل سبباً واضحاً (4 أحرف على الأقل)')
    .max(2000, 'الحد الأقصى 2000 حرف'),
});

type FormValues = z.infer<typeof schema>;

const overlayOpen = {
  opacity: 1,
  visibility: 'visible' as const,
  pointerEvents: 'auto' as const,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

const overlayClosed = {
  opacity: 0,
  transition: { duration: 0.18, ease: 'easeOut' as const },
  pointerEvents: 'none' as const,
  transitionEnd: { visibility: 'hidden' as const },
};

const panelOpen = {
  opacity: 1,
  visibility: 'visible' as const,
  pointerEvents: 'auto' as const,
  y: 0,
  scale: 1,
  transition: { type: 'spring' as const, stiffness: 420, damping: 32 },
};

const panelClosed = {
  opacity: 0,
  y: 16,
  scale: 0.96,
  pointerEvents: 'none' as const,
  transition: { duration: 0.2, ease: 'easeOut' as const },
  transitionEnd: { visibility: 'hidden' as const },
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  onConfirm: (reason: string) => void | Promise<void>;
  isPending: boolean;
};

export default function ContentRejectDialog({
  open,
  onOpenChange,
  contentTitle,
  onConfirm,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (!open) {
      reset({ reason: '' });
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!isPending) onOpenChange(o);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: overlayOpen, closed: overlayClosed }}
            className='fixed inset-0 z-[10050] bg-black/45 backdrop-blur-[2px]'
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>
        <Dialog.Content
          forceMount
          onOpenAutoFocus={(e) => e.preventDefault()}
          className='fixed left-1/2 top-1/2 z-[10060] w-[min(100vw-1.5rem,460px)] max-h-[min(90vh,520px)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none outline-none'
          dir='rtl'
          lang='ar'
        >
          <Dialog.Description className='sr-only'>
            نموذج لإدخال سبب رفض مراجعة عنصر المحتوى التعليمي.
          </Dialog.Description>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: panelOpen, closed: panelClosed }}
            className='max-h-full w-full overflow-y-auto rounded-[16px] bg-white p-0 shadow-[0_24px_60px_rgba(0,0,0,0.2)]'
          >
            <form
              onSubmit={handleSubmit(async (v) => {
                await onConfirm(v.reason.trim());
              })}
            >
              <div className='flex items-start justify-between border-b border-[#F2F4F7] px-5 py-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600'>
                    <AlertTriangle className='h-5 w-5' />
                  </div>
                  <Dialog.Title className='font-cairo text-[16px] font-extrabold leading-snug text-[#101828]'>
                    رفض المحتوى
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F2F4F7] disabled:opacity-40'
                    aria-label='إغلاق'
                    disabled={isPending}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </Dialog.Close>
              </div>
              <div className='px-5 py-4'>
                <p className='text-right font-cairo text-[13px] font-semibold leading-relaxed text-[#475467]'>
                  سيتم رفض:{' '}
                  <span className='text-[#101828]'>
                    «{contentTitle || '—'}»
                  </span>
                </p>
                <label className='mt-4 block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                  سبب الرفض
                </label>
                <textarea
                  {...register('reason')}
                  rows={4}
                  placeholder='وضّح ما يجب تعديله…'
                  className='mt-1.5 w-full resize-y rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-right font-cairo text-[13px] font-semibold text-[#101828] placeholder:text-[#98A2B3] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
                />
                {errors.reason ? (
                  <p className='mt-1.5 text-right font-cairo text-[11px] font-bold text-red-600'>
                    {errors.reason.message}
                  </p>
                ) : null}
              </div>
              <div className='flex items-center justify-end gap-2 border-t border-[#F2F4F7] px-5 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-10 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-50'
                    disabled={isPending}
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={isPending}
                  className='h-10 rounded-[10px] bg-red-600 px-4 font-cairo text-[12px] font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50'
                >
                  {isPending ? 'جاري الرفض…' : 'تأكيد الرفض'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
