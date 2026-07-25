import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { SecretaryDoctorAppointmentsPanel } from '@/components/admin/secretaries/SecretaryDoctorAppointmentsPanel';
import { useAdminSecretaryById } from '@/hooks/admin/secretaries/useAdminSecretaryById';
import { useI18n } from '@/i18n/provider';

export default function AdminSecretaryAppointmentsPage() {
  const { secretaryId = '' } = useParams();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { secretaryName, doctorName, assignedDoctorId, isAwaitingData } =
    useAdminSecretaryById(secretaryId);

  return (
    <>
      <Helmet>
        <title>{tr('مواعيد السكرتير', 'Secretary appointments')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <Link
          to={`/admin/secretaries/${secretaryId}`}
          className='mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary'
        >
          <ArrowRight className='h-4 w-4' />
          {tr('العودة إلى ملف السكرتير', 'Back to secretary profile')}
        </Link>

        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title={tr('مواعيد السكرتير', 'Secretary appointments')}
          subtitle={
            isAwaitingData
              ? tr('جارٍ التحميل…', 'Loading…')
              : tr(
                  `${secretaryName} — نطاق الطبيب: ${doctorName}`,
                  `${secretaryName} — doctor scope: ${doctorName}`,
                )
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
