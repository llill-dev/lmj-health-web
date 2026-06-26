import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { SecretaryDoctorAppointmentsPanel } from '@/components/admin/secretaries/SecretaryDoctorAppointmentsPanel';
import { useAdminSecretaryById } from '@/hooks/admin/secretaries/useAdminSecretaryById';

export default function AdminSecretaryAppointmentsPage() {
  const { secretaryId = '' } = useParams();
  const { secretaryName, doctorName, assignedDoctorId, isAwaitingData } =
    useAdminSecretaryById(secretaryId);

  return (
    <>
      <Helmet>
        <title>مواعيد السكرتير • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <Link
          to={`/admin/secretaries/${secretaryId}`}
          className='mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary'
        >
          <ArrowRight className='h-4 w-4' />
          العودة إلى ملف السكرتير
        </Link>

        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='مواعيد السكرتير'
          subtitle={
            isAwaitingData
              ? 'جارٍ التحميل…'
              : `${secretaryName} — نطاق الطبيب: ${doctorName}`
          }
          headerIcon={<CalendarDays className='h-8 w-8 text-white' />}
        />

        <SecretaryDoctorAppointmentsPanel
          assignedDoctorId={assignedDoctorId}
          doctorName={doctorName}
          mode='view'
        />
      </div>
    </>
  );
}
