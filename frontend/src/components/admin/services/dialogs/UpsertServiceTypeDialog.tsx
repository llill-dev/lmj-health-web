'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';
import StyledSelect from '@/components/ui/styled-select';
import {
  useCreateServiceType,
  useMutateServiceType,
} from '@/hooks/admin/services/useAdminServices';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { requiredLatinSlugSchema } from '@/lib/forms/slugValidation';
import { resolveLabel } from '@/lib/admin/types';
import type {
  CreateServiceTypeBody,
  ServiceType,
  ServiceTypeField,
  UpdateServiceTypeBody,
} from '@/lib/admin/types';

const FIELD_TYPE_OPTIONS: Array<{
  value: ServiceTypeField['type'];
  label: string;
}> = [
  { value: 'string', label: 'نص' },
  { value: 'number', label: 'رقم' },
  { value: 'boolean', label: 'منطقي' },
  { value: 'array', label: 'مصفوفة' },
  { value: 'object', label: 'كائن' },
];

const fieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'المفتاح مطلوب')
    .regex(/^[a-zA-Z0-9_]+$/, 'أحرف وأرقام و«_» فقط'),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object'] as const),
  labelAr: z.string().trim().optional(),
  labelEn: z.string().trim().optional(),
  required: z.boolean(),
  isPublic: z.boolean(),
});

const schema = z.object({
  nameAr: z.string().trim().min(2, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().trim().min(2, 'الاسم بالإنجليزية مطلوب'),
  slug: requiredLatinSlugSchema('المعرّف مطلوب'),
  descriptionAr: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  isActive: z.boolean(),
  fields: z.array(fieldSchema),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_FORM: FormValues = {
  nameAr: '',
  nameEn: '',
  slug: '',
  descriptionAr: '',
  descriptionEn: '',
  isActive: true,
  fields: [],
};

function Field({
  label,
  error,
  children,
  required,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
        {label}
        {required ? <span className='ms-1 text-red-500'>*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#667085]'>{hint}</p>
      ) : null}
      {error ? (
        <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>{error}</p>
      ) : null}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'inline-flex h-[30px] items-center rounded-[8px] bg-primary px-3 font-cairo text-[11px] font-extrabold text-white'
          : 'inline-flex h-[30px] items-center rounded-[8px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#667085] hover:border-primary/40'
      }
    >
      {children}
    </button>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: ServiceType | null;
}

export default function UpsertServiceTypeDialog({
  open,
  onOpenChange,
  editTarget,
}: Props) {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const isEdit = Boolean(editTarget);
  const createMutation = useCreateServiceType();
  const mutateMutation = useMutateServiceType();
  const isPending = createMutation.isPending || mutateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'fields' });

  useEffect(() => {
    if (!open) return;

    if (editTarget) {
      reset({
        nameAr: resolveLabel(editTarget.name, 'ar'),
        nameEn: resolveLabel(editTarget.name, 'en'),
        slug: editTarget.slug,
        descriptionAr: resolveLabel(editTarget.description, 'ar'),
        descriptionEn: resolveLabel(editTarget.description, 'en'),
        isActive: editTarget.isActive,
        fields: (editTarget.fields ?? []).map((field) => ({
          key: field.key,
          type: field.type,
          labelAr: resolveLabel(field.label, 'ar'),
          labelEn: resolveLabel(field.label, 'en'),
          required: Boolean(field.required),
          isPublic: Boolean(field.isPublic),
        })),
      });
      return;
    }

    reset(EMPTY_FORM);
  }, [editTarget, open, reset]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const inputClass =
    'h-[38px] w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[12px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-1 focus:ring-primary/30';

  const onSubmit = handleSubmit(async (values) => {
    const mappedFields: ServiceTypeField[] = values.fields.map((field) => {
      const labelAr = field.labelAr?.trim();
      const labelEn = field.labelEn?.trim();
      const label =
        labelAr || labelEn ? { ar: labelAr ?? '', en: labelEn ?? '' } : field.key;
      return {
        key: field.key.trim(),
        label,
        type: field.type,
        required: field.required,
        isPublic: field.isPublic,
      };
    });

    const descriptionAr = values.descriptionAr?.trim();
    const descriptionEn = values.descriptionEn?.trim();
    const description =
      descriptionAr || descriptionEn
        ? { ar: descriptionAr ?? '', en: descriptionEn ?? '' }
        : undefined;

    try {
      if (isEdit && editTarget) {
        const body: UpdateServiceTypeBody = {
          name: { ar: values.nameAr.trim(), en: values.nameEn.trim() },
          slug: values.slug.trim(),
          description,
          fields: mappedFields,
          isActive: values.isActive,
        };
        await mutateMutation.mutateAsync({ id: editTarget._id, body });
        toast('تم حفظ نوع الخدمة بنجاح.', {
          title: 'تم التعديل',
          variant: 'success',
          durationMs: 4000,
        });
      } else {
        const body: CreateServiceTypeBody = {
          name: { ar: values.nameAr.trim(), en: values.nameEn.trim() },
          slug: values.slug.trim(),
          description,
          fields: mappedFields,
        };
        await createMutation.mutateAsync(body);
        toast('تمت إضافة نوع الخدمة الجديد بنجاح.', {
          title: 'تمت الإضافة',
          variant: 'success',
          durationMs: 4000,
        });
      }
      onOpenChange(false);
    } catch {
      // Inline error is shown below.
    }
  });

  const serverErr = createMutation.error ?? mutateMutation.error;
  const serverError = serverErr ? userFacingErrorMessage(serverErr) : undefined;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                transition: { duration: 0.22 },
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18 },
                transitionEnd: { visibility: 'hidden' as const },
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
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                x: '-50%',
                y: '-50%',
                scale: 1,
                transition: { type: 'spring', stiffness: 520, damping: 38 },
              },
              closed: {
                opacity: 0,
                x: '-50%',
                y: 'calc(-50% + 20px)',
                scale: 0.97,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18, ease: 'easeOut' },
                transitionEnd: { visibility: 'hidden' as const },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[600px] max-w-[calc(100vw-24px)] rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
            dir={dir}
            lang={locale}
          >
            <div className='flex items-center justify-between border-b border-[#F2F4F7] px-6 py-4'>
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                {isEdit ? 'تعديل نوع الخدمة' : 'إضافة نوع خدمة جديد'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                >
                  <X className='h-4 w-4' />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={onSubmit}>
              <div className='max-h-[calc(100svh-220px)] overflow-y-auto px-6 py-5'>
                <div className='mb-5 rounded-[10px] border border-[#D6EEEC] bg-[#F3FBFA] px-4 py-3 text-right'>
                  <div className='font-cairo text-[12px] font-extrabold leading-6 text-[#0F766E]'>
                    {isEdit
                      ? 'أنت تعدّل نوع خدمة مرجعيًا على مستوى النظام. أي تغيير في الاسم أو الـ slug أو الحقول الديناميكية سيؤثر على المزوّدين والنماذج المرتبطة بهذا النوع.'
                      : 'أنت تنشئ نوع خدمة مرجعيًا جديدًا. استخدم هذا النموذج لتعريف الاسم والـ slug والحقول المطلوبة فقط، ثم أضف المزوّدين لاحقًا من شاشة مزوّدي الخدمة.'}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-x-4 gap-y-4'>
                  <Field label='الاسم (عربي)' error={errors.nameAr?.message} required>
                    <input {...register('nameAr')} placeholder='مثال: تحاليل مخبرية' className={inputClass} />
                  </Field>

                  <Field label='الاسم (إنجليزي)' error={errors.nameEn?.message} required>
                    <input
                      {...register('nameEn')}
                      dir='ltr'
                      placeholder='e.g. Laboratory Tests'
                      className={`${inputClass} text-left`}
                    />
                  </Field>

                  <Field
                    label='المعرّف (slug)'
                    error={errors.slug?.message}
                    required
                    hint='مفتاح إنجليزي ثابت يُستخدم في الـ API والربط بين النوع ومزوّديه؛ لا تستخدم العربية أو مسافات.'
                  >
                    <input
                      {...register('slug')}
                      dir='ltr'
                      placeholder='laboratory_tests'
                      className={`${inputClass} text-left`}
                    />
                  </Field>

                  <Field label='الحالة'>
                    <Controller
                      name='isActive'
                      control={control}
                      render={({ field }) => (
                        <div className='flex h-[38px] items-center gap-2'>
                          <ToggleChip active={field.value} onClick={() => field.onChange(true)}>
                            نشط
                          </ToggleChip>
                          <ToggleChip active={!field.value} onClick={() => field.onChange(false)}>
                            غير نشط
                          </ToggleChip>
                        </div>
                      )}
                    />
                  </Field>

                  <div className='col-span-2'>
                    <Field label='الوصف (عربي)'>
                      <textarea
                        {...register('descriptionAr')}
                        rows={2}
                        placeholder='وصف مختصر بالعربية'
                        className='w-full resize-none rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-right font-cairo text-[12px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-1 focus:ring-primary/30'
                      />
                    </Field>
                  </div>

                  <div className='col-span-2'>
                    <Field label='الوصف (إنجليزي)'>
                      <textarea
                        {...register('descriptionEn')}
                        rows={2}
                        dir='ltr'
                        placeholder='Short English description'
                        className='w-full resize-none rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-left font-cairo text-[12px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-1 focus:ring-primary/30'
                      />
                    </Field>
                  </div>
                </div>

                <div className='mt-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-cairo text-[13px] font-extrabold text-[#101828]'>الحقول المخصّصة</h3>
                    <button
                      type='button'
                      onClick={() =>
                        append({
                          key: '',
                          type: 'string',
                          labelAr: '',
                          labelEn: '',
                          required: false,
                          isPublic: true,
                        })
                      }
                      className='inline-flex h-[32px] items-center gap-1.5 rounded-[8px] border border-primary/30 bg-[#E7FBFA] px-3 font-cairo text-[12px] font-extrabold text-primary hover:bg-[#D6F7F5]'
                    >
                      <Plus className='h-4 w-4' />
                      إضافة حقل
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <p className='mt-3 rounded-[8px] border border-dashed border-[#D0D5DD] bg-[#FAFBFC] px-3 py-4 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      لا توجد حقول بعد. أضف حقلاً لتعريف البنية المرجعية لهذا النوع قبل استخدامه مع المزوّدين أو النماذج المرتبطة.
                    </p>
                  ) : (
                    <div className='mt-3 space-y-3'>
                      {fields.map((fieldRow, index) => (
                        <div
                          key={fieldRow.id}
                          className='rounded-[10px] border border-[#EEF2F6] bg-[#FAFBFC] p-3'
                        >
                          <div className='grid grid-cols-2 gap-x-3 gap-y-3'>
                            <Field
                              label='المفتاح'
                              error={errors.fields?.[index]?.key?.message}
                              required
                            >
                              <input
                                {...register(`fields.${index}.key` as const)}
                                dir='ltr'
                                placeholder='field_key'
                                className={`${inputClass} text-left`}
                              />
                            </Field>

                            <Field label='النوع' required>
                              <Controller
                                name={`fields.${index}.type` as const}
                                control={control}
                                render={({ field }) => (
                                  <StyledSelect
                                    options={FIELD_TYPE_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    size='sm'
                                    tone='muted'
                                    listboxAriaLabel='نوع الحقل'
                                  />
                                )}
                              />
                            </Field>

                            <Field label='التسمية (عربي)'>
                              <input
                                {...register(`fields.${index}.labelAr` as const)}
                                placeholder='اسم الحقل بالعربية'
                                className={inputClass}
                              />
                            </Field>

                            <Field label='التسمية (إنجليزي)'>
                              <input
                                {...register(`fields.${index}.labelEn` as const)}
                                dir='ltr'
                                placeholder='Field label'
                                className={`${inputClass} text-left`}
                              />
                            </Field>
                          </div>

                          <div className='mt-3 flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <Controller
                                name={`fields.${index}.required` as const}
                                control={control}
                                render={({ field }) => (
                                  <ToggleChip
                                    active={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                  >
                                    إلزامي
                                  </ToggleChip>
                                )}
                              />
                              <Controller
                                name={`fields.${index}.isPublic` as const}
                                control={control}
                                render={({ field }) => (
                                  <ToggleChip
                                    active={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                  >
                                    ظاهر للعموم
                                  </ToggleChip>
                                )}
                              />
                            </div>

                            <button
                              type='button'
                              onClick={() => remove(index)}
                              className='inline-flex h-[30px] items-center gap-1.5 rounded-[8px] border border-[#FECDCA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#D92D20] hover:bg-red-50'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {serverError ? (
                  <div className='mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-red-600'>
                    {serverError}
                  </div>
                ) : null}
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-[#F2F4F7] px-6 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-[38px] rounded-[10px] border border-[#D0D5DD] bg-white px-6 font-cairo text-[13px] font-extrabold text-[#344054]'
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={isPending}
                  className='h-[38px] rounded-[10px] bg-primary px-8 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.25)] disabled:opacity-60'
                >
                  {isPending ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة النوع'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
