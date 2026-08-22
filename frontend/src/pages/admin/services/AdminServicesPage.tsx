import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { AdminServicesContent } from '@/components/admin/services/AdminServicesContent';
import { AdminServicesHeader } from '@/components/admin/services/AdminServicesHeader';
import { AdminServicesToolbar } from '@/components/admin/services/AdminServicesToolbar';
import { UpsertServiceTypeDialog } from '@/components/admin/service-types';
import CreateServiceProviderDialog from '@/components/admin/service-providers/dialogs/CreateServiceProviderDialog';
import EditServiceProviderDialog from '@/components/admin/service-providers/dialogs/EditServiceProviderDialog';
import UpdateProviderStatusDialog from '@/components/admin/service-providers/dialogs/UpdateProviderStatusDialog';
import { ADMIN_SERVICES_PAGE_SIZE } from '@/components/admin/services/tabsConfig';
import {
  useServiceProvidersList,
  useServiceTypesList,
} from '@/hooks/admin/services/useAdminServices';
import type { ManagedServiceProvider, ProviderStatus } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

function resolveProviderLabel(provider: ManagedServiceProvider): string {
  if (provider.name?.trim()) return provider.name.trim();
  if (provider.city?.trim()) return provider.city.trim();
  return provider.id;
}

export default function AdminServicesPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [status, setStatus] = useState<'' | ProviderStatus>('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ManagedServiceProvider | null>(null);

  // Real Service Types catalog (`GET /api/service-types`) — tabs below are built
  // from this, not from a hardcoded facility-type list.
  const typesQuery = useServiceTypesList();
  const serviceTypes = typesQuery.data?.serviceTypes ?? [];

  const providersQuery = useServiceProvidersList({
    serviceType: selectedTypeId || undefined,
    status: status || undefined,
    q: debouncedSearch || undefined,
    page,
    limit: ADMIN_SERVICES_PAGE_SIZE,
  });

  const providers = providersQuery.data?.providers ?? [];
  const total = providersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_SERVICES_PAGE_SIZE));

  const handleSelectType = (typeId: string) => {
    setSelectedTypeId(typeId);
    setPage(1);
  };

  const handleStatusChange = (next: '' | ProviderStatus) => {
    setStatus(next);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const openEdit = (provider: ManagedServiceProvider) => {
    setSelectedProvider(provider);
    setEditOpen(true);
  };

  const openStatus = (provider: ManagedServiceProvider) => {
    setSelectedProvider(provider);
    setStatusOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>{tr('دليل الخدمات', 'Services directory')} • LMJ Health</title>
      </Helmet>

      <CreateServiceProviderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        serviceTypes={serviceTypes}
        onSuccess={() => providersQuery.refetch()}
      />
      <EditServiceProviderDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        providerId={selectedProvider?.id ?? null}
        onSuccess={() => providersQuery.refetch()}
      />
      {selectedProvider ? (
        <UpdateProviderStatusDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          providerId={selectedProvider.id}
          providerName={resolveProviderLabel(selectedProvider)}
          currentStatus={selectedProvider.status || 'draft'}
          isServiceTypeActive={selectedProvider.serviceType.isActive}
          onSuccess={() => providersQuery.refetch()}
        />
      ) : null}
      <UpsertServiceTypeDialog
        open={serviceTypeOpen}
        onOpenChange={setServiceTypeOpen}
      />

      <div dir={dir} lang={locale}>
        <AdminServicesHeader
          actionLabel={tr('إضافة مزود', 'Add provider')}
          actionIcon={<Plus className='h-4 w-4' />}
          onAction={() => setCreateOpen(true)}
        />

        <section className='mt-4 flex flex-col gap-3 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-5 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)] sm:flex-row sm:items-center sm:justify-between'>
          <div className='font-cairo text-[13px] font-extrabold text-[#0F766E]'>
            {tr(
              'هذه الشاشة تعرض مزوّدي الخدمة الحقيقيين (مخابر، صيدليات، مراكز أشعة...) حسب نوع الخدمة المُعرَّف له. المنشآت الصحية المرتبطة بالأطباء تُدار من شاشة «المنشآت» المستقلة.',
              'This screen browses real service providers (labs, pharmacies, imaging centers...) grouped by their service type. Doctor-linked medical facilities are managed from the separate Facilities screen.',
            )}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              onClick={() => setServiceTypeOpen(true)}
              className='inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#D6EEEC] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDF4]'
            >
              <Plus className='h-3.5 w-3.5' />
              {tr('نوع خدمة جديد', 'New service type')}
            </button>
            <Link
              to='/admin/service-types'
              className='inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#D6EEEC] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#0F766E] transition hover:bg-[#F0FDF4]'
            >
              {tr('إدارة أنواع الخدمات', 'Manage service types')}
              <ChevronLeft className='h-3.5 w-3.5' />
            </Link>
          </div>
        </section>

        <AdminServicesToolbar
          serviceTypes={serviceTypes}
          isLoadingTypes={typesQuery.isAwaitingData}
          selectedTypeId={selectedTypeId}
          onSelectType={handleSelectType}
          status={status}
          onStatusChange={handleStatusChange}
          searchInput={searchInput}
          onSearchChange={handleSearch}
          locale={locale}
        />

        <AdminServicesContent
          isAwaitingData={providersQuery.isAwaitingData}
          isError={providersQuery.isError}
          onRetry={() => void providersQuery.refetch()}
          providers={providers}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onEditProvider={openEdit}
          onChangeStatus={openStatus}
          locale={locale}
        />
      </div>
    </>
  );
}
