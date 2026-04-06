import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft,
  Eye,
  Ban,
  Users,
  Mail,
  Phone,
  Activity,
} from 'lucide-react';
import { Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import SuspendAccountDialog from '@/components/admin/dialogs/SuspendAccountDialog';

import { useAdminPatients } from '@/hooks/useAdminPatients';
import type {
  AdminPatientsAccountStatusFilter,
  PatientAccountStatus,
} from '@/lib/admin/types';

const statusLabel: Record<PatientAccountStatus, string> = {
  active: 'نشط',
  temporary: 'مؤقت',
  suspended: 'معلق',
  locked: 'موقوف',
};

type AdminPatientsFiltersState = {
  account_status: AdminPatientsAccountStatusFilter;
  search: string;
  includeDeleted: boolean;
  page: number;
  limit: number;
};

export default function AdminPatientsPage() {
  const navigate = useNavigate();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [selectedPatientLabel, setSelectedPatientLabel] = useState('');

  const defaultFilters = useMemo<AdminPatientsFiltersState>(() => {
    return {
      account_status: 'all',
      search: '',
      includeDeleted: false,
      page: 1,
      limit: 20,
    };
  }, []);

  const [filters, setFilters] = useState<AdminPatientsFiltersState>({
    ...defaultFilters,
  });

  const { patients, results, total, isLoading, error } = useAdminPatients({
    account_status: filters.account_status,
    search: filters.search || undefined,
    includeDeleted: filters.includeDeleted,
    page: filters.page,
    limit: filters.limit,
  });

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.account_status !== defaultFilters.account_status ||
      Boolean(filters.search.trim()) ||
      filters.includeDeleted !== defaultFilters.includeDeleted ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit
    );
  }, [
    defaultFilters.account_status,
    defaultFilters.includeDeleted,
    defaultFilters.limit,
    defaultFilters.page,
    filters.account_status,
    filters.includeDeleted,
    filters.limit,
    filters.page,
    filters.search,
  ]);

  const statusTone = (s: PatientAccountStatus) => {
    if (s === 'active') {
      return {
        chip: 'bg-[#16A34A] text-white',
      };
    }
    if (s === 'temporary') {
      return {
        chip: 'bg-[#E0F2FE] text-[#0284C7]',
      };
    }
    if (s === 'suspended') {
      return {
        chip: 'bg-[#F59E0B] text-white',
      };
    }
    return {
      chip: 'bg-[#EF4444] text-white',
    };
  };

  return (
    <>
      <Helmet>
        <title>إدارة المرضى • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة المرضى
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة ومراقبة حسابات المرضى
            </div>
          </div>
        </div>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
              <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#98A2B3]'>
                <Filter className='h-4 w-4' />
              </div>

              <div className='relative'>
                <select
                  value={filters.account_status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      account_status:
                        (e.target.value as AdminPatientsAccountStatusFilter) ||
                        'all',
                      page: 1,
                    }))
                  }
                  className='h-[42px] w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15 lg:w-[180px]'
                >
                  <option value='all'>جميع الحالات</option>
                  <option value='active'>نشط</option>
                  <option value='temporary'>مؤقت</option>
                  <option value='suspended'>معلق</option>
                  <option value='locked'>موقوف</option>
                </select>
                <ChevronLeft className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-[-90deg] text-[#98A2B3]' />
              </div>

              <label className='flex h-[42px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]'>
                <input
                  type='checkbox'
                  checked={filters.includeDeleted}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      includeDeleted: e.target.checked,
                      page: 1,
                    }))
                  }
                  className='h-4 w-4 accent-primary'
                />
                إظهار المحذوفين
              </label>
            </div>

            <div className='relative flex-1'>
              <input
                placeholder='البحث بالاسم / الإيميل / الهاتف / رقم المريض...'
                className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
              />
              <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
            </div>

            <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end'>
              <button
                type='button'
                disabled={!hasActiveFilters}
                onClick={() => setFilters({ ...defaultFilters })}
                className={
                  !hasActiveFilters
                    ? 'inline-flex h-[42px] cursor-not-allowed items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]'
                    : 'inline-flex h-[42px] items-center justify-center rounded-[10px] border border-primary/25 bg-primary/10 px-4 font-cairo text-[12px] font-extrabold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/20'
                }
              >
                مسح الفلاتر
              </button>

              <div className='inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#667085]'>
                {results} نتيجة
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 space-y-5'>
          {isLoading ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              جارِ تحميل قائمة المرضى...
            </div>
          ) : error ? (
            <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 font-cairo text-[12px] font-semibold text-[#B42318] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              تعذّر تحميل قائمة المرضى.
            </div>
          ) : patients.length === 0 ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              لا توجد نتائج مطابقة.
            </div>
          ) : (
            patients.map((p) => {
              const tone = statusTone(p.user.accountStatus);
              return (
                <div
                  key={p._id}
                  className='overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
                >
                  <div className='flex'>
                    <div className='flex-1 px-6 py-5'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-3'>
                          <div className='flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-primary text-white'>
                            <Users className='h-6 w-6' />
                          </div>

                          <div className='text-right'>
                            <div className='font-cairo text-[16px] font-black leading-[20px] text-[#111827]'>
                              {p.user.fullName}
                            </div>
                            <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                              {p.publicId}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-start gap-3'>
                          <div
                            className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${tone.chip}`}
                          >
                            {statusLabel[p.user.accountStatus]}
                          </div>
                        </div>
                      </div>

                      <div className='mt-4 grid grid-cols-2 gap-x-10 gap-y-3'>
                        <div className='flex items-center justify-start gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <Phone className='h-4 w-4 text-primary' />
                          {p.user.phone ?? '—'}
                        </div>
                        <div className='flex items-center justify-start gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <Mail className='h-4 w-4 text-primary' />
                          {p.user.email ?? '—'}
                        </div>
                      </div>

                      <div className='flex items-end justify-between'>
                        <div className='mt-4 rounded-[10px] bg-[#F9FAFB] px-4 py-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#111827]'>
                              <Activity className='h-4 w-4 text-primary' />
                              حالة الحساب: {statusLabel[p.user.accountStatus]}
                            </div>
                          </div>
                        </div>
                        <div className='border-[#EEF2F6] bg-white px-5'>
                          <div className='flex gap-2'>
                            <button
                              type='button'
                              onClick={() =>
                                navigate(
                                  `/admin/patients/${encodeURIComponent(p._id)}`,
                                )
                              }
                              className='flex h-[34px] w-[150px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] font-cairo text-[12px] font-extrabold text-[#111827]'
                            >
                              <Eye className='h-4 w-4 text-[#667085]' />
                              عرض التفاصيل
                            </button>

                            <button
                              type='button'
                              onClick={() => {
                                setSelectedPatientId(p._id);
                                setSelectedPatientLabel(p.user.fullName);
                                setSuspendOpen(true);
                              }}
                              className='flex h-[34px] w-[150px] items-center justify-center gap-2 rounded-[10px] border border-[#FB923C] bg-white font-cairo text-[12px] font-extrabold text-[#F97316]'
                            >
                              <Ban className='h-4 w-4' />
                              تعليق الحساب
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className='mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-bold text-[#667085]'>
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                className='h-[36px] w-[110px] appearance-none rounded-[10px] border border-primary/25 bg-primary/10 px-4 text-right font-cairo text-[12px] font-extrabold text-primary outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
              >
                {[20, 50, 100].map((v) => (
                  <option
                    key={v}
                    value={v}
                  >
                    {v}
                  </option>
                ))}
              </select>
              <ChevronLeft className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-primary' />
            </div>

            <button
              type='button'
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60'
            >
              السابق
            </button>

            <button
              type='button'
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60'
            >
              التالي
            </button>
          </div>
        </section>

        <div className='h-8' />
      </div>

      <SuspendAccountDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        kind='patient'
        targetId={selectedPatientId}
        targetLabel={selectedPatientLabel}
      />
    </>
  );
}
