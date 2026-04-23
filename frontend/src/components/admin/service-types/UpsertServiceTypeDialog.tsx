'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Layers } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateServiceType,
  useMutateServiceType,
} from '@/hooks/useAdminServices';
import type { ServiceType, ServiceTypeField } from '@/lib/admin/services/types';

const fieldTypes = [
  { value: 'string' as const, label: 'نص' },
  { value: 'number' as const, label: 'رقم' },
  { value: 'boolean' as const, label: 'نعم/لا' },
  { value: 'array' as const, label: 'مصفوفة' },
  { value: 'object' as const, label: 'كائن' },
];

const formSchema = z.object({
  nameEn: z.string().min(1, 'مطلوب'),
  nameAr: z.string().min(1, 'مطلوب'),
  slug: z
    .string()
    .min(1, 'مطلوب')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'للاتيني الصغير، أرقام، شرطة',
    ),
  descEn: z.string().optional(),
  descAr: z.string().optional(),
  fields: z
    .array(
      z.object({
        key: z.string().min(1, 'مفتاح الحقل مطلوب'),
        labelEn: z.string().min(1, 'مطلوب'),
        labelAr: z.string().min(1, 'مطلوب'),
        type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
        required: z.boolean(),
        isPublic: z.boolean(),
      }),
    )
    .min(1, 'أضف حقلاً schema واحداً على الأقل'),
});

type FormValues = z.infer<typeof formSchema>;

const overlay = {
  open: {
    opacity: 1,
    visibility: 'visible' as const,
    pointerEvents: 'auto' as const,
    transition: { duration: 0.2 },
  },
  closed: {
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: { duration: 0.18 },
    transitionEnd: { visibility: 'hidden' as const },
  },
};

const panel = {
  open: {
    opacity: 1,
    visibility: 'visible' as const,
    pointerEvents: 'auto' as const,
    x: '-50%',
    y: '-50%',
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 34 },
  },
  closed: {
    opacity: 0,
    x: '-50%',
    y: 'calc(-50% + 20px)',
    scale: 0.97,
    pointerEvents: 'none' as const,
    transition: { duration: 0.2 },
    transitionEnd: { visibility: 'hidden' as const },
  },
};

function toFormValues(st: ServiceType): FormValues {
  const name = st.name;
  const nameEn = typeof name === 'string' ? name : name?.en ?? '';
  const nameAr = typeof name === 'string' ? name : name?.ar ?? '';
  const d = st.description;
  const descEn =
    d === undefined
      ? ''
      : typeof d === 'string'
        ? d
        : d?.en ?? '';
  const descAr =
    d === undefined
      ? ''
      : typeof d === 'string'
        ? d
        : d?.ar ?? '';
  return {
    nameEn,
    nameAr,
    slug: st.slug,
    descEn,
    descAr,
    fields: (st.fields?.length
      ? st.fields
      : [
          {
            key: 'name',
            label: { en: 'Name', ar: 'الاسم' },
            type: 'string',
            required: true,
            isPublic: true,
          } as ServiceTypeField,
        ]
    ).map((f) => ({
      key: f.key,
      labelEn:
        typeof f.label === 'string'
          ? f.label
          : (f.label?.en ?? ''),
      labelAr:
        typeof f.label === 'string'
          ? f.label
          : (f.label?.ar ?? ''),
      type: f.type,
      required: !!f.required,
      isPublic: f.isPublic !== false,
    })),
  };
}

const defaultCreate: FormValues = {
  nameEn: '',
  nameAr: '',
  slug: '',
  descEn: '',
  descAr: '',
  fields: [
    {
      key: 'name',
      labelEn: 'Name',
      labelAr: 'الاسم',
      type: 'string',
      required: true,
      isPublic: true,
    },
  ],
};

function formToServiceTypeField(row: FormValues['fields'][0]): ServiceTypeField {
  return {
    key: row.key.trim(),
    label: { en: row.labelEn.trim(), ar: row.labelAr.trim() },
    type: row.type,
    required: row.required,
    isPublic: row.isPublic,
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: ServiceType | null;
  onSuccess?: () => void;
};

function FormLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
      {children}
      {required && <span className='ms-1 text-red-500'>*</span>}
    </label>
  );
}

const inputClass =
  'h-[40px] w-full rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function UpsertServiceTypeDialog({
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: Props) {
  const isEdit = !!editTarget?._id;
  const createMut = useCreateServiceType();
  const updateMut = useMutateServiceType();
  const busy = createMut.isPending || updateMut.isPending;
  const serverError =
    (createMut.error as Error | null)?.message ||
    (updateMut.error as Error | null)?.message;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultCreate,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'fields' });

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset(toFormValues(editTarget));
    } else {
      reset(defaultCreate);
    }
  }, [open, editTarget, reset]);

  useEffect(() => {
    if (!open) return;
    const p = document.body.style.overflow;
    const pr = document.body.style.paddingRight;
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (w > 0) document.body.style.paddingRight = `${w}px`;
    return () => {
      document.body.style.overflow = p;
      document.body.style.paddingRight = pr;
    };
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset(defaultCreate);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={overlay}
            className='fixed inset-0 z-[10030] bg-black/45 backdrop-blur-[2px]'
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>
        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={panel}
            className='fixed left-1/2 top-1/2 z-[10040] flex max-h-[min(90vh,760px)] w-[min(100vw-1.5rem,640px)] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <div className='flex shrink-0 items-center justify-between border-b border-[#F2F4F7] px-6 py-4'>
              <div className='flex items-center gap-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary'>
                  <Layers className='h-5 w-5' />
                </div>
                <Dialog.Title className='font-cairo text-[18px] font-extrabold text-[#101828]'>
                  {isEdit ? 'تعديل نوع الخدمة' : 'إضافة نوع خدمة'}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F2F4F7]'
                  aria-label='إغلاق'
                >
                  <X className='h-5 w-5' />
                </button>
              </Dialog.Close>
            </div>

            <form
              className='flex min-h-0 flex-1 flex-col'
              onSubmit={handleSubmit(async (values) => {
                const body = {
                  name: { en: values.nameEn.trim(), ar: values.nameAr.trim() },
                  slug: values.slug.trim(),
                  description:
                    values.descEn?.trim() || values.descAr?.trim()
                      ? {
                          en: (values.descEn ?? '').trim(),
                          ar: (values.descAr ?? '').trim(),
                        }
                      : undefined,
                  fields: values.fields.map(formToServiceTypeField),
                };
                try {
                  if (isEdit && editTarget) {
                    await updateMut.mutateAsync({ id: editTarget._id, body });
                  } else {
                    await createMut.mutateAsync(body);
                  }
                  onOpenChange(false);
                  onSuccess?.();
                } catch {
                  /* يُعرض serverError */
                }
              })}
            >
              <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <FormLabel required>الاسم (عربي)</FormLabel>
                    <input
                      {...register('nameAr')}
                      className={inputClass}
                      placeholder='مثال: مختبرات'
                    />
                    {errors.nameAr && (
                      <p className='mt-1 text-right font-cairo text-[11px] text-red-600'>
                        {errors.nameAr.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <FormLabel required>الاسم (English)</FormLabel>
                    <input
                      {...register('nameEn')}
                      className={inputClass}
                      dir='ltr'
                      placeholder='e.g. Laboratory'
                    />
                    {errors.nameEn && (
                      <p className='mt-1 text-right font-cairo text-[11px] text-red-600'>
                        {errors.nameEn.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <FormLabel required>Slug</FormLabel>
                  <input
                    {...register('slug')}
                    className={inputClass}
                    dir='ltr'
                    disabled={isEdit}
                    placeholder='lab'
                  />
                  {isEdit && (
                    <p className='mt-1 text-right font-cairo text-[11px] text-[#98A2B3]'>
                      لا يُنصح بتغيير الـ slug بعد الربط.
                    </p>
                  )}
                  {errors.slug && (
                    <p className='mt-1 text-right font-cairo text-[11px] text-red-600'>
                      {errors.slug.message}
                    </p>
                  )}
                </div>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <FormLabel>وصف (عربي)</FormLabel>
                    <textarea
                      {...register('descAr')}
                      rows={2}
                      className={`${inputClass} min-h-[72px] resize-none py-2`}
                      placeholder='اختياري'
                    />
                  </div>
                  <div>
                    <FormLabel>وصف (English)</FormLabel>
                    <textarea
                      {...register('descEn')}
                      rows={2}
                      className={`${inputClass} min-h-[72px] resize-none py-2`}
                      dir='ltr'
                      placeholder='optional'
                    />
                  </div>
                </div>

                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <FormLabel required>حقول الـ schema</FormLabel>
                    <button
                      type='button'
                      onClick={() =>
                        append({
                          key: `field_${fields.length + 1}`,
                          labelEn: 'Field',
                          labelAr: 'حقل',
                          type: 'string',
                          required: false,
                          isPublic: true,
                        })
                      }
                      className='inline-flex items-center gap-1 rounded-[8px] border border-primary/30 bg-[#E7FBFA] px-2 py-1.5 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-primary/10'
                    >
                      <Plus className='h-3.5 w-3.5' />
                      إضافة حقل
                    </button>
                  </div>
                  {errors.fields && typeof errors.fields.message === 'string' && (
                    <p className='mb-2 text-right font-cairo text-[11px] text-red-600'>
                      {errors.fields.message}
                    </p>
                  )}
                  <div className='space-y-3 rounded-[12px] border border-[#E9EEF2] bg-[#FAFBFC] p-3'>
                    {fields.map((row, index) => (
                      <div
                        key={row.id}
                        className='rounded-[10px] border border-white bg-white p-3 shadow-sm'
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='font-cairo text-[12px] font-extrabold text-primary'>
                            حقل {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <button
                              type='button'
                              onClick={() => remove(index)}
                              className='rounded-[6px] p-1.5 text-[#EF4444] hover:bg-red-50'
                              aria-label='حذف الحقل'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          <div>
                            <FormLabel required>key</FormLabel>
                            <input
                              {...register(`fields.${index}.key` as const)}
                              className={inputClass}
                              dir='ltr'
                            />
                          </div>
                          <div>
                            <FormLabel required>النوع</FormLabel>
                            <Controller
                              control={control}
                              name={`fields.${index}.type`}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className={inputClass}
                                >
                                  {fieldTypes.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                          <div>
                            <FormLabel required>تسمية (عربي)</FormLabel>
                            <input
                              {...register(`fields.${index}.labelAr` as const)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <FormLabel required>Label (EN)</FormLabel>
                            <input
                              {...register(`fields.${index}.labelEn` as const)}
                              className={inputClass}
                              dir='ltr'
                            />
                          </div>
                        </div>
                        <div className='mt-2 flex flex-wrap items-center justify-end gap-4'>
                          <label className='inline-flex cursor-pointer items-center gap-2 font-cairo text-[12px] font-semibold text-[#344054]'>
                            <Controller
                              control={control}
                              name={`fields.${index}.required`}
                              render={({ field: { value, onChange, ref } }) => (
                                <input
                                  ref={ref}
                                  type='checkbox'
                                  checked={value}
                                  onChange={(e) => onChange(e.target.checked)}
                                  className='h-4 w-4 rounded border-[#D0D5DD] text-primary'
                                />
                              )}
                            />
                            مطلوب
                          </label>
                          <label className='inline-flex cursor-pointer items-center gap-2 font-cairo text-[12px] font-semibold text-[#344054]'>
                            <Controller
                              control={control}
                              name={`fields.${index}.isPublic`}
                              render={({ field: { value, onChange, ref } }) => (
                                <input
                                  ref={ref}
                                  type='checkbox'
                                  checked={value}
                                  onChange={(e) => onChange(e.target.checked)}
                                  className='h-4 w-4 rounded border-[#D0D5DD] text-primary'
                                />
                              )}
                            />
                            حقل عام (isPublic)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isEdit && editTarget && (
                  <p className='text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                    schemaVersion الحالي: {editTarget.schemaVersion}
                  </p>
                )}

                {serverError && (
                  <div className='rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-red-800'>
                    {serverError}
                  </div>
                )}
              </div>

              <div className='flex shrink-0 items-center justify-end gap-2 border-t border-[#F2F4F7] bg-white px-6 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-11 rounded-[10px] border border-[#E5E7EB] bg-white px-5 font-cairo text-[13px] font-extrabold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50'
                    disabled={busy}
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={busy}
                  className='h-11 rounded-[10px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_24px_rgba(15,143,139,0.3)] transition hover:brightness-105 disabled:opacity-50'
                >
                  {busy ? 'جاري الحفظ…' : isEdit ? 'حفظ التعديل' : 'إنشاء'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
