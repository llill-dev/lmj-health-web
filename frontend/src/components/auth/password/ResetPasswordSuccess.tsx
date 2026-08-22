import { Check } from 'lucide-react';
import PasswordResetShell from '@/components/auth/password/PasswordResetShell';

export default function ResetPasswordSuccess({
  onLogin,
  onResetAnother,
}: {
  onLogin: () => void;
  onResetAnother: () => void;
}) {
  return (
    <PasswordResetShell step={4}>
      <div className='flex flex-col items-center py-2 text-center'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[0_16px_40px_rgba(15,143,139,0.35)]'>
          <Check
            className='h-10 w-10 text-white'
            strokeWidth={2.75}
            aria-hidden
          />
        </div>

        <h2 className='mt-5 font-cairo text-[20px] font-extrabold text-[#1F2937]'>
          تم بنجاح
        </h2>
        <p className='mt-2 font-cairo text-[14px] font-semibold text-[#667085]'>
          تم تغيير كلمة المرور بنجاح
        </p>
        <p className='mt-1 font-cairo text-[13px] font-semibold text-[#667085]'>
          يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
        </p>

        <button
          type='button'
          onClick={onLogin}
          className='mt-8 flex h-[42px] w-full items-center justify-center rounded-[8px] bg-primary font-cairo text-[14px] font-bold text-white shadow-[0_18px_40px_rgba(15,143,139,0.32)] transition-colors hover:bg-[#14B3AE]'
        >
          تسجيل الدخول الآن
        </button>

        <button
          type='button'
          onClick={onResetAnother}
          className='mt-4 font-cairo text-[13px] font-semibold text-primary transition-colors hover:text-[#14B3AE]'
        >
          إعادة تعيين كلمة مرور أخرى
        </button>
      </div>
    </PasswordResetShell>
  );
}
