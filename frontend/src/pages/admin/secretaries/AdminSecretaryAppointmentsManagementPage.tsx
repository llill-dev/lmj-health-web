import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

export default function AdminSecretaryAppointmentsManagementPage() {
  const { secretaryId } = useParams();

  return (
    <>
      <Helmet>
        <title>إدارة مواعيد السكرتير • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            إدارة مواعيد السكرتير
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
            {secretaryId ? `المعرّف: ${secretaryId}` : '—'}
          </div>
        </div>

        <div className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
            هذه الصفحة مخصصة لتدفقات إدارة المواعيد (reschedule/cancel/book on
            behalf) وفق الـABI وصلاحيات السكرتير. سيتم بناؤها تدريجيًا.
          </div>
        </div>
      </div>
    </>
  );
}

