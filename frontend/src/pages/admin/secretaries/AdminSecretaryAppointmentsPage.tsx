import { Helmet } from 'react-helmet-async';
import { CalendarDays } from 'lucide-react';
import { useParams } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';

export default function AdminSecretaryAppointmentsPage() {
  const { secretaryId } = useParams();

  return (
    <>
      <Helmet>
        <title>مواعيد السكرتير • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='مواعيد السكرتير'
          subtitle={
            secretaryId ? `المعرّف: ${secretaryId}` : 'عرض مواعيد الطبيب المرتبط'
          }
          headerIcon={<CalendarDays className='h-8 w-8 text-white' />}
        />

        <div className='mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
            سيتم ربط هذه الصفحة لاحقًا بقائمة المواعيد حسب نطاق الطبيب المرتبط
            بالسكرتير (appointment list + filters) وفق الـABI.
          </div>
        </div>
      </div>
    </>
  );
}
