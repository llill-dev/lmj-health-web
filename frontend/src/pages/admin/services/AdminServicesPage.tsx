import { Helmet } from 'react-helmet-async';
import {
  Building2,
  ClipboardList,
  FlaskConical,
  Hospital,
  Phone,
  Search,
  Stethoscope,
  MapPin,
  Pill,
  X,
  Pencil,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ToggleRight,
  ToggleLeft,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import UpsertFacilityDialog from '@/components/admin/services/dialogs/UpsertFacilityDialog';
import DeleteFacilityDialog from '@/components/admin/services/dialogs/DeleteFacilityDialog';
import {
  useFacilitiesList,
  useUpdateFacilityStatus,
  useServiceTypesList,
} from '@/hooks/useAdminServices';
import type {
  FacilitySummary,
  FacilityType,
  FacilityStatus,
  ServiceType,
} from '@/lib/admin/services/types';
import { resolveLabel } from '@/lib/admin/services/types';

// ─────────────────────────────────────────────────────────────────────────────
// Tab configuration
// ─────────────────────────────────────────────────────────────────────────────

type Tab =
  | { kind: 'facility'; type: FacilityType; label: string; icon: React.ElementType }
  | { kind: 'service-types'; label: string; icon: React.ElementType };

const TABS: Tab[] = [
  { kind: 'facility', type: 'hospital',       label: 'المشافي',       icon: Hospital },
  { kind: 'facility', type: 'laboratory',     label: 'المخابر',       icon: FlaskConical },
  { kind: 'facility', type: 'pharmacy',       label: 'الصيدليات',     icon: Pill },
  { kind: 'facility', type: 'imaging_center', label: 'مراكز الأشعة', icon: Building2 },
  { kind: 'service-types',                    label: 'التخصصات',     icon: Stethoscope },
];

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FacilityStatus }) {
  const map: Record<FacilityStatus, { label: string; cls: string }> = {
    ACTIVE:   { label: 'نشط',      cls: 'bg-emerald-50 text-emerald-700' },
    PENDING:  { label: 'معلّق',    cls: 'bg-amber-50 text-amber-700' },
    INACTIVE: { label: 'غير نشط', cls: 'bg-gray-100 text-gray-500' },
    DELETED:  { label: 'محذوف',   cls: 'bg-red-50 text-red-600' },
  };
  const { label, cls } = map[status] ?? map.INACTIVE;
  return (
    <span className={`inline-flex items-center rounded-[6px] px-2 py-0.5 font-cairo text-[11px] font-extrabold ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Facility card
// ─────────────────────────────────────────────────────────────────────────────

function FacilityCard({
  facility,
  tabIcon: TabIcon,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
}: {
  facility: FacilitySummary;
  tabIcon: React.ElementType;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isToggling: boolean;
}) {
  const isActive = facility.status === 'ACTIVE';

  return (
    <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_16px_32px_rgba(0,0,0,0.09)]'>
      <div className='flex items-start justify-between'>
        {/* Left: info */}
        <div className='flex items-start gap-4'>
          <div className='flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'>
            <TabIcon className='h-5 w-5' />
          </div>
          <div className='text-right'>
            <div className='flex items-center gap-2'>
              <span className='font-cairo text-[16px] font-black text-[#111827]'>
                {facility.name}
              </span>
              <StatusBadge status={facility.status} />
            </div>

            <div className='mt-2 flex flex-wrap items-center justify-start gap-5 font-cairo text-[12px] font-bold text-[#98A2B3]'>
              <div className='inline-flex items-center gap-1.5'>
                <MapPin className='h-3.5 w-3.5 text-primary' />
                {facility.city}
                {facility.country ? ` · ${facility.country}` : ''}
              </div>
              {facility.phone && (
                <div className='inline-flex items-center gap-1.5' dir='ltr'>
                  <Phone className='h-3.5 w-3.5 text-primary' />
                  {facility.phone}
                </div>
              )}
              {facility.doctorCount > 0 && (
                <div className='inline-flex items-center gap-1.5'>
                  <Stethoscope className='h-3.5 w-3.5 text-primary' />
                  {facility.doctorCount} طبيب
                </div>
              )}
            </div>

            {facility.description && (
              <p className='mt-2 max-w-[480px] font-cairo text-[12px] font-semibold leading-[18px] text-[#6B7280]'>
                {facility.description}
              </p>
            )}

            {facility.attributes.length > 0 && (
              <div className='mt-3 flex flex-wrap items-center justify-start gap-2'>
                {facility.attributes.map((attr) => (
                  <span
                    key={attr}
                    className='inline-flex h-[22px] items-center rounded-[6px] bg-[#E7FBFA] px-2.5 font-cairo text-[11px] font-extrabold text-primary'
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className='flex shrink-0 items-center gap-2 pt-1'>
          {/* Toggle active/inactive */}
          <button
            type='button'
            title={isActive ? 'تعطيل' : 'تفعيل'}
            onClick={onToggleStatus}
            disabled={isToggling || facility.status === 'DELETED'}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
          >
            {isToggling ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : isActive ? (
              <ToggleRight className='h-4 w-4' />
            ) : (
              <ToggleLeft className='h-4 w-4' />
            )}
          </button>

          {/* Edit */}
          <button
            type='button'
            title='تعديل'
            onClick={onEdit}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#D1FAE5] bg-white text-primary transition hover:bg-[#E7FBFA]'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>

          {/* Delete */}
          <button
            type='button'
            title='حذف'
            onClick={onDelete}
            className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#FEE2E2] bg-white text-[#EF4444] transition hover:bg-[#FEF2F2]'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service type card (for "التخصصات" tab)
// ─────────────────────────────────────────────────────────────────────────────

function ServiceTypeCard({ st }: { st: ServiceType }) {
  const nameAr = resolveLabel(st.name, 'ar');
  const nameEn = resolveLabel(st.name, 'en');
  return (
    <div className='flex items-start justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='flex items-start gap-4'>
        <div className='flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDF4] text-emerald-600'>
          <Layers className='h-5 w-5' />
        </div>
        <div className='text-right'>
          <div className='flex items-center gap-2'>
            <span className='font-cairo text-[15px] font-black text-[#111827]'>{nameAr || nameEn}</span>
            {nameAr && nameEn && <span className='font-cairo text-[12px] text-[#98A2B3]'>({nameEn})</span>}
            <span
              className={`inline-flex items-center rounded-[6px] px-2 py-0.5 font-cairo text-[11px] font-extrabold ${
                st.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {st.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            <span dir='ltr'>{st.slug}</span>
            {' · '}نسخة المخطط: {st.schemaVersion}
            {' · '}{st.fields.length} حقل
          </div>
          {st.fields.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {st.fields.map((f) => (
                <span
                  key={f.key}
                  className='inline-flex items-center gap-1 rounded-[5px] border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 font-cairo text-[11px] font-bold text-[#344054]'
                >
                  <span dir='ltr'>{f.key}</span>
                  <span className='text-[#98A2B3]'>{f.type}</span>
                  {f.required && <span className='text-red-400'>*</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-12 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='mx-auto mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F2F4F7]'>
        <ClipboardList className='h-6 w-6 text-[#98A2B3]' />
      </div>
      <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>لا توجد عناصر</div>
      <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>{message}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className='mt-6 flex items-center justify-center gap-2'>
      <button
        type='button'
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className='flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
      >
        <ChevronRight className='h-4 w-4' />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type='button'
          onClick={() => onPage(p)}
          className={
            p === page
              ? 'h-[34px] min-w-[34px] rounded-[8px] bg-primary px-3 font-cairo text-[13px] font-extrabold text-white'
              : 'h-[34px] min-w-[34px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px] font-bold text-[#667085]'
          }
        >
          {p}
        </button>
      ))}
      <button
        type='button'
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className='flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
      >
        <ChevronLeft className='h-4 w-4' />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function AdminServicesPage() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  // Dialogs
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilitySummary | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilitySummary | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeTab = TABS[activeTabIdx];
  const isFacilityTab = activeTab.kind === 'facility';

  // Data hooks
  const facilitiesQuery = useFacilitiesList(
    isFacilityTab
      ? {
          facilityType: activeTab.type,
          q: debouncedSearch || undefined,
          page,
          limit: PAGE_SIZE,
        }
      : { page: 1, limit: 1 }, // don't fetch when on service-types tab
  );

  const serviceTypesQuery = useServiceTypesList();
  const statusMutation = useUpdateFacilityStatus();

  const facilities = facilitiesQuery.data?.facilities ?? [];
  const total = facilitiesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Tab counts
  const facilityCount = isFacilityTab ? (facilitiesQuery.data?.total ?? 0) : 0;
  const serviceTypesCount = serviceTypesQuery.data?.serviceTypes.length ?? 0;

  // Reset page when search / tab changes
  const handleTabChange = useCallback((idx: number) => {
    setActiveTabIdx(idx);
    setPage(1);
    setSearchInput('');
  }, []);

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  // Toggle status
  const handleToggleStatus = async (facility: FacilitySummary) => {
    setTogglingId(facility.id);
    const newStatus: FacilityStatus =
      facility.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await statusMutation.mutateAsync({ id: facility.id, status: newStatus });
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (f: FacilitySummary) => {
    setEditTarget(f);
    setUpsertOpen(true);
  };

  const openDelete = (f: FacilitySummary) => {
    setDeleteTarget(f);
    setDeleteOpen(true);
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setUpsertOpen(true);
  };

  const isLoading = isFacilityTab
    ? facilitiesQuery.isLoading
    : serviceTypesQuery.isLoading;

  const isError = isFacilityTab
    ? facilitiesQuery.isError
    : serviceTypesQuery.isError;

  const isFetching = isFacilityTab ? facilitiesQuery.isFetching : false;

  return (
    <>
      <Helmet>
        <title>دليل الخدمات • LMJ Health</title>
      </Helmet>

      {/* Dialogs */}
      <UpsertFacilityDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        editTarget={editTarget}
      />
      <DeleteFacilityDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        facility={deleteTarget}
      />

      <div dir='rtl' lang='ar'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <h1 className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة دليل الخدمات
            </h1>
            <p className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة المنشآت الصحية وأنواع الخدمات المتاحة للمرضى
            </p>
          </div>

          {isFacilityTab && (
            <button
              type='button'
              onClick={handleAddNew}
              className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
            >
              <ClipboardList className='h-4 w-4' />
              إضافة منشأة
            </button>
          )}
        </div>

        {/* Search + Tabs bar */}
        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            {/* Search */}
            <div className='relative min-w-[180px] flex-1'>
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder='ابحث عن منشأة...'
                disabled={!isFacilityTab}
                className='h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-primary disabled:opacity-50'
              />
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                {isFetching ? (
                  <Loader2 className='h-4 w-4 animate-spin text-primary' />
                ) : (
                  <Search className='h-4 w-4' />
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className='flex flex-wrap items-center gap-2'>
              {TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const active = activeTabIdx === idx;
                const count =
                  tab.kind === 'service-types' ? serviceTypesCount : 0;

                return (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => handleTabChange(idx)}
                    className={
                      active
                        ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                        : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] hover:border-primary/40'
                    }
                  >
                    <Icon className={active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-[#667085]'} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className='inline-flex min-w-[20px] items-center justify-center rounded-[6px] bg-white/20 px-1.5 font-cairo text-[10px] font-black'>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className='mt-6 space-y-4'>
          {/* Loading */}
          {isLoading && (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className='flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-white py-12 text-center'>
              <AlertCircle className='h-8 w-8 text-[#F04438]' />
              <p className='font-cairo text-[14px] font-bold text-[#F04438]'>
                حدث خطأ أثناء تحميل البيانات
              </p>
              <button
                type='button'
                onClick={() => {
                  if (isFacilityTab) facilitiesQuery.refetch();
                  else serviceTypesQuery.refetch();
                }}
                className='inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-[#667085]'
              >
                <RefreshCw className='h-4 w-4' />
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Facilities list */}
          {!isLoading && !isError && isFacilityTab && (
            <>
              {facilities.length === 0 ? (
                <EmptyState message='لا توجد منشآت لهذا النوع. أضف منشأة جديدة من الزر أعلاه.' />
              ) : (
                facilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    tabIcon={activeTab.icon}
                    onEdit={() => openEdit(facility)}
                    onDelete={() => openDelete(facility)}
                    onToggleStatus={() => handleToggleStatus(facility)}
                    isToggling={togglingId === facility.id}
                  />
                ))
              )}

              {/* Stats + pagination */}
              {total > 0 && (
                <div className='flex items-center justify-between pt-2'>
                  <p className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} من {total} منشأة
                  </p>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} />
                </div>
              )}
            </>
          )}

          {/* Service types list */}
          {!isLoading && !isError && !isFacilityTab && (
            <>
              {(serviceTypesQuery.data?.serviceTypes ?? []).length === 0 ? (
                <EmptyState message='لا توجد أنواع خدمات مُعرَّفة بعد.' />
              ) : (
                (serviceTypesQuery.data?.serviceTypes ?? []).map((st) => (
                  <ServiceTypeCard key={st._id} st={st} />
                ))
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
