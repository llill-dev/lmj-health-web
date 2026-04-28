'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFacility, useUpdateFacility } from '@/hooks/useAdminServices';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';
import type { FacilitySummary, FacilityType, FacilityStatus } from '@/lib/admin/services/types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

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

const STATUS_OPTIONS: Array<{ value: FacilityStatus; label: string; color: string }> = [
  { value: 'ACTIVE', label: 'نشط', color: 'text-emerald-600' },
  { value: 'PENDING', label: 'معلّق', color: 'text-amber-600' },
  { value: 'INACTIVE', label: 'غير نشط', color: 'text-gray-500' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  facilityType: z.enum([
    'hospital', 'clinic', 'polyclinic', 'medical_center',
    'laboratory', 'imaging_center', 'pharmacy',
    'rehabilitation_center', 'dialysis_center', 'emergency_center', 'other',
  ] as const),
  city: z.string().min(2, 'المدينة مطلوبة'),
  country: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE'] as const),
  attributes: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// Field component
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
        {label}
        {required && <span className='ms-1 text-red-500'>*</span>}
      </label>
      {children}
      {error && (
        <p className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#D92D20]'>
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dialog
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a facility to switch to "edit" mode */
  editTarget?: FacilitySummary | null;
}

export default function UpsertFacilityDialog({
  open,
  onOpenChange,
  editTarget,
}: Props) {
  const { toast } = useToast();
  const isEdit = !!editTarget;
  const createMutation = useCreateFacility();
  const updateMutation = useUpdateFacility(editTarget?.id ?? '');
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [attrInput, setAttrInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      facilityType: 'hospital',
      city: '',
      country: 'SY',
      address: '',
      phone: '',
      description: '',
      status: 'ACTIVE',
      attributes: [],
    },
  });

  const attributes = watch('attributes');

  // Populate form when editing
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.name,
        facilityType: editTarget.facilityType,
        city: editTarget.city,
        country: editTarget.country ?? 'SY',
        address: editTarget.address ?? '',
        phone: editTarget.phone ?? '',
        description: editTarget.description ?? '',
        status: (editTarget.status === 'DELETED' ? 'INACTIVE' : editTarget.status) as 'ACTIVE' | 'PENDING' | 'INACTIVE',
        attributes: editTarget.attributes ?? [],
      });
    } else if (open && !editTarget) {
      reset({
        name: '',
        facilityType: 'hospital',
        city: '',
        country: 'SY',
        address: '',
        phone: '',
        description: '',
        status: 'ACTIVE',
        attributes: [],
      });
    }
  }, [open, editTarget, reset]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const addAttribute = () => {
    const val = attrInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!val || attributes.includes(val)) return;
    setValue('attributes', [...attributes, val]);
    setAttrInput('');
  };

  const removeAttribute = (attr: string) => {
    setValue('attributes', attributes.filter((a) => a !== attr));
  };

  const onSubmit = handleSubmit(async (values) => {
    const body = {
      name: values.name,
      facilityType: values.facilityType,
      city: values.city,
      country: values.country || undefined,
      address: values.address || undefined,
      phone: values.phone || undefined,
      description: values.description || undefined,
      status: values.status,
      attributes: values.attributes,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(body);
        toast(
          `تم حفظ تعديلات المنشأة «${values.name}». تنعكس في دليل الخدمات والقوائم المرتبطة.`,
          { title: 'تم التعديل', variant: 'success', durationMs: 4000 },
        );
      } else {
        await createMutation.mutateAsync(body);
        toast(
          `تمت إضافة المنشأة «${values.name}» إلى دليل الخدمات. راجع حالتها (نشط/معلّق) عند الحاجة.`,
          { title: 'تمت إضافة المنشأة', variant: 'success', durationMs: 4000 },
        );
      }
      onOpenChange(false);
    } catch {
      // errors shown via mutation.error
    }
  });

  const serverErr = createMutation.error ?? updateMutation.error;
  const serverError = serverErr
    ? userFacingErrorMessage(serverErr)
    : undefined;

  const inputClass =
    'h-[38px] w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[12px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-1 focus:ring-primary/30';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: { opacity: 1, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: 0.22 } },
              closed: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.18 }, transitionEnd: { visibility: 'hidden' as const } },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
          />
        </Dialog.Overlay>

        {/* Panel */}
        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                // x/y handle the -50% centering so Framer Motion owns the
                // full transform and never conflicts with Tailwind's translate.
                x: '-50%',
                y: '-50%',
                scale: 1,
                transition: { type: 'spring', stiffness: 520, damping: 38 },
              },
              closed: {
                opacity: 0,
                // Slide in from slightly below centre
                x: '-50%',
                y: 'calc(-50% + 20px)',
                scale: 0.97,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18, ease: 'easeOut' },
                transitionEnd: { visibility: 'hidden' as const },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[560px] max-w-[calc(100vw-24px)] rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
            dir='rtl'
            lang='ar'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#F2F4F7] px-6 py-4'>
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                {isEdit ? 'تعديل المنشأة' : 'إضافة منشأة جديدة'}
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

            {/* Body */}
            <form onSubmit={onSubmit}>
              <div className='max-h-[calc(100svh-220px)] overflow-y-auto px-6 py-5'>
                <div className='grid grid-cols-2 gap-x-4 gap-y-4'>
                  {/* Name */}
                  <div className='col-span-2'>
                    <Field label='اسم المنشأة' error={errors.name?.message} required>
                      <input
                        {...register('name')}
                        placeholder='مستشفى القلب التخصصي'
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* Type */}
                  <Field label='نوع المنشأة' error={errors.facilityType?.message} required>
                    <Controller
                      name='facilityType'
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={`${inputClass} cursor-pointer`}>
                          {FACILITY_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>

                  {/* Status */}
                  <Field label='الحالة' error={errors.status?.message} required>
                    <Controller
                      name='status'
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={`${inputClass} cursor-pointer`}>
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>

                  {/* City */}
                  <Field label='المدينة' error={errors.city?.message} required>
                    <input
                      {...register('city')}
                      placeholder='دمشق'
                      className={inputClass}
                    />
                  </Field>

                  {/* Country */}
                  <Field label='الدولة'>
                    <input
                      {...register('country')}
                      placeholder='SY'
                      className={inputClass}
                    />
                  </Field>

                  {/* Phone */}
                  <Field label='رقم الهاتف'>
                    <input
                      {...register('phone')}
                      dir='ltr'
                      placeholder='+963 11 000 0000'
                      className={`${inputClass} text-left`}
                    />
                  </Field>

                  {/* Address */}
                  <Field label='العنوان'>
                    <input
                      {...register('address')}
                      placeholder='شارع الرئيسي، حي المزة'
                      className={inputClass}
                    />
                  </Field>

                  {/* Description */}
                  <div className='col-span-2'>
                    <Field label='الوصف'>
                      <textarea
                        {...register('description')}
                        rows={2}
                        placeholder='وصف مختصر عن المنشأة...'
                        className='w-full resize-none rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-right font-cairo text-[12px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-1 focus:ring-primary/30'
                      />
                    </Field>
                  </div>

                  {/* Attributes */}
                  <div className='col-span-2'>
                    <label className='mb-1 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      السمات (attributes)
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        value={attrInput}
                        onChange={(e) => setAttrInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAttribute();
                          }
                        }}
                        placeholder='مثال: Night Shift أو echo_available'
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type='button'
                        onClick={addAttribute}
                        className='flex h-[38px] w-[38px] items-center justify-center rounded-[8px] bg-primary text-white'
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>
                    {attributes.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {attributes.map((attr) => (
                          <span
                            key={attr}
                            className='inline-flex items-center gap-1.5 rounded-[6px] bg-[#E7FBFA] px-2 py-0.5 font-cairo text-[11px] font-bold text-primary'
                          >
                            {attr}
                            <button
                              type='button'
                              onClick={() => removeAttribute(attr)}
                              className='text-primary/60 hover:text-red-500'
                            >
                              <Trash2 className='h-3 w-3' />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Server error */}
                {serverError && (
                  <div className='mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-red-600'>
                    {serverError}
                  </div>
                )}
              </div>

              {/* Footer */}
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
                  {isPending ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المنشأة'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
