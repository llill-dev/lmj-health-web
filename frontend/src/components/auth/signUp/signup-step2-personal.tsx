'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  User,
  Heart,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  step2PersonalSchema,
  type Step2PersonalValues,
} from './signup-schemas';

export default function SignUpStep2Personal({
  onPrev,
  onNext,
  defaultValues,
}: {
  onPrev: () => void;
  onNext: (values: Step2PersonalValues) => void;
  defaultValues?: Partial<Step2PersonalValues>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2PersonalValues>({
    resolver: zodResolver(step2PersonalSchema),
    defaultValues: {
      gender: defaultValues?.gender as any,
      birthDate: defaultValues?.birthDate ?? '',
      address: defaultValues?.address ?? '',
    },
    mode: 'onSubmit',
  });

  const gender = watch('gender');

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]'>
          <Heart className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            المعلومات الشخصية
          </h2>
          <button
            type='button'
            onClick={() => {
              setValue('gender', 'male', { shouldDirty: true });
              setValue('birthDate', '1990-01-01', { shouldDirty: true });
              setValue('address', 'دمشق - المزة', { shouldDirty: true });
            }}
            className='rounded-full border border-primary/35 bg-[#EFFFFD] px-3 py-1 font-cairo text-[12px] font-bold text-primary'
          >
            ملء البيانات
          </button>
        </div>
        <p className='mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]'>
          بياناتك الشخصية الأساسية
        </p>
      </div>

      <form
        className='mt-8'
        onSubmit={handleSubmit((values) => onNext(values))}
      >
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <User className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                الجنس
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>

            <div className='mt-3 grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => setValue('gender', 'male')}
                className={
                  gender === 'male'
                    ? 'flex h-[54px] items-center justify-center rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[16px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
                    : 'flex h-[54px] items-center justify-center rounded-[6px] border border-primary bg-white font-cairo text-[16px] font-bold text-[#6B7280]'
                }
              >
                ذكر
              </button>

              <button
                type='button'
                onClick={() => setValue('gender', 'female')}
                className={
                  gender === 'female'
                    ? 'flex h-[54px] items-center justify-center rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[16px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
                    : 'flex h-[54px] items-center justify-center rounded-[6px] border border-primary bg-white font-cairo text-[16px] font-bold text-[#6B7280]'
                }
              >
                أنثى
              </button>
            </div>
            {errors.gender?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.gender.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <CalendarDays className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                تاريخ الميلاد
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              {...register('birthDate')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.birthDate?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.birthDate.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <MapPin className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                العنوان
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='المدينة, الحي, الشارع'
              {...register('address')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.address?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.address.message}
              </div>
            )}
          </div>

          <div className='mt-6 grid grid-cols-2 gap-4'>
            <button
              type='button'
              onClick={onPrev}
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <ArrowRight className='h-4 w-4' />
              السابق
            </button>
            <button
              type='submit'
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15, 143, 139,0.35)] transition-colors hover:bg-[#14B3AE]'
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
