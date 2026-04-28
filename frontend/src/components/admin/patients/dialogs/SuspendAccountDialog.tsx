'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Ban, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { patch } from '@/lib/base';
import { adminApi } from '@/lib/admin/client';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';

const schema = z.object({
  reason: z.string().trim().min(1, 'سبب التعليق مطلوب'),
});

type Values = z.infer<typeof schema>;

function endpointFor(kind: 'patient' | 'doctor' | 'secretary', id: string) {
  // ABI لم يذكر بشكل صريح "تعليق الحساب" لهذه الكيانات في الأقسام التي قرأناها،
  // لذلك نعتمد naming شائع ويمكن تعديله لاحقًا بسهولة بمكان واحد.
  return `/api/admin/${kind}s/${encodeURIComponent(id)}/status`;
}

export default function SuspendAccountDialog({
  open,
  onOpenChange,
  kind,
  targetId,
  targetLabel,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'patient' | 'doctor' | 'secretary';
  targetId: string | null;
  targetLabel: string;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const defaultValues = useMemo(() => ({ reason: '' }), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDone(null);

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
            className='fixed left-1/2 top-1/2 z-[10000] w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
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

              <Dialog.Title className='text-right font-cairo text-[22px] font-extrabold leading-[28px] text-[#101828]'>
                تعليق الحساب
              </Dialog.Title>

              <div className='mt-3 font-cairo text-[12px] font-semibold text-[#667085]'>
                الهدف: <span className='font-extrabold text-[#111827]'>{targetLabel}</span>
              </div>

              <form
                className='mt-6 space-y-4'
                onSubmit={handleSubmit(async (values) => {
                  setError(null);
                  setDone(null);
                  if (!targetId) return;

                  try {
                    if (kind === 'patient') {
                      await adminApi.patients.suspend(targetId, values.reason);
                    } else {
                      await patch(endpointFor(kind, targetId), {
                        status: 'suspended',
                        reason: values.reason,
                      });
                    }
                    setDone('تم تعليق الحساب بنجاح');
                    if (kind === 'patient') {
                      toast(
                        `تم تعليق حساب المريض «${targetLabel}». لن يتمكّن من تسجيل الدخول حتى تُعاد مزامنة الحساب من الإدارة.`,
                        {
                          title: 'تعليق الحساب',
                          variant: 'warning',
                          durationMs: 4500,
                        },
                      );
                    } else {
                      toast(
                        `تم تعليق الحساب «${targetLabel}». يرتبط الوصول بسياسات الإدارة لكل دور.`,
                        {
                          title: 'تعليق الحساب',
                          variant: 'warning',
                          durationMs: 4200,
                        },
                      );
                    }
                    onSuccess?.();
                    setTimeout(() => onOpenChange(false), 900);
                  } catch (e: any) {
                    setError(
                      userFacingErrorMessage(e, 'فشل تعليق الحساب'),
                    );
                  }
                })}
              >
                <div>
                  <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]'>
                    سبب التعليق:
                    <span className='ms-1 text-[#F04438]'>*</span>
                  </div>
                  <textarea
                    {...register('reason')}
                    placeholder='اكتب سبب التعليق...'
                    className='min-h-[110px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                    required
                  />
                </div>

                {error ? (
                  <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#991B1B]'>
                    {error}
                  </div>
                ) : null}

                {done ? (
                  <div className='rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 font-cairo text-[13px] font-bold text-[#166534]'>
                    {done}
                  </div>
                ) : null}

                <div className='mt-2 flex items-center justify-end gap-3'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[40px] rounded-[10px] border border-[#E5E7EB] bg-white px-7 font-cairo text-[12px] font-extrabold text-[#111827]'
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    type='submit'
                    disabled={isSubmitting || !targetId}
                    className='inline-flex h-[40px] items-center gap-2 rounded-[10px] border border-[#FB923C] bg-white px-7 font-cairo text-[12px] font-extrabold text-[#F97316] disabled:opacity-60'
                  >
                    <Ban className='h-4 w-4' />
                    تعليق
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

