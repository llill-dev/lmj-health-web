'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useAdminContentById,
  useUpdateAdminContent,
} from '@/hooks/admin/content/useAdminContent';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import { normalizeItemLanguage } from '@/components/admin/medical-content/contentListUtils';
import { cn } from '@/lib/utils/utils';
import type {
  AdminContentDetailsItem,
  AdminContentDetailsResponse,
  AdminContentType,
} from '@/lib/admin/types';

const formSchema = z.object({
  type: z.enum([
    'CONDITION',
    'SYMPTOM',
    'GENERAL_ADVICE',
    'NEWS',
    'MEDICATION',
    'SETTINGS_PAGE',
  ]),
  title: z.string().min(1, 'عنوان المحتوى مطلوب'),
  summary: z.string().optional(),
  language: z.enum(['ar', 'en']),
  slug: z
    .string()
    .optional()
    .refine((s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), {
      message: 'المعرّف: أحرف لاتينية صغيرة وأرقام وشرطات',
    }),
  pageVersion: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const typeOptions: { value: AdminContentType; label: string }[] = [
  { value: 'CONDITION', label: 'الحالات الطبية' },
  { value: 'SYMPTOM', label: 'الأعراض' },
  { value: 'GENERAL_ADVICE', label: 'نصائح عامة' },
  { value: 'NEWS', label: 'الأخبار' },
  { value: 'MEDICATION', label: 'الأدوية' },
  { value: 'SETTINGS_PAGE', label: 'صفحات الإعدادات' },
];

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const localized = obj.ar ?? obj.en ?? obj.title ?? obj.name ?? obj.value;
    if (typeof localized === 'string') return localized;
  }
  return '';
}

function extractDetails(
  payload?: AdminContentDetailsResponse,
): AdminContentDetailsItem | null {
  if (!payload || typeof payload !== 'object') return null;
  return (
    payload.item ??
    payload.content ??
    payload.contentItem ??
    payload.data ??
    null
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
};

export default function EditAdminContentDialog({
  open,
  onOpenChange,
  contentId,
}: Props) {
  const { toast } = useToast();
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractDetails(detailsQuery.data);
  const updateMut = useUpdateAdminContent();
  const submitting = updateMut.isPending;

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
      pageVersion: '',
    },
  });

  useEffect(() => {
    if (!open || !details) return;
    const lang = normalizeItemLanguage(details.language);
    reset({
      type: details.type ?? 'GENERAL_ADVICE',
      title: toText(details.title),
      summary: toText(details.summary),
      language: lang === 'en' ? 'en' : 'ar',
      slug: toText(details.slug),
      pageVersion: toText(details.pageVersion),
    });
  }, [open, details, reset]);

  useEffect(() => {
    if (!open) updateMut.reset();
  }, [open, updateMut]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange, submitting]);

  const loading = detailsQuery.isAwaitingData;
  const loadError = detailsQuery.isError;

  const onSubmit = handleSubmit(async (v) => {
    if (!contentId) return;
    try {
      await updateMut.mutateAsync({
        id: contentId,
        body: {
          type: v.type,
          title: v.title.trim(),
          summary: v.summary?.trim() || undefined,
          language: v.language,
          slug: v.slug?.trim() || undefined,
          pageVersion: v.pageVersion?.trim() || undefined,
        },
      });
      toast(`تم حفظ التعديلات على «${v.title.trim()}».`, {
        title: 'تم تحديث المحتوى',
        variant: 'success',
        durationMs: 4200,
      });
      onOpenChange(false);
    } catch {
      // الخطأ يظهر عبر updateMut.isError ورسالة الـ API
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className='fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 px-4 py-8'
          role='dialog'
          aria-modal='true'
          aria-label='تعديل المحتوى الطبي'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              onOpenChange(false);
            }
          }}
        >
          <motion.div
            className='relative max-h-[min(92vh,860px)] w-full max-w-[640px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]'
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className='relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8'>
              <div className='pointer-events-none absolute inset-0 bg-[#E6F4F3]' aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type='button'
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className='absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50'
                aria-label='إغلاق'
              >
                <X className='h-5 w-5' aria-hidden />
              </button>
              <div className='relative text-right'>
                <h2 className='font-cairo text-[22px] font-extrabold text-primary'>
                  تعديل المحتوى الطبي
                </h2>
                <p className='mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]'>
                  حدّث بيانات المحتوى الأساسية ثم احفظ التعديلات.
                </p>
              </div>
            </div>

            {loading ? (
              <div className='flex items-center justify-center gap-2 px-8 py-20 font-cairo text-[13px] font-bold text-[#667085]'>
                <Loader2 className='h-4 w-4 animate-spin' />
                جارِ تحميل بيانات المحتوى...
              </div>
            ) : loadError || !details ? (
              <div className='px-8 py-12'>
                <div className='rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[13px] font-bold text-red-600'>
                  تعذّر تحميل بيانات المحتوى للتعديل.
                </div>
              </div>
            ) : (
              <form dir='rtl' onSubmit={onSubmit}>
                <div className='max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6'>
                  <div className='space-y-5'>
                    <DoctorProfileFormField label='نوع المحتوى' required>
                      <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={typeOptions}
                            placeholder='اختر نوع المحتوى'
                            listboxAriaLabel='نوع المحتوى'
                          />
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField
                      label='العنوان'
                      required
                      error={errors.title?.message}
                    >
                      <input
                        {...register('title')}
                        placeholder='عنوان واضح للمحتوى'
                        className={profileFieldClass(
                          cn(profileInputClass, 'text-start placeholder:text-start'),
                          Boolean(errors.title),
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField label='ملخص' error={errors.summary?.message}>
                      <textarea
                        {...register('summary')}
                        rows={3}
                        placeholder='مقدمة قصيرة تصف المحتوى…'
                        className={profileFieldClass(
                          cn(profileTextareaClass, 'text-start placeholder:text-start'),
                          Boolean(errors.summary),
                        )}
                      />
                    </DoctorProfileFormField>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <DoctorProfileFormField
                        label='اللغة'
                        required
                        error={errors.language?.message}
                      >
                        <Controller
                          name='language'
                          control={control}
                          render={({ field }) => (
                            <StyledSelect
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              options={[
                                { value: 'ar', label: 'العربية' },
                                { value: 'en', label: 'English' },
                              ]}
                              placeholder='اختر اللغة'
                              listboxAriaLabel='لغة المحتوى'
                            />
                          )}
                        />
                      </DoctorProfileFormField>

                      <DoctorProfileFormField
                        label='Slug (اختياري)'
                        error={errors.slug?.message}
                      >
                        <input
                          {...register('slug')}
                          dir='ltr'
                          placeholder='my-article'
                          className={profileFieldClass(
                            cn(profileInputClass),
                            Boolean(errors.slug),
                          )}
                        />
                      </DoctorProfileFormField>
                    </div>

                    <DoctorProfileFormField
                      label='إصدار الصفحة (اختياري)'
                      hint='مطلوب لاعتماد صفحات الإعدادات (SETTINGS_PAGE).'
                      error={errors.pageVersion?.message}
                    >
                      <input
                        {...register('pageVersion')}
                        dir='ltr'
                        placeholder='v1'
                        className={profileFieldClass(
                          cn(profileInputClass),
                          Boolean(errors.pageVersion),
                        )}
                      />
                    </DoctorProfileFormField>

                    {updateMut.isError ? (
                      <div className='rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600'>
                        {userFacingErrorMessage(updateMut.error, 'تعذّر التعديل')}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5'>
                  <button
                    type='button'
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                    className='inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50'
                  >
                    إلغاء
                  </button>
                  <button
                    type='submit'
                    disabled={submitting}
                    className='inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60'
                  >
                    <Save className='h-4 w-4' aria-hidden />
                    {submitting ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
