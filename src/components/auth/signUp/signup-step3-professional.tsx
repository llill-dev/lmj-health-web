'use client';

import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  IdCard,
  MapPin,
  Stethoscope,
  Text,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  step3ProfessionalSchema,
  type Step3ProfessionalValues,
} from './signup-schemas';

export default function SignUpStep3Professional({
  onPrev,
  onNext,
  defaultValues,
}: {
  onPrev: () => void;
  onNext: (values: Step3ProfessionalValues) => void;
  defaultValues?: Partial<Step3ProfessionalValues>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step3ProfessionalValues>({
    resolver: zodResolver(step3ProfessionalSchema),
    defaultValues: {
      specialty: defaultValues?.specialty ?? '',
      licenseNumber: defaultValues?.licenseNumber ?? '',
      qualification: defaultValues?.qualification ?? '',
      clinicAddress: defaultValues?.clinicAddress ?? '',
      bio: defaultValues?.bio ?? '',
    },
    mode: 'onSubmit',
  });

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[16px] bg-[#16C5C0] shadow-[0_18px_40px_rgba(22,197,192,0.35)]'>
          <Stethoscope className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            المعلومات المهنية
          </h2>
          <button
            type='button'
            onClick={() => {
              setValue('specialty', 'طب القلب', { shouldDirty: true });
              setValue('licenseNumber', 'SY-123456', { shouldDirty: true });
              setValue('qualification', 'جامعة دمشق - كلية الطب', {
                shouldDirty: true,
              });
              setValue('clinicAddress', 'دمشق - المزة - شارع رئيسي', {
                shouldDirty: true,
              });
              setValue('bio', 'طبيب مختص مع خبرة أكثر من 10 سنوات.', {
                shouldDirty: true,
              });
            }}
            className='rounded-full border border-[#16C5C0]/35 bg-[#EFFFFD] px-3 py-1 font-cairo text-[12px] font-bold text-[#16C5C0]'
          >
            ملء البيانات
          </button>
        </div>
        <p className='mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]'>
          بياناتك الطبية والمهنية
        </p>
      </div>

      <form
        className='mt-8'
        onSubmit={handleSubmit((values) => onNext(values))}
      >
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Stethoscope className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                التخصص
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='مثال: طب القلب, الأطفال, الأسنان'
              {...register('specialty')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
            {errors.specialty?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.specialty.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <IdCard className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                رقم مزاولة المهنة
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='رقم الترخيص الطبي'
              {...register('licenseNumber')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
            {errors.licenseNumber?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.licenseNumber.message}
              </div>
            )}
            <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              سيتم مراجعة هذا الرقم من قبل الإدارة
            </p>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <GraduationCap className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                المؤهل العلمي
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='مثال: جامعة دمشق - كلية الطب'
              {...register('qualification')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
            {errors.qualification?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.qualification.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <MapPin className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                عنوان العيادة
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='موقع عيادتك'
              {...register('clinicAddress')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
            {errors.clinicAddress?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.clinicAddress.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Text className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                النبذة التعريفية
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <textarea
              rows={4}
              placeholder='اكتب نبذة عنك وعن خبراتك...'
              {...register('bio')}
              className='mt-2 h-[120px] w-full resize-none rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-3 text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
            {errors.bio?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.bio.message}
              </div>
            )}
          </div>

          <div className='mt-6 grid grid-cols-2 gap-4'>
            <button
              type='button'
              onClick={onPrev}
              className='flex h-[54px] items-center justify-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <ArrowRight className='h-4 w-4' />
              السابق
            </button>
            <button
              type='submit'
              className='flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-[#16C5C0] font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(22,197,192,0.35)] transition-colors hover:bg-[#14B3AE]'
            >
              التالي
              <ArrowLeft className='h-4 w-4' />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
