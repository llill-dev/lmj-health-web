'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLookup, usePatchLookup } from '@/hooks/useAdminLookupMutations';
import type { AdminLookupCategory, AdminLookupRecord } from '@/lib/admin/types';
import { resolveLookupText, resolveLookupSecondaryText } from '@/lib/admin/lookupUtils';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';

const schema = z.object({
  key: z
    .string()
    .min(1, 'المفتاح مطلوب')
    .regex(/^[a-z][a-z0-9_]*$/, 'حروف إنجليزية صغيرة، أرقام، شرطة سفلية'),
  textAr: z.string().min(1, 'الاسم العربي مطلوب'),
  textEn: z.string(),
  order: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

/** قيم تجريبية صالحة للتحقق ولـ POST؛ المفتاح يُولَّد فريداً لتقليل تعارض التكرار أثناء التجربة */
function buildVirtualSample(): FormValues {
  const uid = Date.now().toString(36).slice(-8);
  return {
    key: `demo_${uid}`,
    textAr: 'طب القلب',
    textEn: 'Cardiology',
    order: 50,
  };
}

const inputClass =
  'h-[40px] w-full rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function UpsertDoctorLookupDialog({
  open,
  onOpenChange,
  category,
  editTarget,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminLookupCategory;
  editTarget: AdminLookupRecord | null;
}) {
  const { toast } = useToast();
  const createMut = useCreateLookup();
  const patchMut = usePatchLookup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: '',
      textAr: '',
      textEn: '',
      order: 0,
    },
  });

  const isEdit = Boolean(editTarget);

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset({
        key: editTarget.key,
        textAr: resolveLookupText(editTarget.text, 'ar'),
        textEn:
          resolveLookupText(editTarget.text, 'en') ||
          resolveLookupSecondaryText(editTarget.text, 'ar'),
        order: editTarget.order ?? 0,
      });
    } else {
      reset({
        key: '',
        textAr: '',
        textEn: '',
        order: 0,
      });
    }
  }, [open, editTarget, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(values: FormValues) {
    try {
      const text = {
        ar: values.textAr.trim(),
        ...(values.textEn.trim() ? { en: values.textEn.trim() } : {}),
      };
      if (isEdit && editTarget) {
        await patchMut.mutateAsync({
          id: editTarget._id,
          body: {
            key: values.key.trim(),
            text,
            order: values.order,
          },
        });
        toast(`تم تحديث التخصص «${values.textAr}».`, {
          title: 'تم الحفظ',
          variant: 'success',
          durationMs: 3800,
        });
      } else {
        await createMut.mutateAsync({
          category,
          key: values.key.trim(),
          text,
          order: values.order,
        });
        toast(`تمت إضافة التخصص «${values.textAr}» إلى الكتالوج.`, {
          title: 'تمت الإضافة',
          variant: 'success',
          durationMs: 3800,
        });
      }
      onOpenChange(false);
    } catch {
      /* رسالة الخادم في الأسفل */
    }
  }

  const busy = createMut.isPending || patchMut.isPending;
  const serverErr = createMut.error ?? patchMut.error;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px]'
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 top-1/2 z-[121] w-[min(520px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-[#E8ECEF] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]'>
          <div className='flex items-start justify-between gap-3 border-b border-[#F2F4F7] px-5 py-4'>
            <div className='text-right'>
              <Dialog.Title className='font-cairo text-[16px] font-black text-[#111827]'>
                {isEdit ? 'تعديل تخصص' : 'إضافة تخصص طبيب'}
              </Dialog.Title>
              <Dialog.Description className='mt-1 font-cairo text-[11px] font-semibold leading-relaxed text-[#667085]'>
                النص ثنائي اللغة يُخزَّن وفق POST/PATCH لمسار{' '}
                <span className='font-mono text-[10px]'>/api/admin/lookups</span>
              </Dialog.Description>
            </div>
            <Dialog.Close className='rounded-full p-1.5 text-[#98A2B3] transition hover:bg-[#F9FAFB] hover:text-[#475467]'>
              <X className='h-5 w-5' />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4 px-5 py-5'
          >
            {!isEdit ? (
              <div className='flex justify-end'>
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => reset(buildVirtualSample())}
                  className='inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-dashed border-primary/45 bg-[#F0FDFA] px-3 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#CCFBF1] disabled:opacity-50'
                >
                  <Sparkles
                    className='h-4 w-4 shrink-0'
                    aria-hidden
                  />
                  تعبئة بيانات تجريبية
                </button>
              </div>
            ) : null}

            <div>
              <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                المفتاح (machine key)
              </label>
              <input
                {...register('key')}
                dir='ltr'
                className={`${inputClass} font-mono text-[12px]`}
                placeholder='cardiology'
                disabled={busy}
              />
              {errors.key && (
                <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>
                  {errors.key.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  الاسم العربي
                </label>
                <input
                  {...register('textAr')}
                  className={inputClass}
                  disabled={busy}
                />
                {errors.textAr && (
                  <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>
                    {errors.textAr.message}
                  </p>
                )}
              </div>
              <div>
                <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  الاسم الإنجليزي
                </label>
                <input
                  {...register('textEn')}
                  dir='ltr'
                  className={inputClass}
                  disabled={busy}
                />
                {errors.textEn && (
                  <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>
                    {errors.textEn.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                الترتيب
              </label>
              <input
                type='number'
                {...register('order')}
                className={inputClass}
                disabled={busy}
              />
              {errors.order && (
                <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>
                  {errors.order.message}
                </p>
              )}
            </div>

            {serverErr && (
              <div className='rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-right'>
                <p className='font-cairo text-[12px] font-semibold text-red-800'>
                  {userFacingErrorMessage(serverErr)}
                </p>
              </div>
            )}

            <div className='flex flex-wrap items-center justify-end gap-2 border-t border-[#F2F4F7] pt-4'>
              <button
                type='button'
                disabled={busy}
                onClick={() => onOpenChange(false)}
                className='h-[40px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#475467]'
              >
                إلغاء
              </button>
              <button
                type='submit'
                disabled={busy}
                className='inline-flex h-[40px] min-w-[120px] items-center justify-center rounded-[10px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white shadow-[0_14px_28px_rgba(15,143,139,0.28)] disabled:opacity-60'
              >
                {busy ? 'جاري الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
