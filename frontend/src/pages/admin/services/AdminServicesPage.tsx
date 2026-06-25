import { Helmet } from 'react-helmet-async';
import { Hospital, Power } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { ConfirmActionDialog } from '@/components/admin/dialogs';
import { AdminServicesContent } from '@/components/admin/services/AdminServicesContent';
import { AdminServicesHeader } from '@/components/admin/services/AdminServicesHeader';
import { AdminServicesToolbar } from '@/components/admin/services/AdminServicesToolbar';
import DeleteFacilityDialog from '@/components/admin/services/dialogs/DeleteFacilityDialog';
import FacilityDoctorsDialog from '@/components/admin/services/dialogs/FacilityDoctorsDialog';
import UpsertFacilityDialog from '@/components/admin/services/dialogs/UpsertFacilityDialog';
import UpsertServiceTypeDialog from '@/components/admin/services/dialogs/UpsertServiceTypeDialog';
import {
  ADMIN_SERVICES_PAGE_SIZE,
  ADMIN_SERVICES_TABS,
} from '@/components/admin/services/tabsConfig';
import {
  useFacilitiesList,
  useServiceTypesList,
  useUpdateFacilityStatus,
} from '@/hooks/admin/useAdminServices';
import type { FacilitiesListParams, FacilityStatus, FacilitySummary } from '@/lib/admin/types';

export default function AdminServicesPage() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);
  const [facilityFilters, setFacilityFilters] = useState<
    Pick<
      FacilitiesListParams,
      'status' | 'hasDoctors' | 'attribute' | 'ownerDoctorId' | 'sortBy' | 'sortOrder'
    >
  >({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilitySummary | null>(null);
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilitySummary | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusToggleTarget, setStatusToggleTarget] = useState<FacilitySummary | null>(null);
  const [doctorsDialogOpen, setDoctorsDialogOpen] = useState(false);
  const [doctorsFacility, setDoctorsFacility] = useState<FacilitySummary | null>(null);

  const activeTab = ADMIN_SERVICES_TABS[activeTabIdx];
  const isFacilityTab = activeTab.kind === 'facility';

  const facilitiesQuery = useFacilitiesList(
    isFacilityTab
      ? {
          facilityType: activeTab.type,
          q: debouncedSearch || undefined,
          page,
          limit: ADMIN_SERVICES_PAGE_SIZE,
          ...facilityFilters,
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

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleToggleStatus = async (facility: FacilitySummary) => {
    setTogglingId(facility.id);
    const newStatus: FacilityStatus = facility.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await statusMutation.mutateAsync({ id: facility.id, status: newStatus });
    } finally {
      setTogglingId(null);
      setStatusToggleTarget(null);
    }
  };

  const willActivate = statusToggleTarget?.status === 'INACTIVE';

  const openEdit = (facility: FacilitySummary) => {
    setEditTarget(facility);
    setUpsertOpen(true);
  };

  const openDelete = (facility: FacilitySummary) => {
    setDeleteTarget(facility);
    setDeleteOpen(true);
  };

  const handleAddNew = () => {
    if (isFacilityTab) {
      setEditTarget(null);
      setUpsertOpen(true);
      return;
    }
    setServiceTypeOpen(true);
  };

  const isAwaitingData = isFacilityTab
    ? facilitiesQuery.isAwaitingData
    : serviceTypesQuery.isAwaitingData;
  const isError = isFacilityTab ? facilitiesQuery.isError : serviceTypesQuery.isError;
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
      <UpsertServiceTypeDialog
        open={serviceTypeOpen}
        onOpenChange={setServiceTypeOpen}
      />
      <DeleteFacilityDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        facility={deleteTarget}
      />
      <FacilityDoctorsDialog
        open={doctorsDialogOpen}
        onOpenChange={setDoctorsDialogOpen}
        facility={doctorsFacility}
      />

      <ConfirmActionDialog
        open={statusToggleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusToggleTarget(null);
        }}
        variant={willActivate ? 'primary' : 'destructive'}
        title={willActivate ? 'تفعيل المنشأة الصحية؟' : 'تعطيل المنشأة الصحية؟'}
        icon={<Power className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description={
          statusToggleTarget ? (
            <>
              المنشأة: «
              <span className='font-extrabold text-[#344054]'>{statusToggleTarget.name}</span>
              ».{' '}
              {willActivate
                ? 'ستعود للظهور في لوائح الإدارة والربط.'
                : 'سيتم تعطيلها حتى يعاد تفعيلها من جديد.'}
            </>
          ) : (
            '—'
          )
        }
        confirmLabel={willActivate ? 'تفعيل' : 'تعطيل'}
        confirmDisabled={statusMutation.isPending}
        onConfirm={async () => {
          if (statusToggleTarget) await handleToggleStatus(statusToggleTarget);
        }}
        successToast={
          willActivate
            ? {
                title: 'تم التفعيل',
                message: 'أصبحت المنشأة متاحة من جديد.',
                variant: 'success',
              }
            : {
                title: 'تم التعطيل',
                message: 'تم إخفاء المنشأة حتى يعاد تفعيلها.',
                variant: 'info',
              }
        }
      />

      <div dir='rtl' lang='ar'>
        <AdminServicesHeader
          actionLabel={isFacilityTab ? 'إضافة منشأة' : 'إضافة نوع خدمة'}
          onAction={handleAddNew}
        />

        <AdminServicesToolbar
          tabs={ADMIN_SERVICES_TABS}
          searchInput={searchInput}
          onSearchChange={handleSearch}
          searchDisabled={!isFacilityTab}
          activeTabIdx={activeTabIdx}
          onTabChange={handleTabChange}
          serviceTypesCount={serviceTypesCount}
          facilityFilters={facilityFilters}
          onFacilityFiltersChange={(next) => {
            setFacilityFilters(next);
            setPage(1);
          }}
        />

        <AdminServicesContent
          isAwaitingData={isAwaitingData}
          isError={isError}
          isFacilityTab={isFacilityTab}
          facilityTabIcon={facilityTabIcon}
          onRetry={() => {
            if (isFacilityTab) {
              void facilitiesQuery.refetch();
              return;
            }
            void serviceTypesQuery.refetch();
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
          onToggleFacilityStatus={(facility) => setStatusToggleTarget(facility)}
          onViewFacilityDoctors={(facility) => {
            setDoctorsFacility(facility);
            setDoctorsDialogOpen(true);
          }}
        />
      </div>
    </>
  );
}
