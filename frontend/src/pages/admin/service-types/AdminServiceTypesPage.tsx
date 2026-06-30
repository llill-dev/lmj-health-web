import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { Settings, Plus, Edit, Check, Loader2, Building2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import {
  useServiceTypesList,
  useMutateServiceType,
} from '@/hooks/admin/services/useAdminServices';
import type { ServiceType } from '@/lib/admin/types';
import { resolveLabel } from '@/lib/admin/types';
import {
  UpsertServiceTypeDialog,
  ServiceTypeStatusConfirmDialog,
  ServiceTypeActiveToggle,
} from '@/components/admin/service-types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';

type ServiceTypeStatusFilter = 'all' | 'active' | 'inactive';

export default function AdminServiceTypesPage() {
  const { toast } = useToast();
  const { data, isAwaitingData, isError, error, refetch } = useServiceTypesList();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceTypeStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ServiceType | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate'>(
    'deactivate',
  );
  const updateMut = useMutateServiceType();

  const serviceTypes = data?.serviceTypes ?? [];
  const filteredServiceTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return serviceTypes.filter((serviceType) => {
      const isActive = serviceType.isActive !== false;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? isActive
            : !isActive;
      if (!matchesStatus) return false;
      if (!q) return true;

      const title = resolveLabel(
        typeof serviceType.name === 'string'
          ? { en: serviceType.name, ar: serviceType.name }
          : serviceType.name,
        'ar',
      );

      return [title, serviceType.slug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [search, serviceTypes, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredServiceTypes.length / Math.max(pageSize, 1)));
  const currentPage = Math.min(page, totalPages);
  const visibleServiceTypes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServiceTypes.slice(start, start + pageSize);
  }, [currentPage, filteredServiceTypes, pageSize]);
  const rangeStart = filteredServiceTypes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    filteredServiceTypes.length === 0
      ? 0
      : Math.min(currentPage * pageSize, filteredServiceTypes.length);

  function openCreate() {
    setEditTarget(null);
    setUpsertOpen(true);
  }

  function openEdit(s: ServiceType) {
    setEditTarget(s);
    setUpsertOpen(true);
  }

  function openDeactivateConfirm(s: ServiceType) {
    setConfirmTarget(s);
    setConfirmAction('deactivate');
    setConfirmOpen(true);
  }

  function openActivateConfirm(s: ServiceType) {
    setConfirmTarget(s);
    setConfirmAction('activate');
    setConfirmOpen(true);
  }

  async function handleStatusConfirm() {
    if (!confirmTarget) return;
    const next = confirmAction === 'activate';
    const label = resolveLabel(
      typeof confirmTarget.name === 'string'
        ? { en: confirmTarget.name, ar: confirmTarget.name }
        : confirmTarget.name,
      'ar',
    );
    await updateMut.mutateAsync({
      id: confirmTarget._id,
      body: { isActive: next },
    });
    if (next) {
      toast(
        `تم تفعيل نوع الخدمة «${label}». سيظهر في القوائم المرتبطة عند اكتمال المزامنة.`,
        { title: 'تم التفعيل', variant: 'success', durationMs: 3800 },
      );
    } else {
      toast(
        `عُطّل نوع الخدمة «${label}». لن يُقترح للمستخدمين حتى تُعيد تفعيله.`,
        { title: 'تم التعطيل', variant: 'info', durationMs: 4000 },
      );
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
  }

  return (
    <>
      <Helmet>
        <title>أنواع الخدمات • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='أنواع الخدمات'
          subtitle='إدارة أنواع الخدمات والـ schema الديناميكي'
          headerIcon={<Settings className='h-8 w-8 text-white' />}
          actionLabel='إضافة نوع خدمة'
          onActionClick={openCreate}
          kpis={[
            {
              key: 'total',
              icon: <Settings className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : filteredServiceTypes.length,
              label: 'أنواع مسجّلة',
            },
          ]}
        />

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]'>
            <div className='relative'>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder='ابحث باسم النوع أو الـ slug...'
                className='h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-11 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]'
              />
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ServiceTypeStatusFilter);
                setPage(1);
              }}
              className='h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary'
            >
              <option value='all'>كل الحالات</option>
              <option value='active'>الأنواع النشطة</option>
              <option value='inactive'>الأنواع المعطلة</option>
            </select>
          </div>
        </section>

        {isAwaitingData && (
          <div className='mt-8 flex items-center justify-center gap-2 rounded-[12px] border border-[#EEF2F6] bg-white py-16 font-cairo text-[14px] font-semibold text-[#667085]'>
            <Loader2 className='h-5 w-5 shrink-0 animate-spin text-primary' />
            جاري التحميل…
          </div>
        )}

        {isError && (
          <div className='mt-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-right'>
            <p className='font-cairo text-[13px] font-bold text-red-800'>
              تعذر تحميل الأنواع.
            </p>
            <p className='mt-1 font-cairo text-[12px] text-red-700'>
              {userFacingErrorMessage(error, '—')}
            </p>
            <button
              type='button'
              onClick={() => void refetch()}
              className='mt-2 font-cairo text-[12px] font-extrabold text-primary underline'
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!isAwaitingData && !isError && (
          <section className='mt-6 overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            {filteredServiceTypes.length === 0 ? (
              <p className='px-6 py-12 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]'>
                لا توجد أنواع خدمات بعد. استخدم «إضافة نوع خدمة».
              </p>
            ) : (
              <div className='divide-y divide-[#EEF2F6]'>
                {visibleServiceTypes.map((s) => {
                  const title = resolveLabel(
                    typeof s.name === 'string'
                      ? { en: s.name, ar: s.name }
                      : s.name,
                    'ar',
                  );
                  const nFields = s.fields?.length ?? 0;
                  return (
                    <div
                      key={s._id}
                      className='flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6'
                    >
                      <div className='min-w-0 flex-1 text-right'>
                        <div className='flex items-start gap-2 sm:items-center'>
                          <button
                            type='button'
                            onClick={() => openEdit(s)}
                            className='mt-0.5 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)] transition hover:brightness-105'
                            aria-label='الحقول'
                          >
                            <Settings className='h-5 w-5' />
                          </button>
                          <div className='min-w-0'>
                            <div className='font-cairo text-[14px] font-black text-[#111827]'>
                              {title || '—'}
                            </div>
                            <div className='mt-2 break-all font-cairo text-[12px] font-bold text-[#98A2B3]'>
                              <span dir='ltr' className='inline text-[#0F8F8B]'>
                                {s.slug}
                              </span>
                              <span className='mx-2'>•</span>
                              {nFields} حقل
                              <span className='mx-2'>•</span>
                              v{s.schemaVersion ?? '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/*
                        ترتيب DOM في RTL: التعديل يظهر يمين المجموعة، التوغل أقصى يسار الصف
                        (قرب منتصف السطر) كما في التصميم المرفوع
                      */}
                      <div className='flex items-center justify-end gap-2 sm:gap-3'>
                        <Link
                          to={`/admin/service-providers?type=${encodeURIComponent(s.slug)}`}
                          className='inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#CFFAFE] bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#ECFEFF]'
                        >
                          <Building2 className='h-4 w-4' />
                          المزودون
                        </Link>
                        <button
                          type='button'
                          onClick={() => openEdit(s)}
                          className='flex h-9 w-9 items-center justify-center rounded-[10px] text-primary transition hover:bg-[#E7FBFA]'
                          aria-label='تعديل'
                        >
                          <Edit className='h-4 w-4' />
                        </button>
                        <ServiceTypeActiveToggle
                          isActive={s.isActive}
                          disabled={updateMut.isPending}
                          onRequestToggle={() =>
                            s.isActive
                              ? openDeactivateConfirm(s)
                              : openActivateConfirm(s)
                          }
                        />
                        {s.isActive ? (
                          <span className='ms-1 inline-flex h-[24px] items-center gap-1.5 rounded-[10px] bg-[#DCFCE7] px-3 font-cairo text-[12px] font-extrabold text-[#16A34A]'>
                            <Check className='h-4 w-4' />
                            نشط
                          </span>
                        ) : (
                          <span className='ms-1 inline-flex h-[24px] items-center gap-1.5 rounded-[10px] bg-[#F3F4F6] px-3 font-cairo text-[12px] font-extrabold text-[#6B7280]'>
                            معطّل
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!isAwaitingData && !isError && filteredServiceTypes.length > 0 && (
          <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                عرض {rangeStart.toLocaleString('ar-SA')}–{rangeEnd.toLocaleString('ar-SA')} من{' '}
                {filteredServiceTypes.length.toLocaleString('ar-SA')} نوع · صفحة{' '}
                {currentPage.toLocaleString('ar-SA')} / {totalPages.toLocaleString('ar-SA')}
              </div>

              <div className='flex flex-wrap items-center justify-end gap-3'>
                <select
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) || 10);
                    setPage(1);
                  }}
                  className='h-[36px] rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827]'
                >
                  {[10, 20, 50].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <button
                  type='button'
                  onClick={() => {
                    if (currentPage > 1) setPage((prev) => prev - 1);
                  }}
                  disabled={currentPage <= 1}
                  className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  السابق
                </button>

                <button
                  type='button'
                  onClick={() => {
                    if (currentPage < totalPages) setPage((prev) => prev + 1);
                  }}
                  disabled={currentPage >= totalPages}
                  className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  التالي
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <UpsertServiceTypeDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        editTarget={editTarget}
        onSuccess={() => void refetch()}
      />

      <ServiceTypeStatusConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setConfirmTarget(null);
        }}
        serviceType={confirmTarget}
        action={confirmAction}
        onConfirm={handleStatusConfirm}
        isPending={updateMut.isPending}
      />
    </>
  );
}
