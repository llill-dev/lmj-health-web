'use client';
import { useMemo } from 'react';
import { ChevronDown, PenLine, Plus, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

type PatientOption = {
  id: string;
  name: string;
};

const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  diagnosis: z.string().min(2, 'التشخيص مطلوب'),
  symptoms: z.string().min(2, 'الأعراض مطلوبة'),
  address: z.string().min(2, 'العنوان مطلوب'),
  bloodPressure: z.string().optional().default(''),
  pulse: z.string().optional().default(''),
  temperature: z.string().optional().default(''),
  weight: z.string().optional().default(''),
  treatment: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  followUpDate: z.string().optional().default(''),
});

type CreateMedicalRecordFormValues = z.input<typeof createMedicalRecordSchema>;

export default function CreateMedicalRecordForm({
  patients,
  onCancel,
  onSave,
}: {
  patients: PatientOption[];
  onCancel: () => void;
  onSave?: (payload: {
    patientId: string;
    diagnosis: string;
    symptoms: string;
    address: string;
    vitals: {
      bloodPressure: string;
      pulse: string;
      temperature: string;
      weight: string;
    };
    treatment: string;
    notes: string;
    followUpDate: string;
  }) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMedicalRecordFormValues>({
    resolver: zodResolver(createMedicalRecordSchema),
    defaultValues: {
      patientId: '',
      diagnosis: '',
      symptoms: '',
      address: '',
      bloodPressure: '',
      pulse: '',
      temperature: '',
      weight: '',
      treatment: '',
      notes: '',
      followUpDate: '',
    },
    mode: 'onSubmit',
  });

  const patientId = watch('patientId');

  const patientLabel = useMemo(() => {
    const p = patients.find((x) => x.id === patientId);
    return p?.name ?? '';
  }, [patientId, patients]);

  const inputBase =
    'h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';

  const textAreaBase =
    'min-h-[88px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';

  const labelBase =
    'mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]';

  const onSubmit = (values: CreateMedicalRecordFormValues) => {
    onSave?.({
      patientId: values.patientId,
      diagnosis: values.diagnosis,
      symptoms: values.symptoms,
      address: values.address,
      vitals: {
        bloodPressure: values.bloodPressure ?? '',
        pulse: values.pulse ?? '',
        temperature: values.temperature ?? '',
        weight: values.weight ?? '',
      },
      treatment: values.treatment ?? '',
      notes: values.notes ?? '',
      followUpDate: values.followUpDate ?? '',
    });
  };

  return (
    <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
      <div className='relative border-b border-[#EEF2F6] px-8 py-5'>
        <div className='text-right font-cairo text-[16px] font-extrabold text-[#111827]'>
          إنشاء سجل طبي جديد
        </div>
        <button
          type='button'
          onClick={onCancel}
          className='absolute left-6 top-1/2 -translate-y-1/2 flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[#EEF2F6] bg-white text-[#667085]'
          aria-label='إغلاق'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='px-8 pb-8 pt-6'
      >
        <div className='grid grid-cols-1 gap-5'>
          <div>
            <div className={labelBase}>اختر المريض</div>
            <div className='relative'>
              <select
                {...register('patientId')}
                className={`${inputBase} appearance-none pl-10`}
              >
                <option
                  value=''
                  disabled
                >
                  اختر المريض...
                </option>
                {patients.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
              <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <ChevronDown />
              </div>
            </div>
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
            <div className={labelBase}>التشخيص</div>
            <input
              {...register('diagnosis')}
              className={inputBase}
              placeholder='اكتب التشخيص...'
            />
            {errors.diagnosis?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.diagnosis.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>الأعراض</div>
            <textarea
              {...register('symptoms')}
              className={textAreaBase}
              placeholder='صف الأعراض...'
            />
            {errors.symptoms?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.symptoms.message}
              </div>
            ) : null}
          </div>

          <div className='mt-1'>
            <div className='mb-3 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
              العلامات الحيوية (اختياري)
            </div>
            <div className='grid grid-cols-4 gap-4'>
              <input
                {...register('bloodPressure')}
                className={inputBase}
                placeholder='ضغط الدم'
              />
              <input
                {...register('pulse')}
                className={inputBase}
                placeholder='النبض'
              />
              <input
                {...register('temperature')}
                className={inputBase}
                placeholder='الحرارة'
              />
              <input
                {...register('weight')}
                className={inputBase}
                placeholder='الوزن'
              />
            </div>
          </div>

          <div className='mt-1 rounded-[10px] border-[1.82px] border-[#EEF2F6] bg-[#FFFFFF] px-4 py-4'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='text-right font-cairo text-[14px] font-extrabold text-[#98A2B3]'>
                الأدوية الموصوفة
              </div>
              <PenLine className='h-4 w-4 text-primary' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <input
                className={inputBase}
                placeholder='اسم الدواء *'
              />
              <input
                className={inputBase}
                placeholder='الجرعة (مثال: قرص واحد) *'
              />
              <input
                className={inputBase}
                placeholder='التكرار (مثال: 3 مرات يومياً) *'
              />
              <input
                className={inputBase}
                placeholder='المدة (مثال: 7 أيام) *'
              />
            </div>

            <div className='mt-4'>
              <input
                className={inputBase}
                placeholder='تعليمات إضافية (مثال: بعد الأكل)'
              />
            </div>

            <button
              type='button'
              className='mt-4 flex h-[52px] w-full items-center justify-center gap-3 rounded-[8px] bg-gradient-to-r from-[#0F8F8B] to-[#0F8F8B] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.28)]'
            >
              <span>إضافة الدواء</span>
              <Plus className='h-5 w-5' />
            </button>
          </div>

          <div>
            <div className={labelBase}>العلاج</div>
            <textarea
              {...register('treatment')}
              className={textAreaBase}
              placeholder='خطة العلاج...'
            />
          </div>

          <div>
            <div className={labelBase}>ملاحظات</div>
            <textarea
              {...register('notes')}
              className={textAreaBase}
              placeholder='ملاحظات إضافية...'
            />
          </div>

          <div>
            <div className={labelBase}>موعد المتابعة</div>
            <input
              type='date'
              {...register('followUpDate')}
              className={inputBase}
            />
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
              className='flex h-[44px] w-[220px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(15, 143, 139,0.30)]'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Save className='h-4 w-4' />
              حفظ السجل
            </motion.button>
          </div>
        </div>
      </form>
    </section>
  );
}
