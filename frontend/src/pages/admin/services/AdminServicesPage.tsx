import { Helmet } from 'react-helmet-async';
import { Hospital } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AdminServicesContent } from '@/components/admin/services/AdminServicesContent';
import { AdminServicesHeader } from '@/components/admin/services/AdminServicesHeader';
import { AdminServicesToolbar } from '@/components/admin/services/AdminServicesToolbar';
import UpsertFacilityDialog from '@/components/admin/services/dialogs/UpsertFacilityDialog';
import DeleteFacilityDialog from '@/components/admin/services/dialogs/DeleteFacilityDialog';
import {
  ADMIN_SERVICES_PAGE_SIZE,
  ADMIN_SERVICES_TABS,
} from '@/components/admin/services/tabsConfig';
import {
  useFacilitiesList,
  useUpdateFacilityStatus,
  useServiceTypesList,
} from '@/hooks/useAdminServices';
import type { FacilitySummary, FacilityStatus } from '@/lib/admin/services/types';

export default function AdminServicesPage() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilitySummary | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilitySummary | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeTab = ADMIN_SERVICES_TABS[activeTabIdx];
  const isFacilityTab = activeTab.kind === 'facility';

  const facilitiesQuery = useFacilitiesList(
    isFacilityTab
      ? {
          facilityType: activeTab.type,
          q: debouncedSearch || undefined,
          page,
          limit: ADMIN_SERVICES_PAGE_SIZE,
        }
      : { page: 1, limit: 1 },
  );

  const serviceTypesQuery = useServiceTypesList();
  const statusMutation = useUpdateFacilityStatus();

  const facilities = facilitiesQuery.data?.facilities ?? [];
  const total = facilitiesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_SERVICES_PAGE_SIZE));

  const serviceTypesCount = serviceTypesQuery.data?.serviceTypes.length ?? 0;

  const handleTabChange = useCallback((idx: number) => {
    setActiveTabIdx(idx);
    setPage(1);
    setSearchInput('');
  }, []);

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

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

  const isLoading = isFacilityTab ? facilitiesQuery.isLoading : serviceTypesQuery.isLoading;
  const isError = isFacilityTab ? facilitiesQuery.isError : serviceTypesQuery.isError;
  const isFetching = isFacilityTab ? facilitiesQuery.isFetching : false;

  const facilityTabIcon = activeTab.kind === 'facility' ? activeTab.icon : Hospital;

  return (
    <>
      <Helmet>
        <title>دليل الخدمات • LMJ Health</title>
      </Helmet>

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
        <AdminServicesHeader showAddFacility={isFacilityTab} onAddFacility={handleAddNew} />

        <AdminServicesToolbar
          tabs={ADMIN_SERVICES_TABS}
          searchInput={searchInput}
          onSearchChange={handleSearch}
          searchDisabled={!isFacilityTab}
          isFetching={isFetching}
          activeTabIdx={activeTabIdx}
          onTabChange={handleTabChange}
          serviceTypesCount={serviceTypesCount}
        />

        <AdminServicesContent
          isLoading={isLoading}
          isError={isError}
          isFacilityTab={isFacilityTab}
          facilityTabIcon={facilityTabIcon}
          onRetry={() => {
            if (isFacilityTab) facilitiesQuery.refetch();
            else serviceTypesQuery.refetch();
          }}
          facilities={facilities}
          serviceTypes={serviceTypesQuery.data?.serviceTypes ?? []}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          togglingId={togglingId}
          onEditFacility={openEdit}
          onDeleteFacility={openDelete}
          onToggleFacilityStatus={handleToggleStatus}
        />
      </div>
    </>
  );
}
