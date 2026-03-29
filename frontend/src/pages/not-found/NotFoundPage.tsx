import AuthBackground from '@/components/auth/AuthBackground';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className='mx-auto flex min-h-[60vh] w-full max-w-[680px] flex-col items-center justify-center gap-3 px-6 text-center'>
      <Helmet>
        <title>404 • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <div className='font-cairo text-[24px] font-extrabold text-[#111827]'>
          الصفحة غير موجودة
        </div>
        <div className='font-cairo text-[14px] font-semibold text-[#667085]'>
          الرابط الذي طلبته غير صحيح.
        </div>
        <Link
          to='/welcome'
          className='mt-2 inline-flex h-[44px] items-center justify-center rounded-[10px] bg-primary px-6 font-cairo text-[14px] font-extrabold text-white'
        >
          العودة للرئيسية
        </Link>
      </AuthBackground>
    </div>
  );
}
