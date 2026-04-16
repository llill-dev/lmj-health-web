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
} from '@/hooks/useAdminAnalytics';
import type { AppointmentSummary } from '@/lib/admin/types';

/* ─── helpers ──────────────────────────────────────────────── */
const SPECIALIZATION_AR: Record<string, string> = {
  Cardiology: 'القلب',
  Dermatology: 'الجلدية',
  Pediatrics: 'الأطفال',
  Neurology: 'الأعصاب',
  Orthopedics: 'العظام',
  Gynecology: 'النساء والتوليد',
  Ophthalmology: 'العيون',
  Urology: 'المسالك البولية',
  Psychiatry: 'الطب النفسي',
  'Internal Medicine': 'الباطنة',
  Surgery: 'الجراحة',
  Oncology: 'الأورام',
  Endocrinology: 'الغدد',
  Pulmonology: 'الرئة',
  Gastroenterology: 'الجهاز الهضمي',
};

function localizeSpec(spec?: string) {
  if (!spec) return '—';
  return SPECIALIZATION_AR[spec] ?? spec;
}

const STATUS_LABEL: Record<AppointmentSummary['status'], string> = {
  scheduled: 'مجدول',
  rescheduled: 'معاد جدولته',
  completed: 'مكتمل',
  cancelled: 'ملغى',
  'no-show': 'غياب',
};

const STATUS_COLOR: Record<AppointmentSummary['status'], string> = {
  scheduled: 'bg-[#E0F2FE] text-[#0369A1]',
  rescheduled: 'bg-[#FEF9C3] text-[#854D0E]',
  completed: 'bg-[#DCFCE7] text-[#15803D]',
  cancelled: 'bg-[#FEE2E2] text-[#B91C1C]',
  'no-show': 'bg-[#F3F4F6] text-[#6B7280]',
};

function formatDateTime(appt: AppointmentSummary): string {
  const raw = appt.startDateTime ?? appt.date;
  if (!raw) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

/* ─── skeleton ──────────────────────────────────────────────── */
function StatCardSkeleton() {
  return (
    <div className='h-[147px] animate-pulse rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB]' />
  );
}

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td
          key={i}
          className='px-4 py-4'
        >
          <div className='h-3 animate-pulse rounded bg-[#EEF2F6]' />
        </td>
      ))}
    </tr>
  );
}

/* ─── stat card ─────────────────────────────────────────────── */
type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ElementType;
  border: string;
  bg: string;
  iconColor: string;
  sub?: string;
  subColor?: string;
  loading?: boolean;
};

function StatCard({
  title,
  value,
  icon: Icon,
  border,
  bg,
  iconColor,
  sub,
  subColor = 'text-[#667085]',
  loading,
}: StatCardProps) {
  return (
    <div
      className={`h-[147px] rounded-[12px] border px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${border} ${bg}`}
    >
      <div className='flex items-start justify-between'>
        <div className='text-right'>
          <div className='font-cairo text-[12px] font-extrabold text-[#667085]'>
            {title}
          </div>
          {loading ? (
            <div className='mt-2 h-7 w-20 animate-pulse rounded bg-[#EEF2F6]' />
          ) : (
            <div className='mt-2 font-cairo text-[26px] font-black leading-[30px] text-[#111827]'>
              {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
            </div>
          )}
          {sub && (
            <div className={`mt-2 font-cairo text-[11px] font-extrabold ${subColor}`}>
              {sub}
            </div>
          )}
        </div>
        <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-white shadow-sm'>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const { stats, isLoading: statsLoading, refetch } = useAdminPlatformStats();
  const doctorsQuery = useTopApprovedDoctors(8);
  const appointmentsQuery = useRecentAppointments(6);

  return (
    <>
      <Helmet>
        <title>التحليلات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        {/* header */}
        <div className='flex items-center justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
              التحليلات والإحصائيات
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
              إحصائيات حقيقية من قاعدة البيانات
            </div>
          </div>

          <button
            onClick={refetch}
            className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-white px-4 py-2.5 font-cairo text-[12px] font-extrabold text-[#667085] shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95'
          >
            <RefreshCw className='h-4 w-4' />
            تحديث
          </button>
        </div>

        {/* ── stat cards ── */}
        <section className='mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title='إجمالي المرضى'
                value={stats.totalPatients}
                icon={Users}
                border='border-[#86EFAC]'
                bg='bg-gradient-to-br from-[#F0FDF4] to-white'
                iconColor='text-[#16A34A]'
                sub={`${stats.totalPatients} مريض مسجل`}
                subColor='text-[#16A34A]'
              />
              <StatCard
                title='الأطباء المعتمدون'
                value={stats.approvedDoctors}
                icon={UserCheck}
                border='border-[#67E8F9]'
                bg='bg-gradient-to-br from-[#ECFEFF] to-white'
                iconColor='text-primary'
                sub={`${stats.pendingDoctors} طلب قيد المراجعة`}
                subColor={stats.pendingDoctors > 0 ? 'text-[#D97706]' : 'text-[#667085]'}
              />
              <StatCard
                title='إجمالي المواعيد'
                value={stats.totalAppointments}
                icon={CalendarDays}
                border='border-[#86EFAC]'
                bg='bg-gradient-to-br from-[#F0FDF4] to-white'
                iconColor='text-[#16A34A]'
                sub='جميع الحالات'
              />
              <StatCard
                title='إجمالي الأطباء'
                value={stats.totalDoctors}
                icon={Stethoscope}
                border='border-[#67E8F9]'
                bg='bg-gradient-to-br from-[#ECFEFF] to-white'
                iconColor='text-primary'
                sub={`${stats.totalSecretaries} سكرتير/ة`}
              />
            </>
          )}
        </section>

        {/* ── secondary metrics ── */}
        <section className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
          <div className='flex items-center gap-4 rounded-[12px] border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm'>
              <Clock className='h-5 w-5 text-[#D97706]' />
            </div>
            <div>
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>طلبات التحقق المعلقة</div>
              {statsLoading ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#111827]'>
                  {stats.pendingVerifications.toLocaleString('ar-EG')}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 rounded-[12px] border border-[#86EFAC] bg-gradient-to-br from-[#F0FDF4] to-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm'>
              <CheckCircle2 className='h-5 w-5 text-[#16A34A]' />
            </div>
            <div>
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>نسبة الاعتماد</div>
              {statsLoading ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#16A34A]'>
                  {stats.totalDoctors > 0
                    ? `${Math.round((stats.approvedDoctors / stats.totalDoctors) * 100)}٪`
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
              <div className='font-cairo text-[11px] font-extrabold text-[#667085]'>السكرتارية الكلي</div>
              {statsLoading ? (
                <div className='mt-1 h-5 w-12 animate-pulse rounded bg-[#EEF2F6]' />
              ) : (
                <div className='mt-0.5 font-cairo text-[20px] font-black text-[#111827]'>
                  {stats.totalSecretaries.toLocaleString('ar-EG')}
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
                الأطباء المعتمدون
              </div>
              {doctorsQuery.data && (
                <span className='rounded-full bg-[#E7FBFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary'>
                  {doctorsQuery.data.total.toLocaleString('ar-EG')} طبيب
                </span>
              )}
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-[#F9FAFB]'>
                    {['الطبيب', 'التخصص', 'المدينة', 'رسوم الاستشارة', 'نوع الاستشارة'].map(
                      (h) => (
                        <th
                          key={h}
                          className='whitespace-nowrap px-4 py-3.5 text-right font-cairo text-[11px] font-extrabold text-[#667085]'
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#EEF2F6]'>
                  {doctorsQuery.isLoading
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
                                <span className='font-cairo text-[12px]'>تعذّر تحميل البيانات</span>
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
                                لا يوجد أطباء معتمدون بعد
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
                                      {d.user?.fullName?.charAt(0) ?? 'د'}
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
                                    ? `${d.consultationFee.toLocaleString('ar-EG')} ل.س`
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
                                          {t === 'online' ? 'أونلاين' : 'حضوري'}
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
                توزيع حالة الأطباء
              </div>

              <div className='space-y-3'>
                {[
                  {
                    label: 'معتمدون',
                    value: stats.approvedDoctors,
                    total: stats.totalDoctors,
                    bar: 'bg-[#22C55E]',
                    text: 'text-[#16A34A]',
                  },
                  {
                    label: 'قيد المراجعة',
                    value: stats.pendingDoctors,
                    total: stats.totalDoctors,
                    bar: 'bg-[#F59E0B]',
                    text: 'text-[#D97706]',
                  },
                  {
                    label: 'مرفوضون',
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
                          {statsLoading ? '—' : `${value.toLocaleString('ar-EG')} (${pct}٪)`}
                        </div>
                      </div>
                      <div className='mt-1.5 h-[8px] w-full rounded-full bg-[#EEF2F6]'>
                        {!statsLoading && (
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
                نمو المستخدمين
              </div>

              <div className='space-y-3'>
                {[
                  {
                    label: 'المرضى الكلي',
                    value: stats.totalPatients,
                    bg: 'bg-[#E7FBFA]',
                    text: 'text-primary',
                  },
                  {
                    label: 'الأطباء الكلي',
                    value: stats.totalDoctors,
                    bg: 'bg-[#ECFDF3]',
                    text: 'text-[#16A34A]',
                  },
                  {
                    label: 'السكرتارية الكلي',
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
                    {statsLoading ? (
                      <div className='h-4 w-10 animate-pulse rounded bg-[#EEF2F6]' />
                    ) : (
                      <div className={`font-cairo text-[14px] font-black ${text}`}>
                        {value.toLocaleString('ar-EG')}
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
              آخر المواعيد
            </div>
            {appointmentsQuery.data && (
              <span className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                إجمالي {appointmentsQuery.data.total.toLocaleString('ar-EG')} موعد
              </span>
            )}
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-[#F9FAFB]'>
                  {['الطبيب', 'المريض', 'التاريخ', 'الحالة'].map((h) => (
                    <th
                      key={h}
                      className='whitespace-nowrap px-4 py-3.5 text-right font-cairo text-[11px] font-extrabold text-[#667085]'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-[#EEF2F6]'>
                {appointmentsQuery.isLoading
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
                              <span className='font-cairo text-[12px]'>تعذّر تحميل البيانات</span>
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
                              لا توجد مواعيد حتى الآن
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
