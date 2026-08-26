'use client';
import { useEffect, useMemo } from 'react';
import { Save, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AppCheckbox } from '@/components/ui';
import StyledSelect from '@/components/ui/styled-select';
import { useI18n } from '@/i18n/provider';

type TFn = (key: string, fallback?: string) => string;

type PatientOption = {
  id: string;
  name: string;
};

function buildMedicalRecordSchema(t: TFn) {
  return z.object({
    patientId: z.string().min(1, t('doctor.createMedicalRecordForm.errors.selectPatient')),
    title: z.string().trim().min(2, t('doctor.createMedicalRecordForm.errors.titleRequired')),
    diagnosis: z.string().trim().min(2, t('doctor.createMedicalRecordForm.errors.diagnosisRequired')),
    prescriptionsText: z.string().trim().optional().default(''),
    followUpRequired: z.boolean().default(false),
  });
}

type MedicalRecordFormValues = z.input<ReturnType<typeof buildMedicalRecordSchema>>;

export type MedicalRecordFormPayload = {
  patientId: string;
  title: string;
  diagnosis: string;
  prescriptions: string[];
  followUpRequired: boolean;
};

type InitialValues = Partial<MedicalRecordFormPayload>;

export default function CreateMedicalRecordForm({
  patients,
  onCancel,
  onSave,
  submitLabel,
  title,
  description,
  initialValues,
  patientLocked = false,
}: {
  patients: PatientOption[];
  onCancel: () => void;
  onSave?: (payload: MedicalRecordFormPayload) => void | Promise<void>;
  submitLabel?: string;
  title?: string;
  description?: string;
  initialValues?: InitialValues;
  patientLocked?: boolean;
}) {
  const { locale, t } = useI18n();
  const medicalRecordSchema = useMemo(() => buildMedicalRecordSchema(t), [locale]);
  const resolvedSubmitLabel = submitLabel ?? t('doctor.createMedicalRecordForm.defaultSubmitLabel');
  const resolvedTitle = title ?? t('doctor.createMedicalRecordForm.defaultTitle');
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: initialValues?.patientId ?? '',
      title: initialValues?.title ?? '',
      diagnosis: initialValues?.diagnosis ?? '',
      prescriptionsText: (initialValues?.prescriptions ?? []).join('\n'),
      followUpRequired: initialValues?.followUpRequired ?? false,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset({
      patientId: initialValues?.patientId ?? '',
      title: initialValues?.title ?? '',
      diagnosis: initialValues?.diagnosis ?? '',
      prescriptionsText: (initialValues?.prescriptions ?? []).join('\n'),
      followUpRequired: initialValues?.followUpRequired ?? false,
    });
  }, [initialValues, reset]);

  const patientId = watch('patientId');
  const patientLabel = useMemo(() => {
    const p = patients.find((x) => x.id === patientId);
    return p?.name ?? '';
  }, [patientId, patients]);

  const inputBase =
    'h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';
  const textAreaBase =
    'min-h-[104px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';
  const labelBase =
    'mb-2 text-start font-cairo text-[12px] font-extrabold text-[#111827]';

  const onSubmit = (values: MedicalRecordFormValues) => {
    const prescriptions = (values.prescriptionsText ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onSave?.({
      patientId: values.patientId,
      title: values.title.trim(),
      diagnosis: values.diagnosis.trim(),
      prescriptions,
      followUpRequired: values.followUpRequired,
    });
  };

  return (
    <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
      <div className='relative border-b border-[#EEF2F6] px-8 py-5'>
        <div className='text-start font-cairo text-[16px] font-extrabold text-[#111827]'>
          {resolvedTitle}
        </div>
        {description ? (
          <p className='mt-2 max-w-2xl text-start font-cairo text-[12px] font-semibold leading-6 text-[#667085]'>
            {description}
          </p>
        ) : null}
        <button
          type='button'
          onClick={onCancel}
          className='absolute start-6 top-1/2 -translate-y-1/2 flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[#EEF2F6] bg-white text-[#667085]'
          aria-label={t('common.close')}
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='px-8 pt-6 pb-8'>
        <div className='grid grid-cols-1 gap-5'>
          <div>
            <div className={labelBase}>{t('doctor.addAccessRequestForm.selectPatientLabel')}</div>
            <Controller
              name='patientId'
              control={control}
              render={({ field }) => (
                <StyledSelect
                  options={patients.map((p) => ({ value: p.id, label: p.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('doctor.addAccessRequestForm.selectPatientPlaceholder')}
                  error={Boolean(errors.patientId)}
                  disabled={patientLocked}
                  emptyTriggerLabel={t('doctor.addAccessRequestForm.noPatientsInList')}
                  emptyState={t('doctor.addAccessRequestForm.noPatientsAvailable')}
                  listboxAriaLabel={t('doctor.addAccessRequestForm.selectPatientAria')}
                />
              )}
            />
            {errors.patientId?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.patientId.message}
              </div>
            ) : null}
            {patientLabel ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                {patientLabel}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>{t('doctor.createMedicalRecordForm.recordTitleLabel')}</div>
            <input
              {...register('title')}
              className={inputBase}
              placeholder={t('doctor.createMedicalRecordForm.recordTitlePlaceholder')}
            />
            {errors.title?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.title.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>{t('doctor.createMedicalRecordForm.diagnosisLabel')}</div>
            <textarea
              {...register('diagnosis')}
              className={textAreaBase}
              placeholder={t('doctor.createMedicalRecordForm.diagnosisPlaceholder')}
            />
            {errors.diagnosis?.message ? (
              <div className='mt-2 text-start font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.diagnosis.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>{t('doctor.createMedicalRecordForm.prescriptionsLabel')}</div>
            <textarea
              {...register('prescriptionsText')}
              className={textAreaBase}
              placeholder={t('doctor.createMedicalRecordForm.prescriptionsPlaceholder')}
            />
          </div>

          <label className='flex items-center justify-between rounded-[10px] border border-[#D6F5F3] bg-[#F0FDFC] px-4 py-4'>
            <div className='text-start'>
              <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                {t('doctor.createMedicalRecordForm.needsFollowUp')}
              </div>
            </div>
            <AppCheckbox
              size='md'
              {...register('followUpRequired')}
            />
          </label>

          <div className='flex gap-4 justify-end items-center mt-2'>
            <motion.button
              type='button'
              onClick={onCancel}
              className='flex h-[44px] w-[220px] items-center justify-center rounded-[6px] border border-primary bg-white font-cairo text-[13px] font-extrabold text-primary'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              {t('common.cancel')}
            </motion.button>

            <motion.button
              type='submit'
              disabled={isSubmitting}
              className='flex h-[44px] w-[220px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] disabled:opacity-60'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Save className='w-4 h-4' />
              {resolvedSubmitLabel}
            </motion.button>
          </div>
        </div>
      </form>
    </section>
  );
}
