'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '@/components/ui/ToastProvider';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import { useCreateFacility, useUpdateFacility } from '@/hooks/admin/services/useAdminServices';
import { adminApi } from '@/lib/admin/client';
import { resolveAdminFacilityFormFeedback } from '@/lib/admin/facilities/facilityFormErrors';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { cn } from '@/lib/utils/utils';
import type { FacilityStatus, FacilitySummary, FacilityType } from '@/lib/admin/types';

const FACILITY_TYPE_OPTIONS: Array<{ value: FacilityType; label: string }> = [
  { value: 'hospital', label: 'مستشفى' },
  { value: 'clinic', label: 'عيادة' },
  { value: 'polyclinic', label: 'عيادات متعددة' },
  { value: 'medical_center', label: 'مركز طبي' },
  { value: 'laboratory', label: 'مختبر' },
  { value: 'imaging_center', label: 'مركز أشعة' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'rehabilitation_center', label: 'مركز تأهيل' },
  { value: 'dialysis_center', label: 'مركز غسيل كلوي' },
  { value: 'emergency_center', label: 'طوارئ' },
  { value: 'other', label: 'أخرى' },
];

const STATUS_OPTIONS: Array<{ value: FacilityStatus; label: string }> = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'PENDING', label: 'معلّق' },
  { value: 'INACTIVE', label: 'غير نشط' },
];

const schema = z.object({
  name: z.string().trim().min(2, 'اسم المنشأة مطلوب'),
  facilityType: z.enum([
    'hospital',
    'clinic',
    'polyclinic',
    'medical_center',
    'laboratory',
    'imaging_center',
    'pharmacy',
    'rehabilitation_center',
    'dialysis_center',
    'emergency_center',
    'other',
  ] as const),
  city: z.string().trim().min(2, 'المدينة مطلوبة'),
  country: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE'] as const),
  ownerDoctorId: z.string().trim().optional(),
  attributes: z.array(z.string().trim()),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_FORM: FormValues = {
  name: '',
  facilityType: 'hospital',
  city: '',
  country: 'SY',
  address: '',
  phone: '',
  description: '',
  status: 'ACTIVE',
  ownerDoctorId: '',
  attributes: [],
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: FacilitySummary | null;
}

function normalizeFacilityAttribute(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export default function UpsertFacilityDialog({
  open,
  onOpenChange,
  editTarget,
}: Props) {
  const { toast } = useToast();
  const isEdit = Boolean(editTarget);
  const createMutation = useCreateFacility();
  const updateMutation = useUpdateFacility(editTarget?.id ?? '');
  const ownerDoctorsQuery = useQuery({
    queryKey: ['admin', 'facility-owner-options', 'services-dialog'],
    queryFn: () =>
      adminApi.doctors.list({
        status: 'approved',
        page: 1,
        limit: 100,
      }),
    enabled: open,
    staleTime: 60_000,
  });
  const submitting = createMutation.isPending || updateMutation.isPending;
  const [attrInput, setAttrInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  });

  const attributes = watch('attributes') ?? [];
  const ownerDoctorOptions = [
    { value: '', label: 'بدون طبيب مالك' },
    ...(ownerDoctorsQuery.data?.doctors ?? []).map((doctor) => ({
      value: doctor._id,
      label: doctor.user?.fullName || doctor._id,
    })),
  ];
  const ownerDoctorPlaceholder = ownerDoctorsQuery.isLoading
    ? 'جارٍ تحميل الأطباء...'
    : ownerDoctorOptions.length > 1
      ? 'اختر الطبيب المالك'
      : 'لا يوجد أطباء متاحون';

  useEffect(() => {
    if (!open) return;
    clearErrors();

    if (editTarget) {
      reset({
        name: editTarget.name,
        facilityType: editTarget.facilityType,
        city: editTarget.city,
        country: editTarget.country ?? 'SY',
        address: editTarget.address ?? '',
        phone: editTarget.phone ?? '',
        description: editTarget.description ?? '',
        status:
          editTarget.status === 'DELETED'
            ? 'INACTIVE'
            : (editTarget.status as 'ACTIVE' | 'PENDING' | 'INACTIVE'),
        ownerDoctorId: editTarget.ownerDoctorId ?? '',
        attributes: Array.isArray(editTarget.attributes) ? editTarget.attributes : [],
      });
      return;
    }

    reset(EMPTY_FORM);
  }, [clearErrors, editTarget, open, reset]);

  useEffect(() => {
    if (!open) {
      setAttrInput('');
      return;
    }

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

  const addAttribute = () => {
    const next = normalizeFacilityAttribute(attrInput);
    if (!next || attributes.includes(next)) return;
    setValue('attributes', [...attributes, next], { shouldDirty: true, shouldValidate: true });
    setAttrInput('');
  };

  const removeAttribute = (attr: string) => {
    setValue(
      'attributes',
      attributes.filter((item) => item !== attr),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    const ownerDoctorId = values.ownerDoctorId?.trim() || undefined;
    const body = {
      name: values.name.trim(),
      facilityType: values.facilityType,
      city: values.city.trim(),
      country: values.country?.trim() || undefined,
      address: values.address?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      description: values.description?.trim() || undefined,
      status: values.status,
      ownerDoctorId,
      attributes: values.attributes.map(normalizeFacilityAttribute).filter(Boolean),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(body);
        toast('تم حفظ بيانات المنشأة وربطها كما يطابق دليل الـ API.', {
          title: 'تم التعديل',
          variant: 'success',
          durationMs: 4000,
        });
      } else {
        await createMutation.mutateAsync(body);
        toast('تمت إضافة المنشأة الجديدة بنجاح.', {
          title: 'تمت الإضافة',
          variant: 'success',
          durationMs: 4000,
        });
      }
      onOpenChange(false);
    } catch (error) {
      const feedback = resolveAdminFacilityFormFeedback(
        error,
        isEdit ? 'edit' : 'create',
      );

      (Object.entries(feedback.fields) as Array<[keyof FormValues, string]>).forEach(
        ([field, message]) => {
          setError(field, { type: 'server', message });
        },
      );

      if (feedback.rootBanner) {
        setError('root', { type: 'server', message: feedback.rootBanner });
      }

      toast(feedback.toastMessage, {
        title: feedback.toastTitle,
        variant: 'error',
        durationMs: Math.min(9000, Math.max(4800, feedback.toastMessage.length * 42)),
      });
    }
  });

  const serverErr = createMutation.error ?? updateMutation.error;
  const serverError = errors.root?.message ?? (serverErr ? userFacingErrorMessage(serverErr) : undefined);

  const title = isEdit ? 'تعديل المنشأة' : 'إضافة منشأة جديدة';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className='fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8'
          role='dialog'
          aria-modal='true'
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) onOpenChange(false);
          }}
        >
          <motion.div
            className='relative max-h-[min(92vh,880px)] w-full max-w-[760px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]'
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
                <h2 className='font-cairo text-[22px] font-extrabold text-primary'>{title}</h2>
                <p className='mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]'>
                  {isEdit
                    ? 'حدّث بيانات المنشأة الصحية وربطها بالطبيب المالك.'
                    : 'أضف منشأة صحية جديدة إلى دليل الخدمات وحدد حالتها.'}
                </p>
              </div>
            </div>

            <form dir='rtl' onSubmit={onSubmit}>
              <div className='max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6'>
                <div className='space-y-5'>
                  <DoctorProfileFormField label='اسم المنشأة' required error={errors.name?.message}>
                    <input
                      {...register('name')}
                      placeholder='مستشفى أو مركز طبي'
                      className={profileFieldClass(
                        cn(profileInputClass, 'text-start placeholder:text-start'),
                        Boolean(errors.name),
                      )}
                    />
                  </DoctorProfileFormField>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <DoctorProfileFormField
                      label='نوع المنشأة'
                      required
                      error={errors.facilityType?.message}
                    >
                      <Controller
                        control={control}
                        name='facilityType'
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={FACILITY_TYPE_OPTIONS}
                            placeholder='اختر نوع المنشأة'
                            error={Boolean(errors.facilityType)}
                            listboxAriaLabel='نوع المنشأة'
                          />
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField label='الحالة' required error={errors.status?.message}>
                      <Controller
                        control={control}
                        name='status'
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={STATUS_OPTIONS}
                            placeholder='اختر الحالة'
                            error={Boolean(errors.status)}
                            listboxAriaLabel='حالة المنشأة'
                          />
                        )}
                      />
                    </DoctorProfileFormField>
                  </div>

                  <DoctorProfileFormField label='الوصف' error={errors.description?.message}>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder='أدخل وصف المنشأة'
                      className={profileFieldClass(
                        cn(profileTextareaClass, 'text-start placeholder:text-start'),
                        Boolean(errors.description),
                      )}
                    />
                  </DoctorProfileFormField>

                  <div>
                    <h3 className='mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      الموقع
                    </h3>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <DoctorProfileFormField label='المدينة' required error={errors.city?.message}>
                          <input
                            {...register('city')}
                            placeholder='دمشق'
                            className={profileFieldClass(
                              cn(profileInputClass, 'text-start placeholder:text-start'),
                              Boolean(errors.city),
                            )}
                          />
                        </DoctorProfileFormField>

                        <DoctorProfileFormField label='الدولة' error={errors.country?.message}>
                          <input
                            {...register('country')}
                            placeholder='SY'
                            className={profileFieldClass(
                              cn(profileInputClass, 'text-start placeholder:text-start'),
                              Boolean(errors.country),
                            )}
                          />
                        </DoctorProfileFormField>
                      </div>

                      <DoctorProfileFormField label='العنوان' error={errors.address?.message}>
                        <input
                          {...register('address')}
                          placeholder='العنوان التفصيلي'
                          className={profileFieldClass(
                            cn(profileInputClass, 'text-start placeholder:text-start'),
                            Boolean(errors.address),
                          )}
                        />
                      </DoctorProfileFormField>
                    </div>
                  </div>

                  <div>
                    <h3 className='mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      التواصل والربط
                    </h3>
                    <div className='space-y-4'>
                      <DoctorProfileFormField label='رقم الهاتف' error={errors.phone?.message}>
                        <input
                          {...register('phone')}
                          dir='rtl'
                          placeholder='+963944000000'
                          className={profileFieldClass(
                            cn(profileInputClass),
                            Boolean(errors.phone),
                          )}
                        />
                      </DoctorProfileFormField>

                      <DoctorProfileFormField
                        label='معرّف طبيب المالك'
                        error={errors.ownerDoctorId?.message}
                        hint='اختياري. اختر طبيبًا معتمدًا أو اترك الحقل بدون مالك.'
                      >
                        <Controller
                          control={control}
                          name='ownerDoctorId'
                          render={({ field }) => (
                            <StyledSelect
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              options={ownerDoctorOptions}
                              placeholder={ownerDoctorPlaceholder}
                              error={Boolean(errors.ownerDoctorId)}
                              listboxAriaLabel='الطبيب المالك'
                              disabled={ownerDoctorsQuery.isLoading}
                            />
                          )}
                        />
                      </DoctorProfileFormField>
                    </div>
                  </div>

                  <div>
                    <h3 className='mb-3 text-right font-cairo text-[14px] font-extrabold text-[#111827]'>
                      سمات المنشأة
                    </h3>
                    <DoctorProfileFormField
                      label='إضافة سمة'
                      error={errors.attributes?.message}
                      hint='مثال: night_shift أو echo_available'
                    >
                      <div className='flex items-center gap-2'>
                        <input
                          value={attrInput}
                          onChange={(event) => setAttrInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addAttribute();
                            }
                          }}
                          placeholder='Night Shift'
                          disabled={submitting}
                          className={profileFieldClass(
                            cn(profileInputClass, 'text-start placeholder:text-start'),
                            false,
                          )}
                        />
                        <button
                          type='button'
                          onClick={addAttribute}
                          disabled={submitting || !attrInput.trim()}
                          className='inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-primary text-white disabled:opacity-50'
                          aria-label='إضافة سمة'
                        >
                          <Plus className='h-4 w-4' aria-hidden />
                        </button>
                      </div>
                    </DoctorProfileFormField>
                    {attributes.length > 0 ? (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {attributes.map((attr) => (
                          <span
                            key={attr}
                            className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#E6F4F3] px-3 py-1 font-cairo text-[11px] font-bold text-primary'
                          >
                            {formatFacilityAttributeLabel(attr)}
                            <button
                              type='button'
                              onClick={() => removeAttribute(attr)}
                              disabled={submitting}
                              className='text-primary/70 transition hover:text-[#B42318] disabled:opacity-50'
                              aria-label={`إزالة ${attr}`}
                            >
                              <Trash2 className='h-3 w-3' aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                        لا توجد سمات مضافة بعد.
                      </p>
                    )}
                  </div>

                  {serverError ? (
                    <div className='rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600'>
                      {serverError}
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
                  {submitting ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إضافة المنشأة'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
