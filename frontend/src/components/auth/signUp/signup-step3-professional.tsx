'use client';

import { useEffect } from 'react';

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
import { useForm } from 'react-hook-form';

import { useDoctorSignupSpecialties } from '@/hooks/useDoctorSignupSpecialties';

import {
  step3ProfessionalSchema,
  type Step3ProfessionalValues,
} from './signup-schemas';

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

  const hasSpecialtyCatalog =
    !specialtiesError && !specialtiesLoading && specialties.length > 0;

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3ProfessionalValues>({
    resolver: zodResolver(step3ProfessionalSchema),
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
    const fromCatalog =
      !specialtiesError && !specialtiesLoading && specialties.length > 0;
    setValue('specialtySource', fromCatalog ? 'catalog' : 'manual', {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [
    specialtiesError,
    specialtiesLoading,
    specialties.length,
    setValue,
  ]);

  return (
    <>
      <div className='mt-7 flex flex-col items-center text-center'>
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded-[6px] bg-primary shadow-[0_18px_40px_rgba(15, 143, 139,0.35)]'>
          <Stethoscope className='h-9 w-9 text-white' />
        </div>
        <div className='mt-4 flex items-center justify-center gap-3'>
          <h2 className='font-cairo text-[26px] font-extrabold text-[#101828]'>
            المعلومات المهنية
          </h2>
          <button
            type='button'
            onClick={() => {
              const fromCatalog =
                !specialtiesError &&
                !specialtiesLoading &&
                specialties.length > 0;
              setValue('specialtySource', fromCatalog ? 'catalog' : 'manual', {
                shouldDirty: true,
              });
              const firstSpecialty =
                specialties.length > 0 ? specialties[0] : undefined;
              setValue(
                'specialty',
                fromCatalog && firstSpecialty
                  ? firstSpecialty.value
                  : 'طب الأسنان التجريبي',
                { shouldDirty: true },
              );
              setValue('licenseNumber', 'DAM-2024-1001', { shouldDirty: true });
              setValue(
                'qualification',
                'دكتوراه في طب الأسنان — جامعة دمشق',
                { shouldDirty: true },
              );
              setValue(
                'clinicAddress',
                'دمشق، المزة، شارع العيادات، مبنى 5',
                { shouldDirty: true },
              );
              setValue(
                'bio',
                'طبيب أسنان بخبرة سريرية في التركيبات والتقويم؛ أهتم بمتابعة الحالات بعناية.',
                { shouldDirty: true },
              );
            }}
            className='rounded-full border border-primary/35 bg-[#EFFFFD] px-3 py-1 font-cairo text-[12px] font-bold text-primary'
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
        <input
          type='hidden'
          {...register('specialtySource')}
        />
        <div className='space-y-5'>
          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Stethoscope className='h-4 w-4 text-primary' />
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                التخصص
              </span>
              <span className='font-cairo text-[14px] font-bold text-[#374151]'>
                *
              </span>
            </div>
            {specialtiesError && (
              <div className='mt-2 flex flex-col gap-2 rounded-[6px] border border-amber-200 bg-amber-50 px-3 py-2 text-right'>
                <p className='font-cairo text-[12px] font-semibold text-amber-900'>
                  تعذر تحميل قائمة التخصصات. يمكنك إدخال التخصص يدوياً أو إعادة المحاولة.
                </p>
                <button
                  type='button'
                  onClick={() => void refetchSpecialties()}
                  className='self-end rounded-[6px] border border-amber-300 bg-white px-3 py-1 font-cairo text-[12px] font-bold text-amber-900 hover:bg-amber-100'
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
            {specialtiesLoading ? (
              <div className='relative mt-2'>
                <select
                  disabled
                  className='h-[48px] w-full appearance-none rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#F9FAFB] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#9CA3AF] shadow-[0_10px_25px_rgba(0,0,0,0.05)]'
                  aria-busy='true'
                >
                  <option>جاري تحميل التخصصات…</option>
                </select>
                <Loader2 className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary' />
              </div>
            ) : hasSpecialtyCatalog ? (
              <select
                {...register('specialty')}
                className='mt-2 h-[48px] w-full appearance-none rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#374151] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
              >
                <option value='' disabled hidden>
                  اختر التخصص
                </option>
                {specialties.map((opt) => (
                  <option key={opt.key} value={opt.value}>
                    {opt.labelAr}
                  </option>
                ))}
              </select>
            ) : (
              <>
                {!specialtiesError && (
                  <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    الخادم أعاد قائمة فارغة (لا توجد تخصصات نشطة ضمن تصنيف DOCTOR_SPECIALIZATION)، فزِر الإدارة → إعدادات lookups لإضافتها. يمكنك المتابعة بإدخال يدوي؛ يُرسَل كنصّ مخصَّص وفق وثيقة الـ API.
                  </p>
                )}
                <input
                  type='text'
                  placeholder='مثال: طب الأسنان، تقويم الأسنان، جراحة الفم'
                  {...register('specialty')}
                  className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
                />
              </>
            )}
            {errors.specialty?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.specialty.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <IdCard className='h-4 w-4 text-primary' />
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
              {...register('licenseNumber', {
                onChange: () => onDismissServerLicenseMessage?.(),
              })}
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {(errors.licenseNumber?.message?.trim() ||
              serverLicenseMessage?.trim()) && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.licenseNumber?.message ?? serverLicenseMessage}
              </div>
            )}
            <p className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              سيتم مراجعة هذا الرقم من قبل الإدارة
            </p>
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <GraduationCap className='h-4 w-4 text-primary' />
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
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.qualification?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.qualification.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <MapPin className='h-4 w-4 text-primary' />
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
              className='mt-2 h-[48px] w-full rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-[4px] text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
            />
            {errors.clinicAddress?.message && (
              <div className='mt-1 font-cairo text-[12px] font-semibold text-red-500'>
                {errors.clinicAddress.message}
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center justify-start gap-2 text-right'>
              <Text className='h-4 w-4 text-primary' />
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
              className='mt-2 h-[120px] w-full resize-none rounded-[6px] border-[0.8px] border-[#9EE8E0] bg-[#FFFFFF] px-4 py-3 text-right font-cairo text-[14px] font-semibold text-[#6B7280] shadow-[0_10px_25px_rgba(0,0,0,0.05)] outline-none focus:border-primary'
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
