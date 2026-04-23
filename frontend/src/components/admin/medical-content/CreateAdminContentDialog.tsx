'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAdminContent } from '@/hooks/useAdminContent';
import type { AdminContentBlock, AdminContentType } from '@/lib/admin/types';

/** جسم مبدئي تتوافق مع الـ API ويتجنّب أعطال التحقق عندما يتوقع الخادم مصفوفة بلوكات. */
const DRAFT_CONTENT_BLOCKS: AdminContentBlock[] = [
  { type: 'heading', level: 2, text: 'نظرة عامة' },
  {
    type: 'paragraph',
    text: 'أكمل تفاصيل المقال لاحقاً من صفحة عرض أو تحرير المحتوى.',
  },
];

const formSchema = z.object({
  type: z.enum(['CONDITION', 'SYMPTOM', 'GENERAL_ADVICE', 'NEWS']),
  title: z.string().min(1, 'عنوان المحتوى مطلوب'),
  summary: z.string().optional(),
  language: z.enum(['ar', 'en']),
  slug: z
    .string()
    .optional()
    .refine(
      (s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s),
      { message: 'المعرّف: أحرف لاتينية صغيرة وأرقام وشرطات' },
    ),
});

type FormValues = z.infer<typeof formSchema>;

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
  transition: { type: 'spring' as const, stiffness: 400, damping: 34 },
};

const panelClosed = {
  opacity: 0,
  y: 20,
  scale: 0.97,
  pointerEvents: 'none' as const,
  transition: { duration: 0.2, ease: 'easeOut' as const },
  transitionEnd: { visibility: 'hidden' as const },
};

const typeOptions: { value: AdminContentType; label: string }[] = [
  { value: 'CONDITION', label: 'الحالات الطبية' },
  { value: 'SYMPTOM', label: 'الأعراض' },
  { value: 'GENERAL_ADVICE', label: 'نصائح عامة' },
  { value: 'NEWS', label: 'الأخبار' },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateAdminContentDialog({
  open,
  onOpenChange,
}: Props) {
  const createMut = useCreateAdminContent();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'GENERAL_ADVICE',
      title: '',
      summary: '',
      language: 'ar',
      slug: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        type: 'GENERAL_ADVICE',
        title: '',
        summary: '',
        language: 'ar',
        slug: '',
      });
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
        if (!createMut.isPending) onOpenChange(o);
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
          className='fixed left-1/2 top-1/2 z-[10060] w-[min(100vw-1.5rem,520px)] max-h-[min(92vh,640px)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none outline-none'
          dir='rtl'
          lang='ar'
        >
          <Dialog.Description className='sr-only'>
            نموذج لإضافة مقال طبي تعليمي جديد ويعُدّ كمسودة.
          </Dialog.Description>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: panelOpen, closed: panelClosed }}
            className='max-h-full w-full overflow-y-auto rounded-[16px] bg-white p-0 shadow-[0_24px_60px_rgba(0,0,0,0.2)]'
          >
            <form
              onSubmit={handleSubmit(async (v) => {
                try {
                  await createMut.mutateAsync({
                    type: v.type,
                    title: v.title.trim(),
                    summary: v.summary?.trim() || undefined,
                    language: v.language,
                    slug: v.slug?.trim() || undefined,
                    contentBlocks: DRAFT_CONTENT_BLOCKS,
                  });
                  onOpenChange(false);
                } catch {
                  // الخطأ يظهر عبر createMut.isError ورسالة الـ API
                }
              })}
            >
              <div className='flex items-start justify-between border-b border-[#F2F4F7] px-5 py-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#E7FBFA] text-primary'>
                    <FileText className='h-5 w-5' />
                  </div>
                  <Dialog.Title className='font-cairo text-[16px] font-extrabold leading-snug text-[#101828]'>
                    إضافة محتوى جديد
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F2F4F7] disabled:opacity-40'
                    aria-label='إغلاق'
                    disabled={createMut.isPending}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </Dialog.Close>
              </div>
              <div className='space-y-3 px-5 py-4'>
                <div>
                  <label className='block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                    نوع المحتوى
                  </label>
                  <Controller
                    name='type'
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className='mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                      >
                        {typeOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                <div>
                  <label className='block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                    العنوان
                  </label>
                  <input
                    {...register('title')}
                    className='mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                    placeholder='عنوان واضح'
                  />
                  {errors.title ? (
                    <p className='mt-1 text-right font-cairo text-[11px] font-bold text-red-600'>
                      {errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className='block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                    ملخص (اختياري)
                  </label>
                  <textarea
                    {...register('summary')}
                    rows={3}
                    className='mt-1.5 w-full resize-y rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-right font-cairo text-[13px] font-semibold text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
                    placeholder='مقدمة قصيرة…'
                  />
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                      اللغة
                    </label>
                    <Controller
                      name='language'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-right font-cairo text-[13px] font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                        >
                          <option value='ar'>العربية</option>
                          <option value='en'>English</option>
                        </select>
                      )}
                    />
                  </div>
                  <div>
                    <label className='block text-right font-cairo text-[12px] font-extrabold text-[#344054]'>
                      Slug (اختياري)
                    </label>
                    <input
                      {...register('slug')}
                      dir='ltr'
                      className='mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[13px] font-semibold text-[#101828] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                      placeholder='my-article'
                    />
                    {errors.slug ? (
                      <p className='mt-1 text-right font-cairo text-[11px] font-bold text-red-600'>
                        {errors.slug.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                {createMut.isError ? (
                  <p className='rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-right font-cairo text-[12px] font-semibold text-red-800'>
                    {(createMut.error as Error)?.message ?? 'تعذّر الإنشاء'}
                  </p>
                ) : null}
              </div>
              <div className='flex items-center justify-end gap-2 border-t border-[#F2F4F7] px-5 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-10 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-50'
                    disabled={createMut.isPending}
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={createMut.isPending}
                  className='h-10 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.35)] transition hover:brightness-105 disabled:opacity-50'
                >
                  {createMut.isPending ? 'جاري الحفظ…' : 'حفظ كمسودة'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
