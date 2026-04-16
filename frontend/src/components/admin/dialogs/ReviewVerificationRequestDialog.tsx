'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { CheckCheck, X, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/admin/client';

const approveSchema = z.object({
  adminNote: z.string().trim().min(1, 'هذا الحقل مطلوب'),
  clinicLat: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  clinicLng: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  verifyLocation: z.boolean().optional(),
});

const rejectSchema = z.object({
  adminNote: z.string().trim().min(1, 'سبب الرفض مطلوب'),
});

type Mode = 'approve' | 'reject' | 'map';

export default function ReviewVerificationRequestDialog({
  open,
  onOpenChange,
  onReviewed,
  requestId,
  doctorName,
  lat,
  lng,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed?: () => void | Promise<void>;
  requestId: string | null;
  doctorName: string;
  lat?: string;
  lng?: string;
  mode: Mode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const schema = useMemo(() => {
    if (mode === 'reject') return rejectSchema;
    if (mode === 'approve') return approveSchema;
    return z.object({});
  }, [mode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'approve'
        ? {
            adminNote: '',
            clinicLat: lat ?? '',
            clinicLng: lng ?? '',
            verifyLocation: true,
          }
        : mode === 'reject'
          ? { adminNote: '' }
          : {},
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

  const title =
    mode === 'approve'
      ? 'قبول طلب التحقق'
      : mode === 'reject'
        ? 'رفض طلب التحقق'
        : 'عرض الخريطة';

  const Icon =
    mode === 'approve' ? CheckCheck : mode === 'reject' ? X : MapPin;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
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
                {title}
              </Dialog.Title>

              <div className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4'>
                <div className='flex items-center gap-2 text-primary'>
                  <Icon className='h-4 w-4' />
                  <div className='font-cairo text-[12px] font-extrabold'>
                    الطبيب
                  </div>
                </div>
                <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                  {doctorName}
                </div>
              </div>

              {mode === 'map' ? (
                <div className='mt-5 rounded-[12px] border border-[#D1E9FF] bg-[#EFF6FF] px-5 py-5'>
                  <div className='font-cairo text-[12px] font-bold text-[#1D4ED8]'>
                    Lat: {lat ?? '—'} • Lng: {lng ?? '—'}
                  </div>
                  <div className='mt-3 rounded-[12px] bg-white/70 px-4 py-10 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
                    سيتم ربط خريطة فعلية (Map component) هنا.
                  </div>
                </div>
              ) : (
                <form
                  className='mt-5 space-y-4'
                  onSubmit={handleSubmit(async (values) => {
                    setError(null);
                    setDone(null);
                    if (!requestId) return;
                    try {
                      if (mode === 'approve') {
                        await adminApi.verificationRequests.review(requestId, {
                          decision: 'approved',
                          adminNote: values.adminNote,
                          clinicLat: values.clinicLat,
                          clinicLng: values.clinicLng,
                          verifyLocation:
                            typeof values.verifyLocation === 'boolean'
                              ? values.verifyLocation
                              : true,
                        });
                        setDone('تم قبول الطلب بنجاح');
                        await onReviewed?.();
                      } else {
                        await adminApi.verificationRequests.review(requestId, {
                          decision: 'rejected',
                          adminNote: values.adminNote,
                        });
                        setDone('تم رفض الطلب');
                        await onReviewed?.();
                      }
                    } catch (e: any) {
                      setError(e?.message || 'فشل تنفيذ العملية');
                    }
                  })}
                >
                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]'>
                      ملاحظة الإدارة:
                      <span className='ms-1 text-[#F04438]'>*</span>
                    </div>
                    <textarea
                      {...register('adminNote')}
                      placeholder={
                        mode === 'approve'
                          ? 'مثال: تم التحقق من الترخيص والموقع'
                          : 'اكتب سبب الرفض...'
                      }
                      className='min-h-[110px] w-full resize-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                      required
                    />
                  </div>

                  {mode === 'approve' ? (
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]'>
                          clinicLat (اختياري)
                        </div>
                        <input
                          {...register('clinicLat')}
                          inputMode='decimal'
                          placeholder={lat ?? '30.0444'}
                          className='h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]'
                        />
                      </div>
                      <div>
                        <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#101828]'>
                          clinicLng (اختياري)
                        </div>
                        <input
                          {...register('clinicLng')}
                          inputMode='decimal'
                          placeholder={lng ?? '31.2357'}
                          className='h-[42px] w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3]'
                        />
                      </div>
                      <label className='col-span-2 flex items-center justify-end gap-2 rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3'>
                        <input
                          type='checkbox'
                          defaultChecked
                          {...register('verifyLocation')}
                        />
                        <span className='font-cairo text-[12px] font-bold text-[#111827]'>
                          verifyLocation=true
                        </span>
                      </label>
                    </div>
                  ) : null}

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
                        إغلاق
                      </button>
                    </Dialog.Close>
                    <button
                      type='submit'
                      disabled={isSubmitting || !requestId}
                      className={
                        mode === 'approve'
                          ? 'inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#00C950] px-7 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60'
                          : 'inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#EF4444] px-7 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60'
                      }
                    >
                      {mode === 'approve' ? (
                        <CheckCheck className='h-4 w-4' />
                      ) : (
                        <X className='h-4 w-4' />
                      )}
                      {mode === 'approve' ? 'قبول' : 'رفض'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

