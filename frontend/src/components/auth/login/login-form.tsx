'use client';

import { LockKeyhole, Mail, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

type LoginMethod = 'phone' | 'email';

const loginSchema = z
  .object({
    method: z.enum(['phone', 'email']),
    identifier: z.string().min(1, 'هذا الحقل مطلوب'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  })
  .superRefine((val, ctx) => {
    if (val.method === 'email') {
      const res = z.string().email().safeParse(val.identifier);
      if (!res.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: 'أدخل بريد إلكتروني صحيح',
        });
      }
    }

    if (val.method === 'phone') {
      const phone = val.identifier.replace(/[\s-]/g, '');
      const ok = /^\+?[0-9]{7,15}$/.test(phone);
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: 'أدخل رقم هاتف صحيح',
        });
      }
    }
  });

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm({
  onBack,
  onSignUp,
  onForgotPassword,
  onOtpLogin,
}: {
  onBack: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onOtpLogin: () => void;
}) {
  const navigate = useNavigate();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [methodDirection, setMethodDirection] = useState<1 | -1>(1);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      method: 'email',
      identifier: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const methodLabel = useMemo(() => {
    return method === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني';
  }, [method]);

  const methodPlaceholder = useMemo(() => {
    return method === 'phone' ? '+963 9XX XXX XXX' : 'example@email.com';
  }, [method]);

  const MethodIcon = method === 'phone' ? Phone : Mail;

  const onSubmit = handleSubmit(async (values) => {
    const uiOnly = import.meta.env.VITE_UI_ONLY === 'true';

    if (uiOnly) {
      useAuthStore.setState({
        user: {
          id: 'demo-doctor',
          verified: true,
          email:
            values.method === 'email' ? values.identifier : 'doctor@demo.local',
          phone: values.method === 'phone' ? values.identifier : '+0000000000',
          role: 'doctor',
          name: 'Demo Doctor',
        },
        token: 'demo-token',
        isAuthenticated: true,
      });
      navigate('/doctor');
      return;
    }

    useAuthStore.getState().login(values.identifier, values.password);
  });

  return (
    <section className='mx-auto flex flex-col items-center'>
      <div>
        <img
          src='/images/logo.png'
          alt='LMJ Health'
          width={226}
          height={120}
          className='max-h-[120px]'
          loading='eager'
        />
      </div>
      <div
        dir='rtl'
        lang='ar'
        className='relative gap-4 rounded-[6px]  max-w-[448px] max-h-[591px]'
      >
        <div className='relative'>
          <div className='pointer-events-none absolute -right-[70px] -top-[60px] z-0'>
            <div className='relative h-44 w-44'>
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl bg-teal-600/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
              <div className='absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-3xl bg-teal-500/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)]' />
            </div>
          </div>
          <div className='relative z-10  h-[4px] w-[448px] bg-gradient-to-b from-[#16C5C0] via-[#65BFEC] to-[#16C5C0]' />
          <div className='relative z-10 rounded-[6px] bg-[#FFFFFFF2] px-7 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.22)]'>
            <div className='text-start'>
              <h1 className='font-cairo text-[16px] font-bold leading-[32px] text-[#1F2937]'>
                تسجيل الدخول
              </h1>
              <p className='mt-2 font-cairo text-[16px] font-medium leading-[24px] text-[#6B7280]'>
                مرحبا بعودتك، سجل دخولك لمتابعة مواعيدك وبياناتك الصحية بأمان
              </p>
            </div>

            <form
              className=''
              onSubmit={onSubmit}
            >
              <div className='mx-auto max-w-[330px] gap-[24px] py-[35px] px-[24px]'>
                <div className='relative flex h-[35px] w-full rounded-[6px] bg-[#F2F4F7] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.10)]'>
                  <div className='relative flex flex-1'>
                    {method === 'phone' && (
                      <motion.div
                        layoutId='loginMethodPill'
                        className='absolute inset-0 rounded-[6px] bg-[#16C5C0]'
                        transition={{
                          type: 'spring',
                          stiffness: 520,
                          damping: 40,
                        }}
                      />
                    )}
                    <button
                      type='button'
                      onClick={() => {
                        setMethodDirection(-1);
                        setMethod('phone');
                        setValue('method', 'phone');
                        setValue('identifier', '');
                        clearErrors('identifier');
                      }}
                      className={
                        method === 'phone'
                          ? 'relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-normal text-[#FFFFFF]'
                          : 'relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-bold text-[#667085]'
                      }
                    >
                      رقم الهاتف
                    </button>
                  </div>

                  <div className='relative flex flex-1'>
                    {method === 'email' && (
                      <motion.div
                        layoutId='loginMethodPill'
                        className='absolute inset-0 rounded-[6px] bg-[#16C5C0]'
                        transition={{
                          type: 'spring',
                          stiffness: 520,
                          damping: 40,
                        }}
                      />
                    )}
                    <button
                      type='button'
                      onClick={() => {
                        setMethodDirection(1);
                        setMethod('email');
                        setValue('method', 'email');
                        setValue('identifier', '');
                        clearErrors('identifier');
                      }}
                      className={
                        method === 'email'
                          ? 'relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-normal text-[#FFFFFF]'
                          : 'relative z-10 flex-1 rounded-[6px] font-cairo text-[14px] font-bold text-[#667085]'
                      }
                    >
                      البريد الإلكتروني
                    </button>
                  </div>
                </div>

                <div className='gap-[16px] mt-4'>
                  <div>
                    <label className='block text-right font-cairo text-[14px] font-bold text-[#101828]'>
                      {methodLabel}
                    </label>
                    <AnimatePresence
                      mode='wait'
                      initial={false}
                      custom={methodDirection}
                    >
                      <motion.div
                        key={method}
                        custom={methodDirection}
                        variants={{
                          enter: (dir: 1 | -1) => ({
                            opacity: 0,
                            x: dir === 1 ? -14 : 14,
                          }),
                          center: { opacity: 1, x: 0 },
                          exit: (dir: 1 | -1) => ({
                            opacity: 0,
                            x: dir === 1 ? 14 : -14,
                          }),
                        }}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className='flex h-[35px] max-w-[330px] items-center rounded-[8px] bg-[#F2F4F7] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
                      >
                        <MethodIcon className='h-5 w-5 text-[#B5B7BA]' />
                        <input
                          dir='ltr'
                          inputMode={method === 'phone' ? 'tel' : 'email'}
                          type={method === 'phone' ? 'tel' : 'email'}
                          placeholder={methodPlaceholder}
                          {...register('identifier')}
                          className='h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
                        />
                      </motion.div>
                    </AnimatePresence>
                    {errors.identifier ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.identifier.message}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label className='mt-5 block text-right font-cairo text-[14px] font-bold text-[#101828]'>
                      كلمة المرور
                    </label>
                    <div className=' flex h-[35px] max-w-[330px] items-center rounded-[8px] bg-[#F2F4F7] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'>
                      <LockKeyhole className=' h-5 w-5 text-[#B5B7BA]' />
                      <input
                        dir='ltr'
                        type='password'
                        placeholder='password123'
                        {...register('password')}
                        className='h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
                      />
                    </div>
                    {errors.password ? (
                      <div className='mt-2 text-right font-cairo text-[12px] font-bold text-[#D92D20]'>
                        {errors.password.message}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='mt-6 flex h-[36px] w-full max-w-[330px] items-center justify-center rounded-[8px] bg-[#16C5C0] text-[14px] text-white shadow-[0_18px_40px_rgba(22,197,192,0.35)] transition-colors hover:bg-[#14B3AE]'
                  >
                    تسجيل الدخول
                  </button>
                </div>

                <div className='mt-5 flex items-center justify-between px-1 font-cairo text-[14px] text-[#16C5C0]'>
                  <button
                    type='button'
                    className='transition-colors hover:text-[#14B3AE]'
                    onClick={onForgotPassword}
                  >
                    نسيت كلمة المرور
                  </button>
                  <button
                    type='button'
                    className='transition-colors hover:text-[#14B3AE]'
                    onClick={onOtpLogin}
                  >
                    تسجيل دخول برمز OTP
                  </button>
                </div>
              </div>

              <div className='mt-10 text-center font-cairo text-[13px] text-[#667085]'>
                ليس لديك حساب؟{' '}
                <button
                  type='button'
                  onClick={onSignUp}
                  className='ps-2 text-[#16C5C0] transition-colors hover:text-[#14B3AE]'
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
