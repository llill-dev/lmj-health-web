'use client';

import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { step1AccountSchema, type Step1AccountValues } from './signup-schemas';

type VerificationChannel = 'whatsapp' | 'email';

export default function SignUpStep1Account({
  onBack,
  onNext,
  defaultValues,
}: {
  onBack: () => void;
  onNext: (values: Step1AccountValues) => void;
  defaultValues?: Partial<Step1AccountValues>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1AccountValues>({
    resolver: zodResolver(step1AccountSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      email: defaultValues?.email ?? '',
      password: defaultValues?.password ?? '',
      phone: defaultValues?.phone ?? '',
      channel: (defaultValues?.channel as VerificationChannel) ?? 'whatsapp',
    },
    mode: 'onSubmit',
  });

  const channel = watch('channel');

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]'>
          <User className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[22px] font-extrabold text-[#101828]'>
            معلومات الحساب
          </h2>
          <button
            type='button'
            onClick={() => {
              setValue('fullName', 'د. محمد أحمد', { shouldDirty: true });
              setValue('email', 'doctor@example.com', { shouldDirty: true });
              setValue('password', 'Password123', { shouldDirty: true });
              setValue('phone', '+966501234567', { shouldDirty: true });
              setValue('channel', 'whatsapp', { shouldDirty: true });
            }}
            className='rounded-full border border-primary/35 bg-[#EFFFFD] px-3 py-1 font-cairo text-[12px] font-bold text-primary'
          >
            ملء البيانات
          </button>
        </div>
        <p className='mt-1 font-cairo text-[13px] font-semibold text-[#667085]'>
          أدخل بياناتك الأساسية لإنشاء حساب
        </p>
      </div>

      <form
        className='mt-6'
        onSubmit={handleSubmit((values) => onNext(values))}
      >
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <User className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                الاسم الكامل
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder='د. محمد أحمد'
              {...register('fullName')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-12 py-[4px] font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.fullName?.message ? 'text-red-500' : 'text-transparent'
              }`}
            >
              {errors.fullName?.message ?? 'x'}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Mail className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                البريد الإلكتروني
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='email'
              placeholder='doctor@example.com'
              {...register('email')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-12 py-[4px] font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.email?.message ? 'text-red-500' : 'text-transparent'
              }`}
            >
              {errors.email?.message ?? 'x'}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <LockKeyhole className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                كلمة المرور
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='password'
              placeholder='••••••••'
              {...register('password')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-12 py-[4px] font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.password?.message ? 'text-red-500' : 'text-transparent'
              }`}
            >
              {errors.password?.message ?? 'x'}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Phone className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                رقم الهاتف
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='tel'
              placeholder='+966 50 123 4567'
              {...register('phone')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-12 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.phone?.message ? 'text-red-500' : 'text-transparent'
              }`}
            >
              {errors.phone?.message ?? 'x'}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                قناة التحقق
              </span>
              <span className='font-cairo text-[14px] font-bold text-primary'>
                *
              </span>
            </div>

            <div className='mt-2 grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => setValue('channel', 'whatsapp')}
                className={
                  channel === 'whatsapp'
                    ? 'flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[14px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
                    : 'flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#6B7280]'
                }
              >
                واتساب
                <Phone className='h-5 w-5' />
              </button>

              <button
                type='button'
                onClick={() => setValue('channel', 'email')}
                className={
                  channel === 'email'
                    ? 'flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-primary bg-[#EFFFFD] font-cairo text-[14px] font-bold text-primary shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
                    : 'flex h-[70px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#6B7280]'
                }
              >
                البريد
                <Mail className='h-5 w-5' />
              </button>
            </div>
            <div
              className={`mt-1 min-h-[18px] font-cairo text-[12px] font-semibold ${
                errors.channel?.message ? 'text-red-500' : 'text-transparent'
              }`}
            >
              {errors.channel?.message ?? 'x'}
            </div>
          </div>

          <div className='mt-2 grid grid-cols-2 gap-4'>
            <button
              type='button'
              onClick={onBack}
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <ArrowRight className='h-4 w-4' />
              رجوع
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
