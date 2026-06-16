'use client';

import { Plus, Tags } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AppointmentTypeFormDialog,
  type AppointmentTypeFormValues,
} from '@/components/doctor/appointment-types/appointment-type-form-dialog';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorTableSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useAppointmentTypes,
  useCreateAppointmentType,
  useDeleteAppointmentType,
  useUpdateAppointmentType,
} from '@/hooks/doctor/useAppointmentTypes';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
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

  const sortedTypes = useMemo(
    () =>
      [...listQuery.appointmentTypes].sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'ar'),
      ),
    [listQuery.appointmentTypes],
  );

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

      <div dir="rtl" lang="ar" className="w-full pb-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="font-cairo text-[28px] font-black text-[#111827]">
              أنواع المواعيد
            </h1>
            <p className="mt-2 font-cairo text-[14px] font-semibold text-[#667085]">
              إدارة أنواع المواعيد والأسعار المعروضة للمرضى.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[13px] font-extrabold text-white"
          >
            <Plus className="h-4 w-4" />
            نوع جديد
          </button>
        </header>

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
          {listQuery.isAwaitingData && !sortedTypes.length ? (
            <DoctorTableSkeleton rows={5} columns={4} />
          ) : listQuery.error ? (
            <DoctorListErrorState
              message="تعذّر تحميل أنواع المواعيد."
              onRetry={() => void retryList()}
              retrying={retryingList}
            />
          ) : sortedTypes.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
              <Tags className="h-10 w-10 text-primary" />
              <p className="font-cairo text-[14px] font-semibold text-[#667085]">
                لا توجد أنواع مواعيد بعد.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-right">
                <thead>
                  <tr className="border-b border-[#EEF2F6] font-cairo text-[12px] font-extrabold text-[#667085]">
                    <th className="px-3 py-3">الاسم</th>
                    <th className="px-3 py-3">السعر</th>
                    <th className="px-3 py-3">مرئي للمريض</th>
                    <th className="px-3 py-3">الحالة</th>
                    <th className="px-3 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTypes.map((type) => (
                    <tr
                      key={type._id}
                      className="border-b border-[#F2F4F7] font-cairo text-[13px]"
                    >
                      <td className="px-3 py-4 font-extrabold text-[#111827]">
                        {type.name}
                      </td>
                      <td className="px-3 py-4 font-semibold text-[#344054]">
                        {type.price != null
                          ? formatBillingAmount(type.price, 'USD')
                          : '—'}
                      </td>
                      <td className="px-3 py-4">
                        {type.priceVisibleToPatient ? 'نعم' : 'لا'}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${
                            type.isActive !== false
                              ? 'bg-[#ECFDF3] text-[#027A48]'
                              : 'bg-[#F2F4F7] text-[#667085]'
                          }`}
                        >
                          {type.isActive !== false ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditTarget(type)}
                            className="rounded-[6px] border border-primary px-3 py-1.5 text-[11px] font-extrabold text-primary"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(type)}
                            className="rounded-[6px] bg-[#FEF3F2] px-3 py-1.5 text-[11px] font-extrabold text-[#B42318]"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
        onClose={() => setDeleteTarget(null)}
        title="حذف نوع الموعد"
        description={`هل تريد حذف "${deleteTarget?.name ?? ''}"؟`}
        confirmLabel="حذف"
        confirmDisabled={deleteType.isLoading}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
