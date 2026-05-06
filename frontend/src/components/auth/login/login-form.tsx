'use client';

import { Eye, EyeOff, LockKeyhole, Mail, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthFlowError, useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { SIGNUP_EMAIL_INVALID_MESSAGE_AR } from '@/components/auth/signUp/signup-schemas';

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
          message: SIGNUP_EMAIL_INVALID_MESSAGE_AR,
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [methodDirection, setMethodDirection] = useState<1 | -1>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

  // Map AuthError codes to user-friendly Arabic messages
  const AUTH_ERROR_MESSAGES_AR: Record<string, string> = {
    INVALID_CREDENTIALS:
      'البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة',
    NOT_VERIFIED: 'الحساب غير موثق، يرجى التحقق من بريدك الإلكتروني',
    INACTIVE: 'الحساب غير نشط، تواصل مع الدعم',
    PENDING_APPROVAL: 'حساب الطبيب في انتظار موافقة الإدارة',
    NOT_ALLOWED: 'هذا الحساب غير مسموح له باستخدام هذا التطبيق',
    TEMPORARY: 'يرجى تفعيل حسابك قبل تسجيل الدخول',
    LOCKED: 'الحساب مقفول مؤقتاً، حاول لاحقاً',
    DELETED: 'تم حذف هذا الحساب',
    NETWORK_ERROR: 'تعذّر الوصول إلى الخادم. تحقّق من الإنترنت ثم أعد المحاولة؛ إن استمر الأمر قد يكون سببه الخدمة وليس شبكتك.',
    UNKNOWN: 'حدث خطأ غير متوقع، حاول مجدداً',
  };

  const roleRoot: Record<string, string> = {
    doctor: '/doctor/dashboard',
    admin: '/admin/dashboard',
    secretary: '/secretary/dashboard',
    'data-entry': '/data-entry/dashboard',
    patient: '/patient/dashboard',
  };

  const onSubmit = handleSubmit(async (values) => {
    setLoginError(null);

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
        },
        token: 'demo-token',
        isAuthenticated: true,
      });
      navigate('/doctor');
      return;
    }

    try {
      await useAuthStore
        .getState()
        .login(
          values.method === 'email'
            ? values.identifier
            : values.identifier.replace(/[\s-]/g, ''),
          values.password,
          'web',
        );

      const userRole = useAuthStore.getState().user?.role ?? '';

      if (userRole === 'admin') {
        toast('تم تسجيل الدخول بنجاح. مرحباً بك في لوحة إدارة LMJ Health.', {
          title: 'مرحباً',
          variant: 'success',
          durationMs: 3800,
        });
      }

      // Honour the ?next= redirect set by ProtectedRoute (safe-guard: only
      // accept relative paths to prevent open-redirect attacks).
      const next = searchParams.get('next');
      if (next) {
        try {
          const decoded = decodeURIComponent(next);
          if (decoded.startsWith('/')) {
            navigate(decoded, { replace: true });
            return;
          }
        } catch {
          // malformed next param — fall through to role-based redirect
        }
      }

      navigate(roleRoot[userRole] ?? '/welcome', { replace: true });
    } catch (error: unknown) {
      const code =
        error instanceof AuthFlowError ? error.code : 'UNKNOWN';
      setLoginError(
        AUTH_ERROR_MESSAGES_AR[code] ??
          (error instanceof Error ? error.message : undefined) ??
          AUTH_ERROR_MESSAGES_AR['UNKNOWN'],
      );

      if (!(error instanceof AuthFlowError)) {
        console.error('Unexpected login failure:', error);
      }
    }
  });

  return (
    <section className='mx-auto flex min-h-svh w-full flex-col items-center px-4 pb-16 pt-2'>
      <div className='my-[35px] shrink-0'>
        <img
          src='/images/syr-health-logo.png'
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
        className='relative mb-8 w-full max-w-[448px]'
      >
        <div className='relative z-10 h-[4px] w-full max-w-[448px] bg-gradient-to-b from-[#0F8F8B] via-[#65BFEC] to-[#0F8F8B]' />
        <div className='z-10 rounded-[6px] bg-[#FFFFFFF2] px-7 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.22)]'>
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
            noValidate
            onSubmit={onSubmit}
          >
            <div className='mx-auto max-w-[330px] gap-[24px] py-[35px] px-[24px]'>
              <div className='relative flex h-[35px] w-full rounded-[6px] bg-[#F2F4F7] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.10)]'>
                <div className='flex relative flex-1'>
                  {method === 'phone' && (
                    <motion.div
                      layoutId='loginMethodPill'
                      className='absolute inset-0 rounded-[6px] bg-primary'
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

                <div className='flex relative flex-1'>
                  {method === 'email' && (
                    <motion.div
                      layoutId='loginMethodPill'
                      className='absolute inset-0 rounded-[6px] bg-primary'
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
                  <label className='block mb-1 text-right font-cairo text-[14px] font-bold text-[#101828]'>
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
                      className='flex h-[35px] bg-[#F3F3F5] max-w-[330px] items-center rounded-[8px] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
                    >
                      <MethodIcon className='h-5 w-5 text-[#B5B7BA]' />
                      <input
                        dir='ltr'
                        inputMode={method === 'phone' ? 'tel' : 'email'}
                        type={method === 'phone' ? 'tel' : 'email'}
                        placeholder={methodPlaceholder}
                        {...register('identifier')}
                        className='h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium'
                      />
                    </motion.div>
                  </AnimatePresence>
                  {errors.identifier ? (
                    <div className='mt-2 break-words text-right font-cairo text-[12px] font-bold leading-snug text-[#D92D20]'>
                      {errors.identifier.message}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className='mt-5 mb-1 block text-right font-cairo text-[14px] font-bold text-[#101828]'>
                    كلمة المرور
                  </label>
                  <div className=' flex h-[35px] bg-[#F3F3F5] max-w-[330px] items-center rounded-[8px] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'>
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='flex items-center justify-center text-[#B5B7BA] transition-colors hover:text-primary focus:outline-none'
                      aria-label={
                        showPassword ? 'Show password' : 'Hide password'
                      }
                      title={showPassword ? 'Show password' : 'Hide password'}
                    >
                      {showPassword ? (
                        <EyeOff className='w-4 h-4' />
                      ) : (
                        <Eye className='w-4 h-4' />
                      )}
                    </button>
                    <input
                      dir='ltr'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='password123'
                      {...register('password')}
                      className='h-full w-full bg-[#F3F3F5] font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium'
                    />
                  </div>
                  {errors.password ? (
                    <div className='mt-2 break-words text-right font-cairo text-[12px] font-bold leading-snug text-[#D92D20]'>
                      {errors.password.message}
                    </div>
                  ) : null}
                </div>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='mt-6 flex h-[36px] w-full max-w-[330px] items-center justify-center rounded-[8px] bg-primary text-[14px] text-white shadow-[0_18px_40px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60'
                >
                  {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>

                {loginError && (
                  <div
                    role='alert'
                    className='mt-3 break-words rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-right font-cairo text-[13px] font-semibold leading-snug text-[#D92D20]'
                  >
                    {loginError}
                  </div>
                )}
              </div>

              <div className='mt-5 flex items-center justify-between px-1 font-cairo text-[14px] text-primary'>
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
                className='ps-2 text-primary transition-colors hover:text-[#14B3AE]'
              >
                إنشاء حساب جديد
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
