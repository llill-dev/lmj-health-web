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
import { useI18n } from '@/i18n/provider';

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

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

function buildAddAccessRequestSchema(tr: TrFn = defaultTr) {
  return z.object({
    patientId: z.string().min(1, tr('اختر المريض', 'Select the patient')),
    items: z.array(z.string()).min(1, tr('اختر نوع بيانات واحد على الأقل', 'Select at least one data type')),
    expiresAt: z.string().optional(),
    reason: z.string().min(2, tr('سبب الطلب مطلوب', 'A reason for the request is required')),
  });
}

type AddAccessRequestValues = z.input<ReturnType<typeof buildAddAccessRequestSchema>>;

function dataTypeMeta(type: MedicalDataType, tr: TrFn = defaultTr) {
  switch (type) {
    case 'medications':
      return {
        label: tr('الأدوية', 'Medications'),
        subtitle: tr('الأدوية النشطة والتاريخ الدوائي', 'Active medications and medication history'),
        icon: <Pill className='h-4 w-4 text-[#16A34A]' />,
        color: 'text-[#16A34A]',
      };
    case 'lab-results':
      return {
        label: tr('نتائج المختبر', 'Lab results'),
        subtitle: tr('التحاليل والفحوصات المخبرية', 'Lab tests and analyses'),
        icon: <TestTube2 className='h-4 w-4 text-[#DC2626]' />,
        color: 'text-[#DC2626]',
      };
    case 'imaging':
      return {
        label: tr('الأشعة والتصوير', 'Imaging'),
        subtitle: tr('نتائج التصوير الطبي والأشعة', 'Medical imaging and radiology results'),
        icon: <Scan className='h-4 w-4 text-[#9333EA]' />,
        color: 'text-[#9333EA]',
      };
    case 'diagnoses':
      return {
        label: tr('التشخيصات', 'Diagnoses'),
        subtitle: tr('التشخيصات الطبية السابقة', 'Previous medical diagnoses'),
        icon: <Stethoscope className='h-4 w-4 text-[#0F766E]' />,
        color: 'text-[#0F766E]',
      };
    case 'prescriptions':
      return {
        label: tr('الوصفات الطبية', 'Prescriptions'),
        subtitle: tr('الوصفات الطبية المسجلة', 'Recorded prescriptions'),
        icon: <FileText className='h-4 w-4 text-[#2563EB]' />,
        color: 'text-[#2563EB]',
      };
    case 'encounters':
      return {
        label: tr('الزيارات الطبية', 'Medical encounters'),
        subtitle: tr('سجل الزيارات والمواعيد', 'Encounter and appointment history'),
        icon: <Calendar className='h-4 w-4 text-[#EA580C]' />,
        color: 'text-[#EA580C]',
      };
    case 'files':
      return {
        label: tr('الملفات والمرفقات', 'Files and attachments'),
        subtitle: tr('المستندات والملفات الطبية', 'Medical documents and files'),
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
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const addAccessRequestSchema = useMemo(() => buildAddAccessRequestSchema(tr), [locale]);
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
          {tr('طلب وصول جديد', 'New access request')}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        className='px-8 pb-8 pt-6'
      >
        <div className='grid grid-cols-1 gap-5'>
          <div>
            <div className={labelBase}>{tr('اختر المريض', 'Select patient')}</div>
            <Controller
              name='patientId'
              control={control}
              render={({ field }) => (
                <StyledSelect
                  options={patients.map((p) => ({ value: p.id, label: p.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={tr('اختر المريض...', 'Select patient...')}
                  error={Boolean(errors.patientId)}
                  emptyTriggerLabel={tr('لا يوجد مرضى في القائمة', 'No patients in the list')}
                  emptyState={tr('لا يوجد مرضى متاحين للاختيار.', 'No patients are available to select.')}
                  listboxAriaLabel={tr('اختيار المريض', 'Select patient')}
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
                    {tr('معلومات المريض الطبية العامة', "Patient's general medical information")}
                  </div>
                </div>
                <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-primary text-white'>
                  <span className='font-cairo text-[14px] font-extrabold'>
                    {patientLabel?.trim()?.[0] ?? tr('م', 'P')}
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
                  {tr('سجل طبي', 'Medical record')}
                </div>
              </div>
              <div className='rounded-[6px] bg-white px-4 py-3 flex flex-col items-center justify-center gap-2'>
                <Pill className='h-4 w-4 text-[#00A63E]' />
                <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  1
                </span>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {tr('دواء', 'Medication')}
                </div>
              </div>
              <div className='rounded-[6px] bg-white px-4 py-3 flex flex-col items-center justify-center gap-2'>
                <Activity className='h-4 w-4 text-[#9810FA]' />
                <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  2
                </span>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {tr('تشخيص', 'Diagnosis')}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={labelBase}>{tr('نطاق البيانات المطلوبة', 'Requested data scope')}</div>
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
                const meta = dataTypeMeta(type, tr);
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
                ? tr('اختر نوع بيانات واحد أو أكثر', 'Select one or more data types')
                : tr(`تم اختيار ${selectedItems.length} من ${7} أنواع`, `${selectedItems.length} of ${7} types selected`)}
            </div>
          </div>

          <div>
            <div className={labelBase}>
              {tr('تاريخ انتهاء الصلاحية', 'Expiration date')}{' '}
              <span className='font-normal text-[#98A2B3]'>({tr('اختياري', 'optional')})</span>
            </div>
            <div className='relative'>
              <input
                type='date'
                {...register('expiresAt')}
                min={today}
                max={maxDate}
                className={`${inputBase} cursor-pointer`}
                placeholder={tr('اختر تاريخ انتهاء الصلاحية...', 'Select an expiration date...')}
              />
              <Calendar
                className='pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]'
                aria-hidden
              />
            </div>
            <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]'>
              {tr('إذا لم تحدد تاريخاً، سيكون الوصول دائماً (حتى يتم إلغاؤه)', 'If you do not set a date, access will be permanent (until revoked)')}
            </div>
          </div>

          <div>
            <div className={labelBase}>{tr('سبب الطلب', 'Reason for the request')}</div>
            <textarea
              {...register('reason')}
              className={textAreaBase}
              placeholder={tr('اشرح سبب طلب الوصول للبيانات الطبية...', 'Explain the reason for requesting access to the medical data...')}
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
                  {tr('ملاحظة', 'Note')}
                </div>
                <div className='font-cairo text-[11px] font-semibold text-[#0F8F8B]'>
                  {tr(
                    'سيتم إرسال الطلب إلى المريض للموافقة، وعند الموافقة يمكنك الوصول إلى بياناته.',
                    'The request will be sent to the patient for approval, and once approved you can access their data.',
                  )}
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
              {tr('إلغاء', 'Cancel')}
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
              {tr('إرسال الطلب', 'Send request')}
            </motion.button>
          </div>
        </div>
      </form>
    </section>
  );
}
