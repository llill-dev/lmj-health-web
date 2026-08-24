import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarDays, Eye, Stethoscope } from 'lucide-react';
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

        <section className='mt-5 rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
          <div className='flex items-start gap-3 text-start'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Eye className='h-5 w-5' />
            </div>
            <div>
              <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                {tr('هذه شاشة عرض فقط', 'This is a view-only screen')}
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]'>
                {tr(
                  'تُستخدم هذه الصفحة لمراجعة مواعيد الطبيب المرتبطة بالسكرتير بشكل واضح، دون تنفيذ إجراءات إدارة مباشرة من هذا المسار.',
                  'Use this page to review the doctor appointments linked to the secretary without running direct management actions from this route.',
                )}
              </div>
            </div>
          </div>
        </section>

        <section className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-3'>
          <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
            <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
              {tr('الطبيب المرتبط', 'Linked doctor')}
            </div>
            <div className='mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
              <Stethoscope className='h-4 w-4 text-primary' />
              {doctorName || tr('غير محدد', 'Not set')}
            </div>
          </div>

          <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
            <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
              {tr('نطاق الصفحة', 'Page scope')}
            </div>
            <div className='mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
              <Eye className='h-4 w-4 text-primary' />
              {tr('عرض المواعيد فقط', 'Appointment review only')}
            </div>
          </div>

          <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
            <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
              {tr('الإجراء الحالي', 'Current action')}
            </div>
            <div className='mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
              <CalendarDays className='h-4 w-4 text-primary' />
              {tr('مراجعة الجدول المرتبط', 'Review linked schedule')}
            </div>
          </div>
        </section>

        <SecretaryDoctorAppointmentsPanel
          assignedDoctorId={assignedDoctorId}
          doctorName={doctorName}
          mode='view'
        />
      </div>
    </>
  );
}
