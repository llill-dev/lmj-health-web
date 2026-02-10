'use client';

import {
  ArrowRight,
  CircleCheck,
  MapPin,
  Shield,
  Sparkles,
  Globe,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  step4AdditionalSchema,
  type Step4AdditionalValues,
} from './signup-schemas';

export default function SignUpStep4Additional({
  onPrev,
  onComplete,
  defaultValues,
}: {
  onPrev: () => void;
  onComplete: (values: Step4AdditionalValues) => void;
  defaultValues?: Partial<Step4AdditionalValues>;
}) {
  const { register, handleSubmit, setValue } = useForm<Step4AdditionalValues>({
    resolver: zodResolver(step4AdditionalSchema),
    defaultValues: {
      city: defaultValues?.city ?? '',
      country: defaultValues?.country ?? '',
    },
    mode: 'onSubmit',
  });

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[16px] bg-[#16C5C0] shadow-[0_18px_40px_rgba(22,197,192,0.35)]'>
          <Sparkles className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            الإعدادات الإضافية
          </h2>
          <button
            type='button'
            onClick={() => {
              setValue('city', 'دمشق', { shouldDirty: true });
              setValue('country', 'سوريا', { shouldDirty: true });
            }}
            className='rounded-full border border-[#16C5C0]/35 bg-[#EFFFFD] px-3 py-1 font-cairo text-[12px] font-bold text-[#16C5C0]'
          >
            ملء البيانات
          </button>
        </div>
        <p className='mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]'>
          اختياري - يمكنك تخطي هذه الخطوة
        </p>
      </div>

      <form
        className='mt-8'
        onSubmit={handleSubmit((values) => onComplete(values))}
      >
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <MapPin className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                المدينة
              </span>
            </div>
            <input
              type='text'
              placeholder='مزة، دمشق ...'
              {...register('city')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Globe className='h-4 w-4 text-[#16C5C0]' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                الدولة
              </span>
            </div>
            <input
              type='text'
              placeholder='سوريا'
              {...register('country')}
              className='mt-2 h-[48px] w-full rounded-[10px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-[#16C5C0]'
            />
          </div>

          <div className='mt-4 flex items-center justify-between gap-4 rounded-[16px] border border-[#B9F3EA] bg-[#EFFFFD] px-5 py-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#16C5C0]/15 text-[#16C5C0]'>
              <Shield className='h-5 w-5' />
            </div>
            <div className='flex-1 text-right'>
              <div className='font-cairo text-[14px] font-extrabold text-[#101828]'>
                ملاحظة هامة
              </div>
              <div className='mt-1 font-cairo text-[13px] font-semibold leading-[22px] text-[#4A5565]'>
                بعد إتمام التسجيل، سيتم مراجعة بياناتك من قبل الإدارة ليتمكن من
                استقبال المواعيد أو الظهور في البحث حتى يتم الموافقة على حسابك.
              </div>
            </div>
          </div>

          <div className='mt-8 grid grid-cols-2 gap-4'>
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
              <CircleCheck className='h-4 w-4' />
              إتمام التسجيل
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
