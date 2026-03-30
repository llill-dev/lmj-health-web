import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2,
  Clock,
  Ban,
  Stethoscope,
  Mail,
  Phone,
  BadgeCheck,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAdminDoctors } from '@/hooks/useAdminDoctors';
import type { AdminDoctorApprovalStatus } from '@/lib/admin/types';

export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  const [filtersResetSignal, setFiltersResetSignal] = useState(0);
  const defaultFilters = {
    search: '',
    specialization: '',
    status: '' as AdminDoctorApprovalStatus | '',
    city: '',
    country: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  };

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
    ...defaultFilters,
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

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.search) ||
      Boolean(filters.specialization) ||
      Boolean(filters.status) ||
      Boolean(filters.city) ||
      Boolean(filters.country) ||
      Boolean(filters.from) ||
      Boolean(filters.to) ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit
    );
  }, [
    defaultFilters.limit,
    defaultFilters.page,
    filters.city,
    filters.country,
    filters.from,
    filters.limit,
    filters.page,
    filters.search,
    filters.specialization,
    filters.status,
    filters.to,
  ]);

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
          resetSignal={filtersResetSignal}
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
          filtersTrailing={
            <button
              type='button'
              disabled={!hasActiveFilters}
              onClick={() => {
                setFilters(defaultFilters);
                setFiltersResetSignal((s) => s + 1);
              }}
              className={
                !hasActiveFilters
                  ? 'h-[42px] cursor-not-allowed rounded-[10px] border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]'
                  : 'h-[42px] rounded-[10px] border border-primary/25 bg-primary/10 px-4 font-cairo text-[12px] font-extrabold text-primary transition-colors hover:bg-primary/15'
              }
            >
              <span className='inline-flex items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4' />
                مسح الفلاتر
              </span>
            </button>
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

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex items-center gap-2'>
              <BadgeCheck className='h-4 w-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                قائمة الأطباء ({results})
              </div>
            </div>
          </div>

          <div className='space-y-4 p-6'>
            {isLoading ? (
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                جاري تحميل قائمة الأطباء...
              </div>
            ) : error ? (
              <div className='font-cairo text-[12px] font-semibold text-[#B42318]'>
                فشل تحميل قائمة الأطباء
              </div>
            ) : doctors.length === 0 ? (
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                لا يوجد أطباء مطابقون لخيارات البحث.
              </div>
            ) : (
              doctors.map((d) => (
                <div
                  key={d._id}
                  className='rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden'
                >
                  <div className='flex'>
                    <div className='flex-1 px-5 py-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-2'>
                          <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-[18px] font-bold text-white'>
                            {(d.user?.fullName ?? 'د').charAt(0)}
                          </div>
                          <div className='text-right'>
                            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                              {d.user?.fullName ?? '—'}
                            </div>
                            <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                              {d.specialization ?? '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex mt-5 justify-between'>
                        <div className='flex flex-wrap items-center gap-4 text-[#98A2B3]'>
                          <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                            <BadgeCheck className='h-4 w-4 text-primary' />
                            {d.medicalLicenseNumber ?? '—'}
                          </div>
                          <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                            <Mail className='h-4 w-4 text-primary' />
                            {d.user?.email ?? '—'}
                          </div>
                          <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                            <Phone className='h-4 w-4 text-primary' />
                            {d.user?.phone ?? '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() =>
                        navigate(`/admin/doctors/${encodeURIComponent(d._id)}`)
                      }
                      className='flex w-[54px] shrink-0 items-center justify-center bg-primary text-white'
                      aria-label='فتح ملف الطبيب'
                    >
                      <ChevronLeft className='h-5 w-5' />
                    </button>
                  </div>
                </div>
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
                className='h-[38px] w-[130px] appearance-none rounded-[10px] border border-primary/25 bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/25'
              >
                <option value={20}>20 / صفحة</option>
                <option value={50}>50 / صفحة</option>
                <option value={100}>100 / صفحة</option>
              </select>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary'>
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
