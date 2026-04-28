import { Helmet } from 'react-helmet-async';
import {
  Ban,
  CheckCircle2,
  Clock,
  Stethoscope,
  ChevronLeft,
} from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';
import DoctorListCard from '@/components/admin/doctors/DoctorListCard';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAdminDoctors } from '@/hooks/useAdminDoctors';
import type { AdminDoctorApprovalStatus } from '@/lib/admin/types';

const TEAL = '#108B8B';

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
        className='mx-auto w-full max-w-[1600px] px-3 pb-6 sm:px-4 md:px-6'
      >
        <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 text-right'>
            <div className='font-cairo text-lg font-black leading-snug text-[#111827] sm:text-[20px] sm:leading-[26px]'>
              إدارة الأطباء
            </div>
            <div className='mt-1 font-cairo text-[11px] font-semibold leading-snug text-[#98A2B3] sm:text-[12px] sm:leading-[14px]'>
              إدارة ومتابعة بيانات الأطباء
            </div>
          </div>
        </div>

        <section className='mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4'>
          {stats.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`flex items-center justify-between gap-3 rounded-[12px] border px-3 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-5 sm:py-4 ${c.tone.border} ${c.tone.bg}`}
              >
                <div className='min-w-0 text-right'>
                  <div className='font-cairo text-[11px] font-bold text-[#667085] sm:text-[12px]'>
                    {c.title}
                  </div>
                  <div
                    className={`mt-1 font-cairo text-lg font-black leading-none sm:mt-2 sm:text-[22px] sm:leading-[22px] ${c.tone.valueColor}`}
                  >
                    {c.value}
                  </div>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] sm:h-[44px] sm:w-[44px] ${c.tone.iconBg}`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${c.tone.iconColor}`} />
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
            <div className='flex w-full min-w-0 flex-wrap content-stretch items-center gap-2 sm:gap-3'>
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
                className='h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4'
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
                className='h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4'
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
                className='h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-right font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4'
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
                className='h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-right font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4'
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

        <section className='mt-4 overflow-hidden rounded-[12px] border border-[#E8ECEF] bg-[#F8F9FA] shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:mt-5'>
          <div className='flex items-center justify-between border-b border-[#E8ECEF] bg-white px-4 py-3 sm:px-6 sm:py-4'>
            <div className='flex min-w-0 items-center gap-2'>
              <Stethoscope
                className='h-4 w-4 shrink-0 sm:h-5 sm:w-5'
                style={{ color: TEAL }}
                aria-hidden
              />
              <div className='truncate font-cairo text-sm font-black text-[#1F2937] sm:text-[16px]'>
                قائمة الأطباء ({results})
              </div>
            </div>
          </div>

          <div className='space-y-3 p-3 sm:space-y-4 sm:p-5'>
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

        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          <div className='text-center font-cairo text-[11px] font-semibold text-[#667085] sm:text-right sm:text-[12px]'>
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3'>
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
                className='h-[38px] w-full min-w-[110px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#111827] sm:w-[120px] sm:px-4'
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
                  ? 'h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none'
                  : 'h-[38px] flex-1 rounded-[10px] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] sm:flex-none'
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
                  ? 'h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none'
                  : 'h-[38px] flex-1 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(15, 143, 139,0.25)] sm:flex-none'
              }
            >
              التالي
            </button>
          </div>
        </div>

        <div className='h-4 sm:h-8' />
      </div>
    </>
  );
}
