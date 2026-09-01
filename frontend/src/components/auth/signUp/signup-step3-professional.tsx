'use client';

import { useEffect, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  IdCard,
  Loader2,
  MapPin,
  Stethoscope,
  Text,
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useDoctorSignupSpecialties } from '@/hooks/shared';

import StyledSelect from '@/components/ui/styled-select';

import {
  step3ProfessionalSchema,
  type Step3ProfessionalValues,
} from './signup-schemas';
import { useI18n } from '@/i18n/provider';

export default function SignUpStep3Professional({
  onPrev,
  onNext,
  defaultValues,
  serverLicenseMessage,
  onDismissServerLicenseMessage,
}: {
  onPrev: () => void;
  onNext: (values: Step3ProfessionalValues) => void;
  defaultValues?: Partial<Step3ProfessionalValues>;
  /** خطأ الخادم لتعارض رقم الترخيص — لا يخلط مع قناة واتساب/البريد */
  serverLicenseMessage?: string | null;
  onDismissServerLicenseMessage?: () => void;
}) {
  const {
    data: specialties = [],
    isLoading: specialtiesLoading,
    isError: specialtiesError,
    refetch: refetchSpecialties,
  } = useDoctorSignupSpecialties();

  const { t, locale } = useI18n();
  const hasSpecialtyCatalog =
    !specialtiesError && !specialtiesLoading && specialties.length > 0;

  const [specialtyInputMode, setSpecialtyInputMode] = useState<'catalog' | 'manual'>(
    () => (defaultValues?.specialtySource === 'manual' ? 'manual' : 'catalog'),
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3ProfessionalValues>({
    resolver: zodResolver(step3ProfessionalSchema(locale)),
    defaultValues: {
      specialty: defaultValues?.specialty ?? '',
      specialtySource: defaultValues?.specialtySource ?? 'manual',
      licenseNumber: defaultValues?.licenseNumber ?? '',
      qualification: defaultValues?.qualification ?? '',
      clinicAddress: defaultValues?.clinicAddress ?? '',
      bio: defaultValues?.bio ?? '',
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (specialtyInputMode === 'manual' || !hasSpecialtyCatalog) {
      setValue('specialtySource', 'manual', {
        shouldValidate: false,
        shouldDirty: false,
      });
      return;
    }
    setValue('specialtySource', 'catalog', {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [hasSpecialtyCatalog, specialtyInputMode, setValue]);

  const useCatalogSpecialty =
    hasSpecialtyCatalog && specialtyInputMode === 'catalog';

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]'>
          <Stethoscope className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            {t('signup.step3.title')}
          </h2>
        </div>
        <p className='mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]'>
          {t('signup.step3.subtitle')}
        </p>
      </div>

      <form
        className='mt-8'
        onSubmit={handleSubmit((values) => onNext(values))}
      >
        <input
          type='hidden'
          {...register('specialtySource')}
        />
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-start'>
              <Stethoscope className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step3.specialty.label')}
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            {specialtiesError && (
              <div className='mt-2 flex flex-col gap-2 rounded-[6px] border border-amber-200 bg-amber-50 px-3 py-2 text-start'>
                <p className='font-cairo text-[12px] font-semibold text-amber-900'>
                  {t('signup.step3.specialty.loadError')}
                </p>
                <button
                  type='button'
                  onClick={() => void refetchSpecialties()}
                  className='self-end rounded-[6px] border border-amber-300 bg-white px-3 py-1 font-cairo text-[12px] font-bold text-amber-900 hover:bg-amber-100'
                >
                  {t('signup.step3.specialty.retry')}
                </button>
              </div>
            )}
            {specialtiesLoading ? (
              <div className='relative mt-2'>
                <StyledSelect
                  disabled
                  value=''
                  onChange={() => {}}
                  options={[]}
                  placeholder={t('signup.step3.specialty.loading')}
                  emptyTriggerLabel={t('signup.step3.specialty.loading')}
                  listboxAriaLabel={t('signup.step3.specialty.label')}
                />
                <Loader2 className='pointer-events-none absolute start-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 animate-spin text-primary' />
              </div>
            ) : useCatalogSpecialty ? (
              <>
                <Controller
                  name='specialty'
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      className='mt-2'
                      options={specialties.map((opt) => ({
                        value: opt.value,
                        label:
                          locale === 'en'
                            ? (opt.labelEn ?? opt.labelAr)
                            : opt.labelAr,
                      }))}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue('specialtySource', 'catalog', {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      onBlur={field.onBlur}
                      placeholder={t('signup.step3.specialty.choose')}
                      listboxAriaLabel={t('signup.step3.specialty.chooseAria')}
                    />
                  )}
                />
                <button
                  type='button'
                  onClick={() => {
                    setSpecialtyInputMode('manual');
                    setValue('specialty', '', { shouldDirty: true });
                    setValue('specialtySource', 'manual', {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  className='mt-2 font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline'
                >
                  {t('signup.step3.specialty.notFound')}
                </button>
                <p className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {t('signup.step3.specialty.catalogNote')}
                </p>
              </>
            ) : (
              <>
                {!specialtiesError && !hasSpecialtyCatalog && (
                  <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    {t('signup.step3.specialty.emptyCatalog')}
                  </p>
                )}
                <input
                  type='text'
                  placeholder={t('signup.step3.specialty.manualPlaceholder')}
                  {...register('specialty', {
                    onChange: (event) => {
                      void register('specialty').onChange(event);
                      setValue('specialtySource', 'manual', {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    },
                  })}
                  className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
                />
                {hasSpecialtyCatalog ? (
                  <button
                    type='button'
                    onClick={() => {
                      setSpecialtyInputMode('catalog');
                      setValue('specialty', '', { shouldDirty: true });
                      setValue('specialtySource', 'catalog', {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    className='mt-2 font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline'
                  >
                    {t('signup.step3.specialty.backToList')}
                  </button>
                ) : null}
                <p className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {t('signup.step3.specialty.manualNote')}
                </p>
              </>
            )}
            {errors.specialty?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.specialty.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-start'>
              <IdCard className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step3.license.label')}
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder={t('signup.step3.license.placeholder')}
              {...register('licenseNumber', {
                onChange: () => onDismissServerLicenseMessage?.(),
              })}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {(errors.licenseNumber?.message?.trim() ||
              serverLicenseMessage?.trim()) && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.licenseNumber?.message ?? serverLicenseMessage}
              </div>
            )}
            <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              {t('signup.step3.license.hint')}
            </p>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-start'>
              <GraduationCap className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step3.qualification.label')}
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder={t('signup.step3.qualification.placeholder')}
              {...register('qualification')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.qualification?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.qualification.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-start'>
              <MapPin className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step3.clinicAddress.label')}
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <input
              type='text'
              placeholder={t('signup.step3.clinicAddress.placeholder')}
              {...register('clinicAddress')}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.clinicAddress?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.clinicAddress.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-start'>
              <Text className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                {t('signup.step3.bio.label')}
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            <textarea
              rows={4}
              placeholder={t('signup.step3.bio.placeholder')}
              {...register('bio')}
              className='mt-2 h-[120px] w-full resize-none rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-3 text-start font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
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
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-bold text-[#374151] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <ArrowRight className='h-4 w-4' />
              {t('signup.step3.previous')}
            </button>
            <button
              type='submit'
              disabled={specialtiesLoading}
              className='flex h-[54px] items-center justify-center gap-2 rounded-[6px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15, 143, 139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {t('signup.step3.next')}
              <ArrowLeft className='h-4 w-4' />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
