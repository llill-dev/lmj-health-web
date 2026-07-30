import { Helmet } from 'react-helmet-async';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  useAdminPlatformStats,
  useRecentAppointments,
  useTopApprovedDoctors,
} from '@/hooks/admin/analytics/useAdminAnalytics';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { TableRowSkeleton } from '@/components/admin/analytics/AnalyticsSkeletons';
import {
  formatDateTime,
  localizeSpec,
  STATUS_COLOR,
  STATUS_LABEL,
} from '@/components/admin/analytics/analyticsUtils';
import { useI18n } from '@/i18n/provider';

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const {
    stats,
    isAwaitingData: statsAwaiting,
    isRefetching: statsRefetching,
    refetch,
  } = useAdminPlatformStats();
  const doctorsQuery = useTopApprovedDoctors(8);
  const appointmentsQuery = useRecentAppointments(6);

  return (
    <>
      <Helmet>
        <title>{tr('التحليلات', 'Analytics')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title={tr('التحليلات والإحصائيات', 'Analytics and statistics')}
          subtitle={tr(
            'إحصائيات حقيقية من قاعدة البيانات',
            'Live statistics from the database',
          )}
          headerIcon={<BarChart3 className='h-8 w-8 text-white' />}
          actionLabel={
            statsRefetching ? tr('جارٍ التحديث...', 'Refreshing...') : tr('تحديث', 'Refresh')
          }
          actionIcon={
            <RefreshCw className={`h-4 w-4 ${statsRefetching ? 'animate-spin' : ''}`} />
          }
          onActionClick={() => void refetch()}
          kpiColumns={4}
          kpis={[
            {
              key: 'patients',
              icon: <Users className='h-5 w-5 shrink-0' />,
              value: statsAwaiting ? '—' : stats.totalPatients,
              label: tr('إجمالي المرضى', 'Total patients'),
            },
            {
              key: 'approved',
              icon: <UserCheck className='h-5 w-5 shrink-0' />,
              value: statsAwaiting ? '—' : stats.approvedDoctors,
              label: tr('أطباء معتمدون', 'Approved doctors'),
            },
            {
              key: 'appointments',
              icon: <CalendarDays className='h-5 w-5 shrink-0' />,
              value: statsAwaiting ? '—' : stats.totalAppointments,
              label: tr('إجمالي المواعيد', 'Total appointments'),
            },
            {
              key: 'doctors',
              icon: <Stethoscope className='h-5 w-5 shrink-0' />,
              value: statsAwaiting ? '—' : stats.totalDoctors,
              label: tr('إجمالي الأطباء', 'Total doctors'),
            },
          ]}
        />

        {statsRefetching && !statsAwaiting ? (
          <div className='mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            {tr('جارٍ تحديث الإحصائيات...', 'Refreshing analytics...')}
          </div>
        ) : null}

        {/* ── secondary metrics ── */}
        <section className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
          <div className='flex items-center gap-4 rounded-[12px] border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm'>
              <Clock className='h-5 w-5 text-[#D97706]' />
            </div>
            <div>
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>
                {tr('طلبات التحقق المعلقة', 'Pending verifications')}
              </div>
              {statsAwaiting ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#111827]'>
                  {stats.pendingVerifications.toLocaleString(numberLocale)}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 rounded-[12px] border border-[#86EFAC] bg-gradient-to-br from-[#F0FDF4] to-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm'>
              <CheckCircle2 className='h-5 w-5 text-[#16A34A]' />
            </div>
            <div>
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>
                {tr('نسبة الاعتماد', 'Approval rate')}
              </div>
              {statsAwaiting ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#16A34A]'>
                  {stats.totalDoctors > 0
                    ? `${Math.round((stats.approvedDoctors / stats.totalDoctors) * 100)}${tr('٪', '%')}`
                    : '—'}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 rounded-[12px] border border-[#C4B5FD] bg-gradient-to-br from-[#F5F3FF] to-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm'>
              <Activity className='h-5 w-5 text-[#7C3AED]' />
            </div>
            <div>
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>
                {tr('السكرتارية الكلي', 'Total secretaries')}
              </div>
              {statsAwaiting ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#111827]'>
                  {stats.totalSecretaries.toLocaleString(numberLocale)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── main content grid ── */}
        <div className='mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3'>

          {/* approved doctors table — spans 2 cols */}
          <div className='xl:col-span-2 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
              <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                <UserCheck className='h-4 w-4 text-primary' />
                {tr('الأطباء المعتمدون', 'Approved doctors')}
              </div>
              {doctorsQuery.data && (
                <span className='rounded-full bg-[#E7FBFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary'>
                  {doctorsQuery.data.total.toLocaleString(numberLocale)}{' '}
                  {tr('طبيب', 'doctors')}
                </span>
              )}
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-[#F9FAFB]'>
                    {[
                      tr('الطبيب', 'Doctor'),
                      tr('التخصص', 'Specialty'),
                      tr('المدينة', 'City'),
                      tr('رسوم الاستشارة', 'Consultation fee'),
                      tr('نوع الاستشارة', 'Consultation type'),
                    ].map((h) => (
                      <th
                        key={h}
                        className='whitespace-nowrap px-4 py-3.5 text-start font-cairo text-[11px] font-extrabold text-[#667085]'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#EEF2F6]'>
                  {doctorsQuery.isAwaitingData
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton
                          key={i}
                          cols={5}
                        />
                      ))
                    : doctorsQuery.isError
                      ? (
                          <tr>
                            <td
                              colSpan={5}
                              className='px-4 py-8 text-center'
                            >
                              <div className='flex flex-col items-center gap-2 text-[#667085]'>
                                <AlertCircle className='h-5 w-5 text-[#F87171]' />
                                <span className='font-cairo text-[12px]'>
                                  {tr('تعذّر تحميل البيانات', 'Failed to load data')}
                                </span>
                                <button
                                  type='button'
                                  onClick={() => void doctorsQuery.refetch()}
                                  className='mt-1 inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[11px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]'
                                >
                                  <RefreshCw className='h-3.5 w-3.5' />
                                  {tr('إعادة المحاولة', 'Retry')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      : doctorsQuery.data?.doctors.length === 0
                        ? (
                            <tr>
                              <td
                                colSpan={5}
                                className='px-4 py-10 text-center font-cairo text-[12px] font-bold text-[#98A2B3]'
                              >
                                {tr(
                                  'لا يوجد أطباء معتمدون بعد',
                                  'No approved doctors yet',
                                )}
                              </td>
                            </tr>
                          )
                        : doctorsQuery.data?.doctors.map((d) => {
                            const consultTypes = d.consultationTypes ?? [];
                            return (
                              <tr
                                key={d._id}
                                className='bg-white transition-colors hover:bg-[#FAFAFA]'
                              >
                                <td className='px-4 py-3.5'>
                                  <div className='flex items-center gap-2.5'>
                                    <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 font-cairo text-[11px] font-black text-primary'>
                                      {d.user?.fullName?.charAt(0) ?? tr('د', 'D')}
                                    </div>
                                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                                      {d.user?.fullName ?? '—'}
                                    </span>
                                  </div>
                                </td>
                                <td className='px-4 py-3.5 font-cairo text-[12px] font-bold text-[#667085]'>
                                  {localizeSpec(d.specialization)}
                                </td>
                                <td className='px-4 py-3.5 font-cairo text-[12px] font-bold text-[#667085]'>
                                  {d.locationCity ?? '—'}
                                </td>
                                <td className='px-4 py-3.5 font-cairo text-[12px] font-extrabold text-[#111827]'>
                                  {d.consultationFee != null
                                    ? `${d.consultationFee.toLocaleString(numberLocale)} ${tr('ل.س', 'SYP')}`
                                    : '—'}
                                </td>
                                <td className='px-4 py-3.5'>
                                  <div className='flex flex-wrap gap-1'>
                                    {consultTypes.length === 0 ? (
                                      <span className='font-cairo text-[11px] text-[#98A2B3]'>—</span>
                                    ) : (
                                      consultTypes.map((t) => (
                                        <span
                                          key={t}
                                          className={`rounded-full px-2 py-0.5 font-cairo text-[10px] font-extrabold ${
                                            t === 'online'
                                              ? 'bg-[#E0F2FE] text-[#0369A1]'
                                              : 'bg-[#F0FDF4] text-[#16A34A]'
                                          }`}
                                        >
                                          {t === 'online'
                                            ? tr('أونلاين', 'Online')
                                            : tr('حضوري', 'In-person')}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                </tbody>
              </table>
            </div>
          </div>

          {/* right column — platform overview */}
          <div className='flex flex-col gap-5'>

            {/* doctor breakdown */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <div className='mb-4 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                <BarChart3 className='h-4 w-4 text-primary' />
                {tr('توزيع حالة الأطباء', 'Doctor status distribution')}
              </div>

              <div className='space-y-3'>
                {[
                  {
                    label: tr('معتمدون', 'Approved'),
                    value: stats.approvedDoctors,
                    total: stats.totalDoctors,
                    bar: 'bg-[#22C55E]',
                    text: 'text-[#16A34A]',
                  },
                  {
                    label: tr('قيد المراجعة', 'Pending review'),
                    value: stats.pendingDoctors,
                    total: stats.totalDoctors,
                    bar: 'bg-[#F59E0B]',
                    text: 'text-[#D97706]',
                  },
                  {
                    label: tr('مرفوضون', 'Rejected'),
                    value:
                      stats.totalDoctors - stats.approvedDoctors - stats.pendingDoctors,
                    total: stats.totalDoctors,
                    bar: 'bg-[#F87171]',
                    text: 'text-[#DC2626]',
                  },
                ].map(({ label, value, total, bar, text }) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className='flex items-center justify-between'>
                        <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                          {label}
                        </div>
                        <div className={`font-cairo text-[11px] font-extrabold ${text}`}>
                          {statsAwaiting
                            ? '—'
                            : `${value.toLocaleString(numberLocale)} (${pct}${tr('٪', '%')})`}
                        </div>
                      </div>
                      <div className='mt-1.5 h-[8px] w-full rounded-full bg-[#EEF2F6]'>
                        {!statsAwaiting && (
                          <div
                            className={`h-[8px] rounded-full transition-all duration-700 ${bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* user growth */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <div className='mb-4 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                <Users className='h-4 w-4 text-primary' />
                {tr('نمو المستخدمين', 'User growth')}
              </div>

              <div className='space-y-3'>
                {[
                  {
                    label: tr('المرضى الكلي', 'Total patients'),
                    value: stats.totalPatients,
                    bg: 'bg-[#E7FBFA]',
                    text: 'text-primary',
                  },
                  {
                    label: tr('الأطباء الكلي', 'Total doctors'),
                    value: stats.totalDoctors,
                    bg: 'bg-[#ECFDF3]',
                    text: 'text-[#16A34A]',
                  },
                  {
                    label: tr('السكرتارية الكلي', 'Total secretaries'),
                    value: stats.totalSecretaries,
                    bg: 'bg-[#EFF6FF]',
                    text: 'text-[#2563EB]',
                  },
                ].map(({ label, value, bg, text }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between rounded-[10px] ${bg} px-4 py-3`}
                  >
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {label}
                    </div>
                    {statsAwaiting ? (
                      <div className='h-4 w-10 animate-pulse rounded bg-[#EEF2F6]' />
                    ) : (
                      <div className={`font-cairo text-[14px] font-black ${text}`}>
                        {value.toLocaleString(numberLocale)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── recent appointments ── */}
        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
              <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                <CalendarDays className='h-4 w-4 text-primary' />
                {tr('آخر المواعيد', 'Recent appointments')}
              </div>
              {appointmentsQuery.data && (
                <span className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                  {tr('إجمالي', 'Total')}{' '}
                  {appointmentsQuery.data.total.toLocaleString(numberLocale)}{' '}
                  {tr('موعد', 'appointments')}
                </span>
              )}
            </div>

          {appointmentsQuery.isRefetching && !appointmentsQuery.isAwaitingData ? (
            <div className='border-b border-[#EEF2F6] px-6 py-3 font-cairo text-[12px] font-bold text-[#047857]'>
              <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2'>
                <RefreshCw className='h-4 w-4 animate-spin' />
                {tr('جارٍ تحديث المواعيد...', 'Refreshing appointments...')}
              </div>
            </div>
          ) : null}

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-[#F9FAFB]'>
                  {[
                    tr('الطبيب', 'Doctor'),
                    tr('المريض', 'Patient'),
                    tr('التاريخ', 'Date'),
                    tr('الحالة', 'Status'),
                  ].map((h) => (
                    <th
                      key={h}
                      className='whitespace-nowrap px-4 py-3.5 text-start font-cairo text-[11px] font-extrabold text-[#667085]'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-[#EEF2F6]'>
                {appointmentsQuery.isAwaitingData
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRowSkeleton
                        key={i}
                        cols={4}
                      />
                    ))
                  : appointmentsQuery.isError
                    ? (
                        <tr>
                          <td
                            colSpan={4}
                            className='px-4 py-8 text-center'
                          >
                            <div className='flex flex-col items-center gap-2 text-[#667085]'>
                              <AlertCircle className='h-5 w-5 text-[#F87171]' />
                              <span className='font-cairo text-[12px]'>
                                {tr('تعذّر تحميل البيانات', 'Failed to load data')}
                              </span>
                              <button
                                type='button'
                                onClick={() => void appointmentsQuery.refetch()}
                                className='mt-1 inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[11px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]'
                              >
                                <RefreshCw className='h-3.5 w-3.5' />
                                {tr('إعادة المحاولة', 'Retry')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    : appointmentsQuery.data?.appointments.length === 0
                      ? (
                          <tr>
                            <td
                              colSpan={4}
                              className='px-4 py-10 text-center font-cairo text-[12px] font-bold text-[#98A2B3]'
                            >
                              {tr(
                                'لا توجد مواعيد حتى الآن',
                                'No appointments yet',
                              )}
                            </td>
                          </tr>
                        )
                      : appointmentsQuery.data?.appointments.map((a) => (
                          <tr
                            key={a._id}
                            className='bg-white transition-colors hover:bg-[#FAFAFA]'
                          >
                            <td className='px-4 py-3.5 font-cairo text-[12px] font-extrabold text-[#111827]'>
                              {a.doctor?.userId?.fullName ?? '—'}
                            </td>
                            <td className='px-4 py-3.5 font-cairo text-[12px] font-bold text-[#667085]'>
                              {a.patient?.userId?.fullName ?? a.patient?.publicId ?? '—'}
                            </td>
                            <td className='px-4 py-3.5 font-cairo text-[12px] font-bold text-[#667085]'>
                              {formatDateTime(a)}
                            </td>
                            <td className='px-4 py-3.5'>
                              <span
                                className={`rounded-full px-2.5 py-1 font-cairo text-[10px] font-extrabold ${STATUS_COLOR[a.status]}`}
                              >
                                {STATUS_LABEL[a.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
