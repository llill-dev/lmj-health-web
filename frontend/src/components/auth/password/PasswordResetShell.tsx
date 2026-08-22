import type { ReactNode } from 'react';
import PasswordResetBackground from '@/components/auth/password/PasswordResetBackground';
import PasswordResetStepper, {
  type PasswordResetStep,
} from '@/components/auth/password/PasswordResetStepper';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useI18n } from '@/i18n/provider';

type Props = {
  step: PasswordResetStep;
  children: ReactNode;
  showStepper?: boolean;
  title?: string;
  subtitle?: string;
};

export default function PasswordResetShell({
  step,
  children,
  showStepper = true,
  title,
  subtitle,
}: Props) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const resolvedTitle =
    title ?? tr('إعادة تعيين كلمة المرور', 'Reset password');
  const resolvedSubtitle =
    subtitle ??
    tr(
      'استعد الوصول إلى حسابك بخطوات بسيطة',
      'Regain access to your account in a few simple steps',
    );

  return (
    <PasswordResetBackground>
      <div className='flex justify-end px-4 pt-4 sm:px-6'>
        <LanguageSwitcher />
      </div>
      <section
        dir={dir}
        lang={locale}
        className='mx-auto flex min-h-screen w-full max-w-[560px] flex-col items-center px-4 pb-12 pt-4 sm:px-6'
      >
        <div className='mb-6 shrink-0'>
          <img
            src='/images/syr-health-logo.png'
            alt='SYR HEALTH'
            width={226}
            height={120}
            className='max-h-[110px] w-auto'
            loading='eager'
          />
        </div>

        <div className='w-full max-w-[520px]'>
          <div className='h-[4px] w-full rounded-t-[8px] bg-gradient-to-r from-[#0F8F8B] via-[#65BFEC] to-[#0F8F8B]' />
          <div className='rounded-b-[12px] bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.12)] sm:px-8 sm:py-8'>
            <div className='text-center'>
              <h1 className='font-cairo text-[18px] font-extrabold leading-snug text-[#1F2937] sm:text-[20px]'>
                {resolvedTitle}
              </h1>
              <p className='mt-2 font-cairo text-[13px] font-semibold leading-relaxed text-[#667085] sm:text-[14px]'>
                {resolvedSubtitle}
              </p>
            </div>

            {showStepper ? <PasswordResetStepper step={step} /> : null}

            <div className='mt-6'>{children}</div>
          </div>
        </div>
      </section>
    </PasswordResetBackground>
  );
}
