'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Circle, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import PasswordResetShell from '@/components/auth/password/PasswordResetShell';

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/\d/, 'يجب أن تحتوي على رقم'),
    confirmPassword: z.string().min(1, 'يرجى تأكيد كلمة المرور'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

function RequirementRow({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  const Icon = met ? CheckCircle2 : Circle;
  return (
    <li className='flex items-center gap-2'>
      <Icon
        className={`h-4 w-4 shrink-0 ${met ? 'text-primary' : 'text-[#CBD5E1]'}`}
        aria-hidden
      />
      <span
        className={`font-cairo text-[12px] font-semibold ${met ? 'text-[#0F766E]' : 'text-[#64748B]'}`}
      >
        {label}
      </span>
    </li>
  );
}

export default function NewPassword({
  onSubmit,
}: {
  onBack?: () => void;
  onSubmit: (values: NewPasswordValues) => void | Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  const passwordValue = watch('password') ?? '';
  const confirmPasswordValue = watch('confirmPassword') ?? '';

  const requirements = useMemo(
    () => ({
      minLength: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      number: /\d/.test(passwordValue),
      match:
        passwordValue.length > 0 &&
        confirmPasswordValue.length > 0 &&
        passwordValue === confirmPasswordValue,
    }),
    [confirmPasswordValue, passwordValue],
  );

  const submit = handleSubmit(async (values) => {
    setFlowError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'لا يوجد أي تطابق مع البيانات المدخلة. يرجى التحقق من المعلومات وإعادة المحاولة.';
      setFlowError(message);
    }
  });

  const fieldError =
    errors.password?.message ??
    errors.confirmPassword?.message ??
    flowError;

  return (
    <PasswordResetShell step={3}>
      <div className='text-center'>
        <h2 className='font-cairo text-[15px] font-extrabold text-[#1F2937]'>
          إنشاء كلمة مرور جديدة
        </h2>
        <p className='mt-1 font-cairo text-[13px] font-semibold text-[#667085]'>
          اختر كلمة مرور قوية لحماية حسابك
        </p>
      </div>

      <form
        onSubmit={submit}
        className='mt-5 space-y-4'
        noValidate
      >
        <div>
          <label className='mb-2 block text-start font-cairo text-[14px] font-bold text-[#101828]'>
            كلمة المرور الجديدة
          </label>
          <div className='flex h-[40px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F3F3F5] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.06)]'>
            <LockKeyhole
              className='h-4 w-4 shrink-0 text-[#98A2B3]'
              aria-hidden
            />
            <input
              dir='ltr'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='password123'
              {...register('password')}
              className='h-full w-full bg-transparent px-3 text-start font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
            />
            <button
              type='button'
              onClick={() => setShowPassword((value) => !value)}
              className='shrink-0 text-[#98A2B3] transition-colors hover:text-[#667085]'
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-start font-cairo text-[14px] font-bold text-[#101828]'>
            تأكيد كلمة المرور
          </label>
          <div className='flex h-[40px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F3F3F5] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.06)]'>
            <LockKeyhole
              className='h-4 w-4 shrink-0 text-[#98A2B3]'
              aria-hidden
            />
            <input
              dir='ltr'
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='password123'
              {...register('confirmPassword')}
              className='h-full w-full bg-transparent px-3 text-start font-cairo text-[14px] font-semibold text-[#101828] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#B5B7BA]'
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword((value) => !value)}
              className='shrink-0 text-[#98A2B3] transition-colors hover:text-[#667085]'
              aria-label={
                showConfirmPassword
                  ? 'إخفاء كلمة المرور'
                  : 'إظهار كلمة المرور'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div className='rounded-[10px] border border-[#D9EEF0] bg-[#F0FAFA] px-4 py-3'>
          <p className='mb-2 text-start font-cairo text-[12px] font-extrabold text-[#0F766E]'>
            متطلبات كلمة المرور:
          </p>
          <ul className='space-y-2'>
            <RequirementRow
              met={requirements.minLength}
              label='لا تقل عن 8 أحرف'
            />
            <RequirementRow
              met={requirements.uppercase}
              label='تحتوي على حرف كبير'
            />
            <RequirementRow
              met={requirements.number}
              label='تحتوي على رقم'
            />
            <RequirementRow
              met={requirements.match}
              label='كلمتا المرور متطابقتان'
            />
          </ul>
        </div>

        <div
          className={`min-h-[20px] text-start font-cairo text-[12px] font-semibold leading-snug ${fieldError ? 'text-[#D92D20]' : 'text-transparent'}`}
          aria-live='polite'
        >
          {fieldError ?? '\u00A0'}
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.32)] transition-colors hover:bg-[#14B3AE] disabled:opacity-60'
        >
          <span>{isSubmitting ? 'جارٍ الحفظ…' : 'تعيين كلمة المرور'}</span>
          <ArrowLeft
            className='h-4 w-4 shrink-0'
            aria-hidden
          />
        </button>
      </form>
    </PasswordResetShell>
  );
}
