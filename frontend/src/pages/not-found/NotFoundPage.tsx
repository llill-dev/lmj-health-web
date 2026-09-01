import AuthBackground from '@/components/auth/AuthBackground';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/provider';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <AuthBackground>
      <div className='mx-auto flex min-h-[60vh] w-full max-w-[680px] flex-col items-center justify-center gap-3 px-6 text-center'>
        <Helmet>
          <title>404 • LMJ Health</title>
        </Helmet>

        <div className='font-cairo text-[24px] font-extrabold text-[#111827]'>
          {t('notFound.title')}
        </div>
        <div className='font-cairo text-[14px] font-semibold text-[#667085]'>
          {t('notFound.description')}
        </div>
        <Link
          to='/welcome'
          className='mt-2 inline-flex h-[44px] items-center justify-center rounded-[10px] bg-primary px-6 font-cairo text-[14px] font-extrabold text-white'
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </AuthBackground>
  );
}
