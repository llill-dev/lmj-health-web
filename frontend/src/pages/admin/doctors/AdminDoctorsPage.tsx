import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2,
  Clock,
  Ban,
  Stethoscope,
  Mail,
  Phone,
  ChevronLeft,
  Eye,
  Award,
} from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAdminDoctors } from '@/hooks/useAdminDoctors';
import type {
  AdminDoctorApprovalStatus,
  AdminDoctorSummary,
} from '@/lib/admin/types';

const TEAL = '#108B8B';
const STAT_BG = '#E6F4F4';

function doctorInitial(fullName?: string) {
  const n = (fullName ?? '').trim();
  if (!n.length) return 'د';
  return n.charAt(0);
}

function StatusBadge({ status }: { status?: AdminDoctorApprovalStatus }) {
  if (status === 'approved') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#28A745] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
        <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
        مقبول
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#DC3545] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
        <Ban className='h-3.5 w-3.5 shrink-0' />
        مرفوض
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#343A40] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
      <Clock className='h-3.5 w-3.5 shrink-0' />
      بانتظار الموافقة
    </span>
  );
}

function DoctorListCard({
  doctor: d,
  onDetails,
}: {
  doctor: AdminDoctorSummary;
  onDetails: () => void;
}) {
  const appt = d.appointmentsCount;
  const done = d.completedAppointmentsCount;
  const pts = d.linkedPatientsCount;
  const fmt = (n: number | undefined) =>
    typeof n === 'number' && !Number.isNaN(n) ? String(n) : '—';

  return (
    <div className='rounded-[10px] border border-[#E8ECEF] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]'>
      <div className='flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-stretch lg:justify-between lg:gap-6'>
        {/* الهوية — يمين الصفحة في RTL */}
        <div className='flex shrink-0 items-start gap-3'>
          <div
            className='flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] text-[22px] font-black text-white'
            style={{ backgroundColor: TEAL }}
          >
            {doctorInitial(d.user?.fullName)}
          </div>
          <div className='min-w-0 text-right'>
            <div className='font-cairo text-[15px] font-extrabold leading-snug text-[#1F2937]'>
              {d.user?.fullName ?? '—'}
            </div>
            <div className='mt-1 font-cairo text-[13px] font-semibold text-[#6B7280]'>
              {d.specialization ?? '—'}
            </div>
          </div>
        </div>

        {/* إحصائيات ثلاثية */}
        <div className='flex flex-1 flex-wrap items-stretch justify-center gap-2'>
          {[
            { label: 'المواعيد', value: fmt(appt) },
            { label: 'مكتملة', value: fmt(done) },
            { label: 'المرضى', value: fmt(pts) },
          ].map((box) => (
            <div
              key={box.label}
              className='flex min-w-[88px] flex-1 flex-col items-center justify-center rounded-[8px] px-3 py-2 sm:max-w-[120px]'
              style={{ backgroundColor: STAT_BG }}
            >
              <span
                className='font-cairo text-[11px] font-bold'
                style={{ color: TEAL }}
              >
                {box.label}
              </span>
              <span
                className='mt-0.5 font-cairo text-[20px] font-black leading-none'
                style={{ color: TEAL }}
              >
                {box.value}
              </span>
            </div>
          ))}
        </div>

        {/* تواصل */}
        <div className='flex min-w-[200px] flex-col gap-2 text-right lg:max-w-[280px]'>
          <div className='flex items-start gap-2'>
            <Award
              className='h-4 w-4 shrink-0 mt-0.5'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span className='font-cairo text-[12px] font-semibold text-[#6B7280]'>
              رخصة:{' '}
              <span className='text-[#374151]'>
                {d.medicalLicenseNumber ?? '—'}
              </span>
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Mail
              className='h-4 w-4 shrink-0'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span className='truncate font-cairo text-[12px] font-semibold text-[#6B7280]'>
              {d.user?.email ?? '—'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Phone
              className='h-4 w-4 shrink-0'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span
              className='font-cairo text-[12px] font-semibold text-[#6B7280]'
              dir='ltr'
            >
              {d.user?.phone ?? '—'}
            </span>
          </div>
        </div>

        {/* الحالة + زر التفاصيل */}
        <div className='flex shrink-0 flex-col items-stretch gap-3 sm:min-w-[140px] lg:items-end'>
          <StatusBadge status={d.approvalStatus} />
          <button
            type='button'
            onClick={onDetails}
            className='inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] px-4 font-cairo text-[13px] font-extrabold text-white transition hover:opacity-92 sm:w-auto'
            style={{ backgroundColor: TEAL }}
          >
            <span>التفاصيل</span>
            <Eye className='h-4 w-4 shrink-0' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    search: string;
    specialization: string;
    status: AdminDoctorApprovalStatus | '';
    city: string;
    country: string;
    from: string;
    to: string;
    page: number;
    limit: number;
  }>({
    search: '',
    specialization: '',
    status: '',
    city: '',
    country: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  });

  const { doctors, total, results, isLoading, error } = useAdminDoctors({
    search: filters.search || undefined,
    specialization: filters.specialization || undefined,
    status: filters.status || undefined,
    city: filters.city || undefined,
    country: filters.country || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const stats = useMemo(() => {
    const approvedCount = doctors.filter(
      (d) => d.approvalStatus === 'approved',
    ).length;
    const pendingCount = doctors.filter(
      (d) => d.approvalStatus === 'pending',
    ).length;
    const rejectedCount = doctors.filter(
      (d) => d.approvalStatus === 'rejected',
    ).length;

    return [
      {
        title: 'مرفوض' as const,
        value: rejectedCount,
        icon: Ban,
        tone: {
          border: 'border-[#FECACA]',
          bg: 'bg-[#FFF5F5]',
          iconBg: 'bg-[#FEE2E2]',
          iconColor: 'text-[#EF4444]',
          valueColor: 'text-[#EF4444]',
        },
      },
      {
        title: 'معلّق' as const,
        value: pendingCount,
        icon: Clock,
        tone: {
          border: 'border-[#E5E7EB]',
          bg: 'bg-white',
          iconBg: 'bg-[#F3F4F6]',
          iconColor: 'text-[#475467]',
          valueColor: 'text-[#111827]',
        },
      },
      {
        title: 'مقبول' as const,
        value: approvedCount,
        icon: CheckCircle2,
        tone: {
          border: 'border-[#BBF7D0]',
          bg: 'bg-[#F0FDF4]',
          iconBg: 'bg-[#DCFCE7]',
          iconColor: 'text-[#16A34A]',
          valueColor: 'text-[#16A34A]',
        },
      },
      {
        title: 'إجمالي الأطباء' as const,
        value: total,
        icon: Stethoscope,
        tone: {
          border: 'border-[#CFFAFE]',
          bg: 'bg-[#ECFEFF]',
          iconBg: 'bg-primary/15',
          iconColor: 'text-primary',
          valueColor: 'text-primary',
        },
      },
    ];
  }, [doctors, total]);

  return (
    <>
      <Helmet>
        <title>إدارة الأطباء • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة الأطباء
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة ومتابعة بيانات الأطباء
            </div>
          </div>
        </div>

        <section className='mt-6 grid grid-cols-4 gap-5'>
          {stats.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`flex items-center justify-between rounded-[12px] border px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone.border} ${c.tone.bg}`}
              >
                <div className='text-right'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    {c.title}
                  </div>
                  <div
                    className={`mt-2 font-cairo text-[22px] font-black leading-[22px] ${c.tone.valueColor}`}
                  >
                    {c.value}
                  </div>
                </div>

                <div
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] ${c.tone.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${c.tone.iconColor}`} />
                </div>
              </div>
            );
          })}
        </section>

        <AdminSearchFiltersBar
          queryPlaceholder='ابحث عن طبيب...'
          specialtyPlaceholder='الاختصاص'
          specialtyOptions={[
            { label: 'طب الأطفال', value: 'pediatrics' },
            { label: 'طب الأسرة', value: 'family' },
          ]}
          statusPlaceholder='الحالة'
          statusOptions={[
            { label: 'مقبول', value: 'approved' },
            { label: 'معلّق', value: 'pending' },
            { label: 'مرفوض', value: 'rejected' },
          ]}
          filtersLeading={
            <div className='flex items-center gap-3'>
              <input
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    city: e.target.value,
                    page: 1,
                  }))
                }
                placeholder='المدينة'
                className='h-[42px] w-[140px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
              <input
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value,
                    page: 1,
                  }))
                }
                placeholder='الدولة'
                className='h-[42px] w-[140px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
              <input
                type='date'
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value,
                    page: 1,
                  }))
                }
                className='h-[42px] w-[150px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827]'
              />
              <input
                type='date'
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: e.target.value,
                    page: 1,
                  }))
                }
                className='h-[42px] w-[150px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827]'
              />
            </div>
          }
          onChange={(values) => {
            setFilters((prev) => ({
              ...prev,
              search: values.query ?? '',
              specialization: values.specialty ?? '',
              status: (values.status as AdminDoctorApprovalStatus) ?? '',
              page: 1,
            }));
          }}
        />

        <section className='mt-5 overflow-hidden rounded-[12px] border border-[#E8ECEF] bg-[#F8F9FA] shadow-[0_4px_24px_rgba(0,0,0,0.05)]'>
          <div className='flex items-center justify-between border-b border-[#E8ECEF] bg-white px-6 py-4'>
            <div className='flex items-center gap-2'>
              <Stethoscope
                className='h-5 w-5 shrink-0'
                style={{ color: TEAL }}
                aria-hidden
              />
              <div className='font-cairo text-[16px] font-black text-[#1F2937]'>
                قائمة الأطباء ({results})
              </div>
            </div>
          </div>

          <div className='space-y-4 p-5'>
            {isLoading ? (
              <div className='rounded-[10px] border border-[#E8ECEF] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                جاري تحميل قائمة الأطباء...
              </div>
            ) : error ? (
              <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]'>
                فشل تحميل قائمة الأطباء
              </div>
            ) : doctors.length === 0 ? (
              <div className='rounded-[10px] border border-[#E8ECEF] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا يوجد أطباء مطابقون لخيارات البحث.
              </div>
            ) : (
              doctors.map((d) => (
                <DoctorListCard
                  key={d._id}
                  doctor={d}
                  onDetails={() =>
                    navigate(`/admin/doctors/${encodeURIComponent(d._id)}`)
                  }
                />
              ))
            )}
          </div>
        </section>

        <div className='mt-4 flex items-center justify-between'>
          <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <select
                value={filters.limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value) || 20;
                  setFilters((prev) => ({
                    ...prev,
                    limit: nextLimit,
                    page: 1,
                  }));
                }}
                className='h-[38px] w-[120px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]'
              >
                <option value={20}>20 / صفحة</option>
                <option value={50}>50 / صفحة</option>
                <option value={100}>100 / صفحة</option>
              </select>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <ChevronLeft className='h-4 w-4 rotate-[-90deg]' />
              </div>
            </div>

            <button
              type='button'
              disabled={isLoading || filters.page <= 1}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              className={
                isLoading || filters.page <= 1
                  ? 'h-[38px] rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3]'
                  : 'h-[38px] rounded-[10px] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)]'
              }
            >
              السابق
            </button>
            <button
              type='button'
              disabled={isLoading || filters.page >= totalPages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              className={
                isLoading || filters.page >= totalPages
                  ? 'h-[38px] rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3]'
                  : 'h-[38px] rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(15, 143, 139,0.25)]'
              }
            >
              التالي
            </button>
          </div>
        </div>

        <div className='h-8' />
      </div>
    </>
  );
}
