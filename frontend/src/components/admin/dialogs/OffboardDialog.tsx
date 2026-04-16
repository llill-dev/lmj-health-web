import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminOffboardUser } from '@/hooks/useAdminSecretaries';

const schema = z.object({
  reason: z.string().trim().min(1, 'سبب الإيقاف مطلوب'),
});

type Values = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string | null;
  targetLabel: string;
  onSuccess?: () => void;
};

export default function OffboardDialog({
  open,
  onOpenChange,
  targetUserId,
  targetLabel,
  onSuccess,
}: Props) {
  const [done, setDone] = useState(false);
  const offboard = useAdminOffboardUser();

  const defaultValues = useMemo(() => ({ reason: '' }), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (!open) {
      setDone(false);
      offboard.reset();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    const scrollW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollW > 0) document.body.style.paddingRight = `${scrollW}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = '';
    };
  }, [open]);

  async function onSubmit(values: Values) {
    if (!targetUserId) return;
    try {
      await offboard.mutateAsync({ userId: targetUserId, reason: values.reason });
      setDone(true);
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1400);
    } catch {
      // error shown from offboard.error
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset(defaultValues);
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
              open: { opacity: 1, visibility: 'visible', pointerEvents: 'auto', transition: { duration: 0.22 } },
              closed: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.2 }, transitionEnd: { visibility: 'hidden' } },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
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
              open: { opacity: 1, visibility: 'visible', pointerEvents: 'auto', x: '-50%', y: '-50%', scale: 1, transition: { type: 'spring', stiffness: 520, damping: 38 } },
              closed: { opacity: 0, x: '-50%', y: 'calc(-50% + 20px)', scale: 0.97, pointerEvents: 'none', transition: { duration: 0.18 }, transitionEnd: { visibility: 'hidden' } },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[520px] max-w-[calc(100vw-32px)] rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <div className='px-8 pb-7 pt-7'>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                  aria-label='إغلاق'
                >
                  <X className='h-5 w-5' />
                </button>
              </Dialog.Close>

              {/* icon + title */}
              <div className='flex flex-col items-center gap-3 text-center'>
                <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]'>
                  <AlertTriangle className='h-7 w-7 text-[#DC2626]' />
                </div>
                <Dialog.Title className='font-cairo text-[20px] font-extrabold text-[#101828]'>
                  إيقاف الحساب نهائياً
                </Dialog.Title>
                <Dialog.Description className='font-cairo text-[13px] font-semibold text-[#667085]'>
                  سيتم إيقاف حساب{' '}
                  <span className='font-extrabold text-[#111827]'>{targetLabel}</span>{' '}
                  وإلغاء ارتباطه بالطبيب وإلغاء جميع مواعيده النشطة.
                  <br />
                  <span className='text-[#DC2626]'>هذا الإجراء لا يمكن التراجع عنه.</span>
                </Dialog.Description>
              </div>

              <form
                className='mt-6 space-y-4'
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label className='mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#101828]'>
                    سبب الإيقاف
                    <span className='ms-1 text-[#F04438]'>*</span>
                  </label>
                  <textarea
                    {...register('reason')}
                    placeholder='اكتب سبب إيقاف الحساب...'
                    className='min-h-[100px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none transition focus:border-[#F87171] focus:ring-2 focus:ring-[#FEE2E2] placeholder:font-cairo placeholder:text-[#98A2B3]'
                  />
                  {errors.reason && (
                    <p className='mt-1 text-right font-cairo text-[11px] font-bold text-[#DC2626]'>
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {offboard.error && !done && (
                  <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#991B1B]'>
                    {(offboard.error as Error).message || 'حدث خطأ أثناء إيقاف الحساب'}
                  </div>
                )}

                {done && (
                  <div className='rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 font-cairo text-[12px] font-bold text-[#166534]'>
                    تم إيقاف الحساب بنجاح
                  </div>
                )}

                <div className='flex items-center justify-end gap-3 pt-1'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[40px] rounded-[10px] border border-[#E5E7EB] bg-white px-7 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    type='submit'
                    disabled={isSubmitting || !targetUserId || done}
                    className='inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#DC2626] px-7 font-cairo text-[12px] font-extrabold text-white hover:bg-[#B91C1C] disabled:opacity-60'
                  >
                    <AlertTriangle className='h-4 w-4' />
                    {isSubmitting ? 'جارٍ الإيقاف...' : 'تأكيد الإيقاف'}
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
