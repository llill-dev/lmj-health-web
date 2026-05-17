'use client';
import { useEffect, useMemo } from 'react';
import { Save, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import StyledSelect from '@/components/ui/styled-select';

type PatientOption = {
  id: string;
  name: string;
};

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  title: z.string().trim().min(2, 'عنوان السجل مطلوب'),
  diagnosis: z.string().trim().min(2, 'التشخيص مطلوب'),
  prescriptionsText: z.string().trim().optional().default(''),
  followUpRequired: z.boolean().default(false),
});

type MedicalRecordFormValues = z.input<typeof medicalRecordSchema>;

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
  submitLabel = 'حفظ السجل',
  title = 'إنشاء سجل طبي جديد',
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
    'mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]';

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
        <div className='text-right font-cairo text-[16px] font-extrabold text-[#111827]'>
          {title}
        </div>
        {description ? (
          <p className='mt-2 max-w-2xl text-right font-cairo text-[12px] font-semibold leading-6 text-[#667085]'>
            {description}
          </p>
        ) : null}
        <button
          type='button'
          onClick={onCancel}
          className='absolute left-6 top-1/2 -translate-y-1/2 flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[#EEF2F6] bg-white text-[#667085]'
          aria-label='إغلاق'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='px-8 pb-8 pt-6'>
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
                  disabled={patientLocked}
                  emptyTriggerLabel='لا يوجد مرضى في القائمة'
                  emptyState='لا يوجد مرضى متاحين للاختيار.'
                  listboxAriaLabel='اختيار المريض'
                />
              )}
            />
            {errors.patientId?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.patientId.message}
              </div>
            ) : null}
            {patientLabel ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                {patientLabel}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>عنوان السجل</div>
            <input
              {...register('title')}
              className={inputBase}
              placeholder='مثال: متابعة ضغط الدم'
            />
            {errors.title?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.title.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>التشخيص</div>
            <textarea
              {...register('diagnosis')}
              className={textAreaBase}
              placeholder='اكتب التشخيص الطبي كما سيُحفَظ في السجل...'
            />
            {errors.diagnosis?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.diagnosis.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>الوصفات الطبية</div>
            <textarea
              {...register('prescriptionsText')}
              className={textAreaBase}
              placeholder='أدخل كل وصفة في سطر مستقل، مثال:&#10;Paracetamol 500mg&#10;Vitamin D 1000 IU'
            />
            <p className='mt-2 text-right font-cairo text-[11px] font-semibold leading-6 text-[#667085]'>
              سيتم إرسال كل سطر غير فارغ كوصفة مستقلة داخل حقل <span dir='ltr'>prescriptions[]</span>.
            </p>
          </div>

          <label className='flex items-center justify-between rounded-[10px] border border-[#D6F5F3] bg-[#F0FDFC] px-4 py-4'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                يحتاج متابعة
              </div>
              <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                يرسل هذا الخيار القيمة <span dir='ltr'>followUpRequired=true</span> إلى الـ API.
              </div>
            </div>
            <input
              type='checkbox'
              {...register('followUpRequired')}
              className='h-5 w-5 rounded border-[#98A2B3] text-primary focus:ring-primary'
            />
          </label>

          <div className='rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FAFBFC] px-4 py-4 text-right font-cairo text-[12px] font-semibold leading-6 text-[#667085]'>
            الحقول المدعومة حاليًا في هذا التدفق هي: العنوان، التشخيص، الوصفات النصية، وحالة المتابعة.
            بيانات العلامات الحيوية والملاحظات التفصيلية والمرفقات تحتاج تكامل API إضافي قبل عرضها كنموذج تحرير كامل.
          </div>

          <div className='mt-2 flex items-center justify-end gap-4'>
            <motion.button
              type='button'
              onClick={onCancel}
              className='flex h-[44px] w-[220px] items-center justify-center rounded-[6px] border border-primary bg-white font-cairo text-[13px] font-extrabold text-primary'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              إلغاء
            </motion.button>

            <motion.button
              type='submit'
              disabled={isSubmitting}
              className='flex h-[44px] w-[220px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] disabled:opacity-60'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Save className='h-4 w-4' />
              {submitLabel}
            </motion.button>
          </div>
        </div>
      </form>
    </section>
  );
}
