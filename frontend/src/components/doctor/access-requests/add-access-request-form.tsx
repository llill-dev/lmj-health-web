'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  FileText,
  Pill,
  Send,
  ShieldCheck,
  Check,
  Link,
  Stethoscope,
  TestTube2,
  Scan,
  FolderOpen,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import StyledSelect from '@/components/ui/styled-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

type PatientOption = {
  id: string;
  name: string;
};

type MedicalDataType =
  | 'medications'
  | 'lab-results'
  | 'imaging'
  | 'diagnoses'
  | 'prescriptions'
  | 'encounters'
  | 'files';

const addAccessRequestSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  items: z.array(z.string()).min(1, 'اختر نوع بيانات واحد على الأقل'),
  expiresAt: z.string().optional(),
  reason: z.string().min(2, 'سبب الطلب مطلوب'),
});

type AddAccessRequestValues = z.input<typeof addAccessRequestSchema>;

function dataTypeMeta(type: MedicalDataType) {
  switch (type) {
    case 'medications':
      return {
        label: 'الأدوية',
        subtitle: 'الأدوية النشطة والتاريخ الدوائي',
        icon: <Pill className='h-4 w-4 text-[#16A34A]' />,
        color: 'text-[#16A34A]',
      };
    case 'lab-results':
      return {
        label: 'نتائج المختبر',
        subtitle: 'التحاليل والفحوصات المخبرية',
        icon: <TestTube2 className='h-4 w-4 text-[#DC2626]' />,
        color: 'text-[#DC2626]',
      };
    case 'imaging':
      return {
        label: 'الأشعة والتصوير',
        subtitle: 'نتائج التصوير الطبي والأشعة',
        icon: <Scan className='h-4 w-4 text-[#9333EA]' />,
        color: 'text-[#9333EA]',
      };
    case 'diagnoses':
      return {
        label: 'التشخيصات',
        subtitle: 'التشخيصات الطبية السابقة',
        icon: <Stethoscope className='h-4 w-4 text-[#0F766E]' />,
        color: 'text-[#0F766E]',
      };
    case 'prescriptions':
      return {
        label: 'الوصفات الطبية',
        subtitle: 'الوصفات الطبية المسجلة',
        icon: <FileText className='h-4 w-4 text-[#2563EB]' />,
        color: 'text-[#2563EB]',
      };
    case 'encounters':
      return {
        label: 'الزيارات الطبية',
        subtitle: 'سجل الزيارات والمواعيد',
        icon: <Calendar className='h-4 w-4 text-[#EA580C]' />,
        color: 'text-[#EA580C]',
      };
    case 'files':
      return {
        label: 'الملفات والمرفقات',
        subtitle: 'المستندات والملفات الطبية',
        icon: <FolderOpen className='h-4 w-4 text-[#CA8A04]' />,
        color: 'text-[#CA8A04]',
      };
  }
}

export default function AddAccessRequestForm({
  patients,
  onCancel,
  onSubmit,
}: {
  patients: PatientOption[];
  onCancel: () => void;
  onSubmit?: (payload: {
    patientId: string;
    items: string[];
    expiresAt?: string;
    reason: string;
  }) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddAccessRequestValues>({
    resolver: zodResolver(addAccessRequestSchema),
    defaultValues: {
      patientId: '',
      items: [],
      expiresAt: '',
      reason: '',
    },
    mode: 'onSubmit',
  });

  const patientId = watch('patientId');
  const selectedItems = watch('items') || [];

  const patientLabel = useMemo(() => {
    const p = patients.find((x) => x.id === patientId);
    return p?.name ?? '';
  }, [patientId, patients]);

  const toggleItem = (type: MedicalDataType) => {
    const current = selectedItems || [];
    if (current.includes(type)) {
      setValue(
        'items',
        current.filter((item) => item !== type),
        { shouldValidate: true },
      );
    } else {
      setValue('items', [...current, type], { shouldValidate: true });
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Get max date (+1 year) in YYYY-MM-DD format
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const inputBase =
    'h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';

  const textAreaBase =
    'min-h-[104px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';

  const labelBase =
    'mb-2 text-start font-cairo text-[12px] font-extrabold text-[#111827]';

  const submit = (values: AddAccessRequestValues) => {
    onSubmit?.({
      patientId: values.patientId,
      items: values.items,
      expiresAt: values.expiresAt || undefined,
      reason: values.reason,
    });
  };

  return (
    <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
      <div className='border-b border-[#EEF2F6] px-8 py-5'>
        <div className='text-start font-cairo text-[15px] font-extrabold text-[#111827]'>
          طلب وصول جديد
        </div>
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        className='px-8 pb-8 pt-6'
      >
        <div className='grid grid-cols-1 gap-5'>
          <div>
            <div className={labelBase}>اختر المريض</div>
            <Controller
              name='patientId'
              control={control}
              render={({ field }) => (
                <StyledSelect
                  options={patients.map((p) => ({ value: p.id, label: p.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder='اختر المريض...'
                  error={Boolean(errors.patientId)}
                  emptyTriggerLabel='لا يوجد مرضى في القائمة'
                  emptyState='لا يوجد مرضى متاحين للاختيار.'
                  listboxAriaLabel='اختيار المريض'
                />
              )}
            />
            {errors.patientId?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.patientId.message}
              </div>
            ) : null}
          </div>

          <div className='rounded-[16px] border border-[#BFEDEC] bg-[#0F8F8B1A] px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]'>
            <div className='flex w-full items-start justify-between gap-4'>
              <div className='flex flex-row-reverse items-start gap-3'>
                <div className='text-start'>
                  <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                    {patientLabel || '-'}
                  </div>
                  <div className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    معلومات المريض الطبية العامة
                  </div>
                </div>
                <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-primary text-white'>
                  <span className='font-cairo text-[14px] font-extrabold'>
                    {patientLabel?.trim()?.[0] ?? 'م'}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-3 gap-3'>
              <div className='rounded-[6px] bg-white px-4 py-3 flex flex-col items-center justify-center gap-2'>
                <FileText className='h-4 w-4 text-[#0F8F8B]' />
                <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  2
                </span>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  سجل طبي
                </div>
              </div>
              <div className='rounded-[6px] bg-white px-4 py-3 flex flex-col items-center justify-center gap-2'>
                <Pill className='h-4 w-4 text-[#00A63E]' />
                <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  1
                </span>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  دواء
                </div>
              </div>
              <div className='rounded-[6px] bg-white px-4 py-3 flex flex-col items-center justify-center gap-2'>
                <Activity className='h-4 w-4 text-[#9810FA]' />
                <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  2
                </span>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  تشخيص
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={labelBase}>نطاق البيانات المطلوبة</div>
            <div className='grid grid-cols-1 gap-2.5'>
              {(
                [
                  'medications',
                  'lab-results',
                  'imaging',
                  'diagnoses',
                  'prescriptions',
                  'encounters',
                  'files',
                ] as MedicalDataType[]
              ).map((type) => {
                const meta = dataTypeMeta(type);
                const checked = selectedItems.includes(type);

                return (
                  <button
                    key={type}
                    type='button'
                    onClick={() => toggleItem(type)}
                    className={`flex w-full items-center justify-between rounded-[6px] border px-4 py-2.5 text-start transition ${
                      checked
                        ? 'border-primary bg-[#F0FDFA]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#D0D5DD]'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-white'>
                        {meta.icon}
                      </div>

                      <div className='text-start'>
                        <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                          {meta.label}
                        </div>
                        <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                          {meta.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border-2 ${
                        checked
                          ? 'border-primary bg-primary'
                          : 'border-[#D0D5DD] bg-white'
                      }`}
                      aria-hidden
                    >
                      {checked ? (
                        <Check className='h-3 w-3 text-white' strokeWidth={3} />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.items?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.items.message}
              </div>
            ) : null}
            <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]'>
              {selectedItems.length === 0
                ? 'اختر نوع بيانات واحد أو أكثر'
                : `تم اختيار ${selectedItems.length} من ${7} أنواع`}
            </div>
          </div>

          <div>
            <div className={labelBase}>
              تاريخ انتهاء الصلاحية{' '}
              <span className='font-normal text-[#98A2B3]'>(اختياري)</span>
            </div>
            <div className='relative'>
              <input
                type='date'
                {...register('expiresAt')}
                min={today}
                max={maxDate}
                className={`${inputBase} cursor-pointer`}
                placeholder='اختر تاريخ انتهاء الصلاحية...'
              />
              <Calendar
                className='pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]'
                aria-hidden
              />
            </div>
            <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]'>
              إذا لم تحدد تاريخاً، سيكون الوصول دائماً (حتى يتم إلغاؤه)
            </div>
          </div>

          <div>
            <div className={labelBase}>سبب الطلب</div>
            <textarea
              {...register('reason')}
              className={textAreaBase}
              placeholder='اشرح سبب طلب الوصول للبيانات الطبية...'
            />
            {errors.reason?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.reason.message}
              </div>
            ) : null}
          </div>

          <div className='rounded-[6px] bg-[#E9FFFE] px-5 py-4 text-start'>
            <div className='flex items-start justify-start gap-3'>
              <ShieldCheck className='h-4 w-4 text-[#0F8F8B]' />
              <div className='flex flex-col gap-1'>
                <div className='font-cairo text-[12px] font-extrabold text-[#0F8F8B]'>
                  ملاحظة
                </div>
                <div className='font-cairo text-[11px] font-semibold text-[#0F8F8B]'>
                  سيتم إرسال الطلب إلى المريض للموافقة، وعند الموافقة يمكنك
                  الوصول إلى بياناته.
                </div>
              </div>
            </div>
          </div>

          <div className='mt-1 flex items-center justify-between gap-4'>
            <motion.button
              type='button'
              onClick={onCancel}
              className='flex h-[48px] flex-1 items-center justify-center rounded-[6px] bg-[#F2F4F7] font-cairo text-[13px] font-extrabold text-[#667085]'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              إلغاء
            </motion.button>

            <motion.button
              type='submit'
              disabled={isSubmitting}
              className='flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(15, 143, 139,0.30)]'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Send className='h-4 w-4' />
              إرسال الطلب
            </motion.button>
          </div>
        </div>
      </form>
    </section>
  );
}
