import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminSecretaryDetailsPage() {
  const { secretaryId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>ملف السكرتير • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              ملف السكرتير
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              {secretaryId ? `المعرّف: ${secretaryId}` : '—'}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() =>
                navigate(`/admin/secretaries/${encodeURIComponent(String(secretaryId))}/appointments`)
              }
              className='h-[34px] rounded-[10px] border border-primary bg-white px-5 font-cairo text-[12px] font-extrabold text-primary'
            >
              عرض المواعيد
            </button>
            <button
              type='button'
              onClick={() =>
                navigate(`/admin/secretaries/${encodeURIComponent(String(secretaryId))}/appointments/manage`)
              }
              className='h-[34px] rounded-[10px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white'
            >
              إدارة المواعيد
            </button>
          </div>
        </div>

        <div className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
            هذه الصفحة تُستخدم كـ “تفاصيل سكرتير” وربط للأزرار داخل قائمة
            السكرتارية.
          </div>
        </div>
      </div>
    </>
  );
}

