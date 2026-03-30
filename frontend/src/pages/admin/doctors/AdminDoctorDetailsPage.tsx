import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useAdminDoctor } from '@/hooks/useAdminDoctor';

export default function AdminDoctorDetailsPage() {
  const { doctorId } = useParams();
  const { doctor, isLoading, error } = useAdminDoctor(doctorId);

  return (
    <>
      <Helmet>
        <title>تفاصيل الطبيب • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            تفاصيل الطبيب
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
            {doctorId ? `المعرّف: ${doctorId}` : '—'}
          </div>
        </div>

        <div className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          {isLoading ? (
            <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
              جاري تحميل بيانات الطبيب...
            </div>
          ) : error ? (
            <div className='font-cairo text-[12px] font-semibold text-[#B42318]'>
              فشل تحميل بيانات الطبيب
            </div>
          ) : doctor ? (
            <div className='space-y-2 text-right'>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                {doctor.user?.fullName ?? doctor.userId?.fullName ?? '—'}
              </div>
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                الاختصاص: {doctor.specialization ?? '—'}
              </div>
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                رقم الترخيص: {doctor.medicalLicenseNumber ?? '—'}
              </div>
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                الحالة: {doctor.approvalStatus ?? '—'}
              </div>
            </div>
          ) : (
            <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
              لا توجد بيانات.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
