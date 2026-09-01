'use client';

import {
  ArrowRight,
  Globe,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppCheckbox } from '@/components/ui';
import { useI18n } from '@/i18n/provider';

import {
  step4AdditionalSchema,
  type Step4AdditionalValues,
} from './signup-schemas';

export default function SignUpStep4Additional({
  onPrev,
  onNext,
  defaultValues,
}: {
  onPrev: () => void;
  onNext: (values: Step4AdditionalValues) => void;
  defaultValues?: Partial<Step4AdditionalValues>;
}) {
  const { t } = useI18n();
  const { register, handleSubmit } = useForm<Step4AdditionalValues>({
    resolver: zodResolver(step4AdditionalSchema),
    defaultValues: {
      city: defaultValues?.city ?? '',
      country: defaultValues?.country ?? '',
      consultationOnline: defaultValues?.consultationOnline ?? false,
      consultationOffline: defaultValues?.consultationOffline ?? false,
    },
    mode: 'onSubmit',
  });

  return (
    <>
      <div className='flex flex-col items-center mt-7 text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]'>
          <Sparkles className='w-9 h-9 text-white' />
        </div>
        <div className='flex gap-3 justify-center items-center mt-4'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            {t('signup.step4.title')}
          </h2>
        </div>
        <p className='mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]'>
          {t('signup.step4.subtitle')}
        </p>
      </div>

      <form
        className='mt-8'
        onSubmit={handleSubmit((values) => onNext(values))}
      >
        <div className='space-y-5'>
          <div>
            <div className='flex gap-2 justify-start items-center text-start'>
              <MapPin className='w-4 h-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step4.city.label')}
              </span>
            </div>
            <input
              type='text'
              placeholder={t('signup.step4.city.placeholder')}
              {...register('city')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
          </div>

          <div>
            <div className='flex gap-2 justify-start items-center text-start'>
              <Globe className='w-4 h-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step4.country.label')}
              </span>
            </div>
            <input
              type='text'
              placeholder={t('signup.step4.country.placeholder')}
              {...register('country')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
          </div>

          <div className='rounded-[6px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 text-start'>
            <div className='font-cairo text-[14px] font-bold text-[#374151]'>
              {t('signup.step4.consultationModes.title')}{' '}
              <span className='text-[12px] font-semibold text-[#98A2B3]'>
                ({t('signup.step4.consultationModes.optional')})
              </span>
            </div>
            <p className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
              {t('signup.step4.consultationModes.hint')}
            </p>
            <div className='flex flex-col gap-3 mt-3 sm:flex-row sm:flex-wrap sm:justify-end'>
              <label className='flex cursor-pointer items-center justify-end gap-2 font-cairo text-[13px] font-semibold text-[#374151]'>
                <span>{t('signup.step4.consultationModes.online')}</span>
                <AppCheckbox
                  size='sm'
                  {...register('consultationOnline')}
                />
              </label>
              <label className='flex cursor-pointer items-center justify-end gap-2 font-cairo text-[13px] font-semibold text-[#374151]'>
                <span>{t('signup.step4.consultationModes.offline')}</span>
                <AppCheckbox
                  size='sm'
                  {...register('consultationOffline')}
                />
              </label>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between gap-4 rounded-[6px] border border-[#B9F3EA] bg-[#EFFFFD] px-5 py-4'>
            <div className='flex justify-center items-center w-10 h-10 rounded-full bg-primary/15 text-primary'>
              <Shield className='w-5 h-5' />
            </div>
            <div className='flex-1 text-start'>
              <div className='font-cairo text-[14px] font-extrabold text-[#101828]'>
                {t('signup.step4.notice.title')}
              </div>
              <div className='mt-1 font-cairo text-[13px] font-semibold leading-[22px] text-[#4A5565]'>
                {t('signup.step4.notice.body')}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mt-8'>
            <button
              type='button'
              onClick={onPrev}
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <ArrowRight className='w-4 h-4' />
              {t('signup.step4.previous')}
            </button>
            <button
              type='submit'
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15, 143, 139,0.35)] transition-colors hover:bg-[#14B3AE]'
            >
              {t('signup.step4.next')}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
