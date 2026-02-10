'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z
      .string()
      .min(1, 'يرجى تأكيد كلمة المرور')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export default function NewPassword({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (values: NewPasswordValues) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  return (
    <section className='mx-auto flex flex-col items-center'>
      <div>
        <Image
          src='/images/logo.png'
          alt='LMJ Health'
          width={300}
          height={200}
          className='max-h-[200px] -mt-8'
        />
      </div>

      <div
        dir='rtl'
        lang='ar'
        className='relative'
      >
        <div className='relative w-fit'>
          <div className='pointer-events-none absolute -right-[100px] -top-[70px] z-10'>
            <div className='relative h-44 w-44'>
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            </div>
          </div>
          <div className='text-center'>
            <h1 className='text-[#1F2937] font-cairo text-[22px] font-bold leading-[24px] py-10'>
              تعيين كلمة مرور جديدة
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='w-[557px] h-[300px] rounded-[12px] border-[1.9px] border-[#E5E7EB] bg-[#FFFFFF] px-[108px] py-[18px] mt-8 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]'
          >
            <div className='mt-6'>
              <div>
                <label className='block text-right font-cairo text-[14px] font-bold leading-[24px] text-[#1F2937]'>
                  عين كلمة مرور جديدة
                </label>
                <div className='flex h-[36px] items-center rounded-[10px] border-[1.82px] border-[#E5E7EB] bg-[#F3F4F6] py-[4px] px-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.06)]'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='password123'
                    {...register('password')}
                    className='h-full w-full bg-transparent px-3 font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
                  />

                  {passwordValue?.length ? (
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='shrink-0 ps-1 text-[#98A2B3] hover:text-[#667085]'
                      aria-label={
                        showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  ) : null}
                </div>
                <div className='mt-2 min-h-[18px] text-right font-cairo text-[12px] font-semibold text-red-500'>
                  {errors.password?.message ?? ''}
                </div>
              </div>

              <div>
                <label className='block text-right font-cairo text-[14px] font-bold leading-[24px] text-[#1F2937]'>
                  تأكيد كلمة المرور
                </label>
                <div className='flex h-[36px] items-center rounded-[10px] border-[1.82px] border-[#E5E7EB] bg-[#F3F4F6] py-[4px] px-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.06)]'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='password123'
                    {...register('confirmPassword')}
                    className='h-full w-full bg-transparent px-3 font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
                  />

                  {confirmPasswordValue?.length ? (
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className='shrink-0 ps-1 text-[#98A2B3] hover:text-[#667085]'
                      aria-label={
                        showConfirmPassword
                          ? 'إخفاء كلمة المرور'
                          : 'إظهار كلمة المرور'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  ) : null}
                </div>
                <div className='mt-2 min-h-[18px] text-right font-cairo text-[12px] font-semibold text-red-500'>
                  {errors.confirmPassword?.message ?? ''}
                </div>
              </div>

              <button
                type='submit'
                className='mt-2 w-[329.15px] flex h-[44px]  items-center justify-center rounded-[8px] bg-[#16C5C0] font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(22,197,192,0.35)] transition-colors hover:bg-[#14B3AE]'
              >
                تعيين كلمة المرور
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
