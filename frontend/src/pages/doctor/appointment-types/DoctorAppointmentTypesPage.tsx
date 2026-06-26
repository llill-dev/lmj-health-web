'use client';



import { BadgeDollarSign, CheckCircle, Eye, Plus, Tags } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Helmet } from 'react-helmet-async';

import {

  AppointmentTypeFormDialog,

  type AppointmentTypeFormValues,

} from '@/components/doctor/appointment-types/appointment-type-form-dialog';

import {

  AppointmentTypesTable,

} from '@/components/doctor/appointment-types/appointment-types-table';

import {

  AppointmentTypesToolbar,

  type AppointmentTypeStatusFilter,

} from '@/components/doctor/appointment-types/appointment-types-toolbar';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';

import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';

import { MedicalRecordsPagination } from '@/components/doctor/medical-records/medical-records-pagination';

import { DoctorListEmptyIllustration } from '@/components/doctor/shared/doctor-list-empty-illustration';

import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';

import {

  DoctorTableSkeleton,

  DoctorToolbarSkeleton,

} from '@/components/doctor/shared/skeletons';

import { useToast } from '@/components/ui/ToastProvider';

import {

  useAppointmentTypes,

  useCreateAppointmentType,

  useDeleteAppointmentType,

  useUpdateAppointmentType,

} from '@/hooks/doctor/appointments/useAppointmentTypes';

import { getUserFacingRequestErrorMessage } from '@/lib/api';

import type { AppointmentType } from '@/lib/doctor/types';

import { useRetryAction } from '@/lib/query/useRetryAction';



export default function DoctorAppointmentTypesPage() {

  const { toast } = useToast();

  const listQuery = useAppointmentTypes();

  const createType = useCreateAppointmentType();

  const updateType = useUpdateAppointmentType();

  const deleteType = useDeleteAppointmentType();

  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>

    listQuery.refetch(),

  );



  const [createOpen, setCreateOpen] = useState(false);

  const [editTarget, setEditTarget] = useState<AppointmentType | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AppointmentType | null>(null);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =

    useState<AppointmentTypeStatusFilter>('all');

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(8);



  const sortedTypes = useMemo(

    () =>

      [...listQuery.appointmentTypes].sort((a, b) =>

        (a.name ?? '').localeCompare(b.name ?? '', 'ar'),

      ),

    [listQuery.appointmentTypes],

  );



  const filteredTypes = useMemo(() => {

    let result = sortedTypes;



    if (statusFilter === 'active') {

      result = result.filter((type) => type.isActive !== false);

    } else if (statusFilter === 'inactive') {

      result = result.filter((type) => type.isActive === false);

    }



    const query = search.trim().toLowerCase();

    if (query) {

      result = result.filter((type) =>

        (type.name ?? '').toLowerCase().includes(query),

      );

    }



    return result;

  }, [search, sortedTypes, statusFilter]);



  const typeStats = useMemo(

    () => ({

      total: sortedTypes.length,

      active: sortedTypes.filter((type) => type.isActive !== false).length,

      visible: sortedTypes.filter((type) => type.priceVisibleToPatient).length,

      priced: sortedTypes.filter((type) => type.price != null).length,

    }),

    [sortedTypes],

  );



  const totalPages = Math.max(1, Math.ceil(filteredTypes.length / pageSize));

  const total = filteredTypes.length;



  const paginatedTypes = useMemo(

    () => filteredTypes.slice((page - 1) * pageSize, page * pageSize),

    [filteredTypes, page, pageSize],

  );



  useEffect(() => {

    setPage(1);

  }, [search, statusFilter, pageSize]);



  useEffect(() => {

    if (page > totalPages) setPage(totalPages);

  }, [page, totalPages]);



  const statsLoading = listQuery.isAwaitingData && !sortedTypes.length;



  const isTrulyEmpty =

    sortedTypes.length === 0 &&

    !listQuery.isAwaitingData &&

    !listQuery.error;



  const isFilteredEmpty =

    filteredTypes.length === 0 &&

    !listQuery.isAwaitingData &&

    !listQuery.error &&

    !isTrulyEmpty;



  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;

  const showingTo = Math.min(page * pageSize, total);



  const submitCreate = async (values: AppointmentTypeFormValues) => {

    try {

      await createType.createTypeAsync({

        name: values.name,

        price: values.price.trim() ? Number(values.price) : undefined,

        priceVisibleToPatient: values.priceVisibleToPatient,

        duration: 30,

      });

      toast('تم إنشاء نوع الموعد.', { variant: 'success' });

      setCreateOpen(false);

    } catch (error) {

      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });

    }

  };



  const submitEdit = async (values: AppointmentTypeFormValues) => {

    if (!editTarget?._id) return;

    try {

      await updateType.updateTypeAsync({

        typeId: editTarget._id,

        data: {

          name: values.name,

          price: values.price.trim() ? Number(values.price) : undefined,

          priceVisibleToPatient: values.priceVisibleToPatient,

          isActive: values.isActive,

        },

      });

      toast('تم تحديث نوع الموعد.', { variant: 'success' });

      setEditTarget(null);

    } catch (error) {

      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });

    }

  };



  const confirmDelete = async () => {

    if (!deleteTarget?._id) return;

    try {

      await deleteType.deleteTypeAsync(deleteTarget._id);

      toast('تم حذف نوع الموعد.', { variant: 'success' });

      setDeleteTarget(null);

    } catch (error) {

      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });

    }

  };



  return (

    <>

      <Helmet>

        <title>أنواع المواعيد • LMJ Health</title>

      </Helmet>



      <div dir="rtl" lang="ar" className="w-full pb-8 sm:pb-10">

        <DoctorDashboardOverview

          variant="appointments"

          surface="mint"

          kpiColumns={4}

          title="أنواع المواعيد"

          headerIcon={<Tags className="h-8 w-8 text-white" />}

          subtitle={

            <span>

              <span className="font-extrabold text-primary">

                {statsLoading ? '—' : typeStats.total}

              </span>

              <span className="text-primary/90">

                {' '}

                — إدارة أنواع المواعيد والأسعار المعروضة للمرضى

              </span>

            </span>

          }

          actionLabel="نوع جديد"

          actionIcon={<Plus className="h-4 w-4" />}

          onActionClick={() => setCreateOpen(true)}

          kpis={[

            {

              key: 'total',

              icon: <Tags className="h-5 w-5 shrink-0" />,

              value: statsLoading ? '—' : typeStats.total,

              label: 'إجمالي الأنواع',

            },

            {

              key: 'active',

              icon: <CheckCircle className="h-5 w-5 shrink-0" />,

              value: statsLoading ? '—' : typeStats.active,

              label: 'أنواع نشطة',

            },

            {

              key: 'visible',

              icon: <Eye className="h-5 w-5 shrink-0" />,

              value: statsLoading ? '—' : typeStats.visible,

              label: 'السعر مرئي',

            },

            {

              key: 'priced',

              icon: <BadgeDollarSign className="h-5 w-5 shrink-0" />,

              value: statsLoading ? '—' : typeStats.priced,

              label: 'بسعر محدد',

            },

          ]}

        />



        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">

          <AppointmentTypesToolbar

            search={search}

            onSearchChange={setSearch}

            onClear={() => {
              setSearch('');
              setStatusFilter('all');
            }}

            statusFilter={statusFilter}

            onStatusFilterChange={setStatusFilter}

          />



          <div className="mt-6">

            {listQuery.isAwaitingData && !sortedTypes.length ? (

              <div className="space-y-4">

                <DoctorToolbarSkeleton tabs={3} />

                <DoctorTableSkeleton rows={8} columns={5} />

              </div>

            ) : listQuery.error ? (

              <DoctorListErrorState

                title="تعذّر تحميل أنواع المواعيد"

                brief={getUserFacingRequestErrorMessage(listQuery.error)}

                retrying={retryingList}

                onRetry={() => void retryList()}

              />

            ) : isTrulyEmpty || isFilteredEmpty ? (

              <DoctorListEmptyIllustration

                variant="teal"

                imageSrc="/images/photo-not-found_appotemint.png"

                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"

                title={isFilteredEmpty ? "لا توجد أنواع تطابق البحث أو الفلتر الحالي" : "لا توجد أنواع مواعيد بعد"}

                subtitle={isFilteredEmpty ? "جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج" : "أنشئ أنواع المواعيد والأسعار المعروضة للمرضى عند الحجز"}

                actionLabel="نوع جديد"

                onAction={() => setCreateOpen(true)}

                actionIcon={<Plus className="h-4 w-4" />}

              />

            ) : (

              <AppointmentTypesTable

                types={paginatedTypes}

                onEdit={setEditTarget}

                onDelete={setDeleteTarget}

              />

            )}

          </div>

        </section>



        {!listQuery.isAwaitingData &&

        !listQuery.error &&

        filteredTypes.length > 0 ? (

          <div className="mt-5">

            <MedicalRecordsPagination

              page={page}

              totalPages={totalPages}

              showingFrom={showingFrom}

              showingTo={showingTo}

              total={total}

              pageSize={pageSize}

              itemLabel="نوع"

              onPageChange={setPage}

              onPageSizeChange={(size) => {

                setPageSize(size);

                setPage(1);

              }}

            />

          </div>

        ) : null}

      </div>



      <AppointmentTypeFormDialog

        open={createOpen}

        mode="create"

        busy={createType.isLoading}

        onClose={() => setCreateOpen(false)}

        onSubmit={submitCreate}

      />



      <AppointmentTypeFormDialog

        open={Boolean(editTarget)}

        mode="edit"

        initial={editTarget}

        busy={updateType.isLoading}

        onClose={() => setEditTarget(null)}

        onSubmit={submitEdit}

      />



      <ConfirmActionDialog

        open={Boolean(deleteTarget)}

        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}

        title="حذف نوع الموعد"

        description={`هل تريد حذف "${deleteTarget?.name ?? ''}"؟`}

        confirmLabel="حذف"

        confirmDisabled={deleteType.isLoading}

        onConfirm={() => void confirmDelete()}

      />

    </>

  );

}


