import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarClock, Settings } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { SecretaryDoctorAppointmentsPanel } from '@/components/admin/secretaries/SecretaryDoctorAppointmentsPanel';
import { useAdminSecretaryById } from '@/hooks/admin/secretaries/useAdminSecretaryById';
import { useI18n } from '@/i18n/provider';

export default function AdminSecretaryAppointmentsManagementPage() {
  const { secretaryId = '' } = useParams();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { secretaryName, doctorName, assignedDoctorId, isAwaitingData } =
    useAdminSecretaryById(secretaryId);

  return (
    <>
      <Helmet>
        <title>
          {tr('إدارة مواعيد السكرتير', 'Manage secretary appointments')} • LMJ
          Health
        </title>
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
          title={tr('إدارة مواعيد السكرتير', 'Manage secretary appointments')}
          subtitle={
            isAwaitingData
              ? tr('جارٍ التحميل…', 'Loading…')
              : tr(
                  `${secretaryName} — إدارة مواعيد ${doctorName}`,
                  `${secretaryName} — managing appointments for ${doctorName}`,
                )
          }
          headerIcon={<CalendarClock className='h-8 w-8 text-white' />}
        />

        <section className='mt-5 rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
          <div className='flex items-start gap-3 text-right'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Settings className='h-5 w-5' />
            </div>
            <div>
              <div className='font-cairo text-sm font-extrabold text-[#111827]'>
                {tr('هذه شاشة إدارة المواعيد', 'This is the appointment management screen')}
              </div>
              <div className='mt-1 font-cairo text-[13px] font-semibold leading-6 text-[#667085]'>
                {tr(
                  'يتم استخدام هذا المسار فقط عندما تحتاج الإدارة إلى تنفيذ إجراءات تنظيمية مباشرة على مواعيد الطبيب المرتبطة بالسكرتير.',
                  'Use this route only when the admin needs to perform direct operational actions on the doctor appointments linked to the secretary.',
                )}
              </div>
            </div>
          </div>
        </section>

        <SecretaryDoctorAppointmentsPanel
          assignedDoctorId={assignedDoctorId}
          doctorName={doctorName}
          mode='manage'
        />
      </div>
    </>
  );
}
