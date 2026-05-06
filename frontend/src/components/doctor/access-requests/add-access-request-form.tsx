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
  ChevronDown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

type PatientOption = {
  id: string;
  name: string;
};

type AccessScope = 'medical-records' | 'prescriptions' | 'diagnosis-tests';

const addAccessRequestSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  scope: z.enum(['medical-records', 'prescriptions', 'diagnosis-tests'], {
    message: 'حدد ما تريد الوصول له',
  }),
  reason: z.string().min(2, 'سبب الطلب مطلوب'),
});

type AddAccessRequestValues = z.input<typeof addAccessRequestSchema>;

function scopeCardMeta(scope: AccessScope) {
  switch (scope) {
    case 'prescriptions':
      return {
        label: 'الأدوية والوصفات',
        subtitle: 'الأدوية النشطة السابقة والوصفات الطبية',
        border: 'border-[#22C55E]',
        bg: 'bg-[#ECFDF3]',
        accent: 'text-[#027A48]',
        radioBorder: 'border-[#22C55E]',
        icon: <Link className='h-4 w-4 text-[#16A34A]' />,
      };
    case 'medical-records':
      return {
        label: 'السجلات الطبية',
        subtitle: 'جمع السجلات والفحوصات الطبية',
        border: 'border-primary',
        bg: 'bg-[#F8FAFC]',
        accent: 'text-[#0F8F8B]',
        radioBorder: 'border-[#D0D5DD]',
        icon: <FileText className='h-4 w-4 text-[#98A2B3]' />,
      };
    case 'diagnosis-tests':
      return {
        label: 'التشخيصات والتحاليل',
        subtitle: 'جمع التشخيصات والتحاليل المرضية',
        border: 'border-[#A855F7]',
        bg: 'bg-[#F5F3FF]',
        accent: 'text-[#7C3AED]',
        radioBorder: 'border-[#A855F7]',
        icon: <Activity className='h-4 w-4 text-[#A855F7]' />,
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
    scope: AccessScope;
    reason: string;
  }) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddAccessRequestValues>({
    resolver: zodResolver(addAccessRequestSchema),
    defaultValues: {
      patientId: '',
      reason: '',
    },
    mode: 'onSubmit',
  });

  const patientId = watch('patientId');
  const scope = watch('scope') as AccessScope | undefined;

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

  const [localScope, setLocalScope] = useState<AccessScope | null>(null);

  const handlePickScope = (s: AccessScope) => {
    setLocalScope(s);
    setValue('scope', s, { shouldValidate: true });
  };

  const submit = (values: AddAccessRequestValues) => {
    onSubmit?.({
      patientId: values.patientId,
      scope: values.scope as AccessScope,
      reason: values.reason,
    });
  };

  return (
    <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
      <div className='border-b border-[#EEF2F6] px-8 py-5'>
        <div className='text-right font-cairo text-[15px] font-extrabold text-[#111827]'>
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
          </div>

          <div className='rounded-[16px] border border-[#BFEDEC] bg-[#0F8F8B1A] px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]'>
            <div className='flex w-full items-start justify-between gap-4'>
              <div className='flex flex-row-reverse items-start gap-3'>
                <div className='text-right'>
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
            <div className={labelBase}>حدد ما تريد الوصول له</div>
            <div className='grid grid-cols-1 gap-3'>
              {(
                [
                  'prescriptions',
                  'medical-records',
                  'diagnosis-tests',
                ] as AccessScope[]
              ).map((s) => {
                const meta = scopeCardMeta(s);
                const active = (scope ?? localScope) === s;

                return (
                  <button
                    key={s}
                    type='button'
                    onClick={() => handlePickScope(s)}
                    className={`w-full rounded-[6px] border px-4 py-3 text-right ${active ? meta.border : 'border-[#E5E7EB]'} ${active ? meta.bg : 'bg-white'}`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-start gap-3'>
                        <div className='flex h-[28px] w-[28px] items-center justify-center rounded-[10px] bg-white'>
                          {meta.icon}
                        </div>

                        <div>
                          <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                            {meta.label}
                          </div>
                          <div className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                            {meta.subtitle}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border ${active ? meta.radioBorder : 'border-[#D0D5DD]'} bg-white`}
                        aria-hidden
                      >
                        {active ? (
                          <span
                            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full ${s === 'prescriptions' ? 'bg-[#22C55E]' : s === 'diagnosis-tests' ? 'bg-[#A855F7]' : 'bg-primary'}`}
                          >
                            <Check className='h-3 w-3 text-white' />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.scope?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.scope.message}
              </div>
            ) : null}
          </div>

          <div>
            <div className={labelBase}>سبب الطلب</div>
            <textarea
              {...register('reason')}
              className={textAreaBase}
              placeholder='اشرح سبب طلب الوصول للبيانات الطبية...'
            />
            {errors.reason?.message ? (
              <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                {errors.reason.message}
              </div>
            ) : null}
          </div>

          <div className='rounded-[6px] bg-[#E9FFFE] px-5 py-4 text-right'>
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
