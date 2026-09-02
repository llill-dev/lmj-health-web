import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/i18n/provider';

export default function OnboardingPage() {
  const { t, locale, dir } = useI18n();
  return (
    <main dir={dir} lang={locale} className='w-full'>
      <Helmet>
        <title>Onboarding • LMJ Health</title>
      </Helmet>

      <div className='mx-auto w-full max-w-[680px] rounded-[6px] bg-white px-6 py-10 shadow-[0_28px_80px_rgba(0,0,0,0.22)]'>
        <h1 className='font-cairo text-[18px] font-extrabold text-[#111827]'>
          Onboarding
        </h1>
        <p className='mt-2 font-cairo text-[14px] font-semibold text-[#667085]'>
          {t('onboarding.placeholderBody')}
        </p>
      </div>
    </main>
  );
}
