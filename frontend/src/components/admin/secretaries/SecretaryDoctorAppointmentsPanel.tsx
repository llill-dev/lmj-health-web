'use client';

import {
  AlertCircle,
  CalendarDays,
  Clock,
  Eye,
  Search,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CancelAppointmentDialog from '@/components/admin/appointments/dialogs/CancelAppointmentDialog';
import AdminAppointmentDetailsDialog from '@/components/admin/appointments/dialogs/AdminAppointmentDetailsDialog';
import {
  formatDateLabel,
  statusLabel,
  statusPill,
  type UiAppointmentCard,
} from '@/components/admin/appointments/appointmentListUtils';
import StyledSelect from '@/components/ui/styled-select';
import { useAdminAppointments } from '@/hooks/admin/appointments/useAdminAppointments';
import { adminApi } from '@/lib/admin/client';
import type { AppointmentStatus } from '@/lib/admin/types';

export function SecretaryDoctorAppointmentsPanel({
  assignedDoctorId,
  doctorName,
  mode,
}: {
  assignedDoctorId?: string;
  doctorName: string;
  mode: 'view' | 'manage';
}) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<UiAppointmentCard | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    status: AppointmentStatus | '';
    date: string;
    search: string;
  }>({
    page: 1,
    limit: 50,
    status: '',
    date: '',
    search: '',
  });

  const { appointments, total, isAwaitingData, error } = useAdminAppointments({
    page: filters.page,
    limit: filters.limit,
    status: filters.status || undefined,
    date: filters.date || undefined,
  });

  const scopedAppointments = useMemo(() => {
    if (!assignedDoctorId) return [];
    return appointments.filter((row) => row.doctor?._id === assignedDoctorId);
  }, [appointments, assignedDoctorId]);

  const uiAppointments = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return scopedAppointments
      .filter((a) => {
        if (!q) return true;
        const patientName = a.patient?.userId?.fullName ?? '';
        const patientPublicId = a.patient?.publicId ?? '';
        return (
          patientName.toLowerCase().includes(q) ||
          patientPublicId.toLowerCase().includes(q)
        );
      })
      .map<UiAppointmentCard>((a) => ({
        id: a._id,
        status: a.status,
        typeLabel: 'clinic',
        code: a._id,
        doctorName,
        doctorSpecialization: a.doctor?.specialization,
        dateLabel: formatDateLabel(a),
        patientLabel:
          a.patient?.userId?.fullName ?? a.patient?.publicId ?? '—',
        time: a.startTime ?? '—',
      }));
  }, [doctorName, filters.search, scopedAppointments]);

  if (!assignedDoctorId) {
    return (
      <div className='mt-2 rounded-[12px] border border-[#FEF3C7] bg-[#FFFBEB] px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
        <p className='text-right font-cairo text-[13px] font-semibold text-[#92400E]'>
          لا يوجد طبيب مرتبط بهذا السكرتير. عيّن طبيباً أولاً لعرض المواعيد ضمن
          نطاقه.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className='mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
        <p className='mb-4 text-right font-cairo text-[12px] font-semibold text-[#667085]'>
          عرض مواعيد الطبيب المرتبط:{' '}
          <span className='font-extrabold text-[#111827]'>{doctorName}</span>
          {mode === 'manage' ? (
            <span className='text-[#98A2B3]'>
              {' '}
              — يمكنك الإلغاء وعرض التفاصيل وفق صلاحيات الإدارة.
            </span>
          ) : null}
        </p>

        <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder='بحث باسم المريض أو المعرّف…'
              className='h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pr-10 pl-3 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            />
          </div>
          <input
            type='date'
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                date: e.target.value,
                page: 1,
              }))
            }
            className='h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#111827]'
          />
          <div className='min-w-[180px]'>
            <StyledSelect
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as AppointmentStatus | '',
                  page: 1,
                }))
              }
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'scheduled', label: 'مجدولة' },
                { value: 'rescheduled', label: 'معاد جدولتها' },
                { value: 'completed', label: 'مكتملة' },
                { value: 'cancelled', label: 'ملغية' },
                { value: 'no-show', label: 'عدم حضور' },
              ]}
              listboxAriaLabel='حالة الموعد'
            />
          </div>
        </div>
      </section>

      <section className='mt-4 space-y-3'>
        {isAwaitingData ? (
          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
            جارٍ تحميل المواعيد…
          </div>
        ) : error ? (
          <div className='rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] px-6 py-6 text-right font-cairo text-[12px] font-semibold text-[#B42318]'>
            تعذّر تحميل المواعيد.
          </div>
        ) : uiAppointments.length === 0 ? (
          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
            لا توجد مواعيد مطابقة لهذا الطبيب.
            {total > 0 ? (
              <span className='mt-1 block text-[#98A2B3]'>
                قد تكون النتائج في صفحة أخرى من القائمة العامة — جرّب تغيير
                التاريخ أو الحالة.
              </span>
            ) : null}
          </div>
        ) : (
          uiAppointments.map((a) => (
            <div
              key={a.id}
              className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'
            >
              <div className='flex gap-4'>
                <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'>
                  <CalendarDays className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='text-right'>
                      <div className='flex items-center justify-start gap-2'>
                        <span className='font-cairo text-[14px] font-black text-[#111827]'>
                          {a.patientLabel}
                        </span>
                        <span
                          className={`inline-flex h-[22px] items-center gap-1 rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusPill[a.status]}`}
                        >
                          <Clock className='h-3 w-3' />
                          {statusLabel[a.status]}
                        </span>
                      </div>
                      <div className='mt-2 flex flex-wrap items-center gap-4 font-cairo text-[12px] font-bold text-[#667085]'>
                        <span className='inline-flex items-center gap-1.5'>
                          <CalendarDays className='h-4 w-4 text-primary' />
                          {a.dateLabel}
                        </span>
                        <span className='inline-flex items-center gap-1.5'>
                          <Clock className='h-4 w-4 text-primary' />
                          {a.time}
                        </span>
                        <span className='inline-flex items-center gap-1.5'>
                          <User className='h-4 w-4 text-primary' />
                          {a.doctorName}
                        </span>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedAppointmentId(a.id);
                          setDetailsOpen(true);
                        }}
                        className='inline-flex h-[32px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054]'
                      >
                        <Eye className='h-4 w-4' />
                        التفاصيل
                      </button>
                      {mode === 'manage' ? (
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedAppointment(a);
                            setCancelOpen(true);
                          }}
                          disabled={
                            !(
                              a.status === 'scheduled' ||
                              a.status === 'rescheduled'
                            )
                          }
                          className='inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#FEF2F2] px-4 font-cairo text-[12px] font-extrabold text-[#EF4444] disabled:opacity-40'
                        >
                          <AlertCircle className='h-4 w-4' />
                          إلغاء
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        targetName={selectedAppointment?.patientLabel || ''}
        confirmDisabled={
          !selectedAppointment ||
          !(
            selectedAppointment.status === 'scheduled' ||
            selectedAppointment.status === 'rescheduled'
          )
        }
        onConfirm={async (reason) => {
          if (!selectedAppointment?.id) return;
          await adminApi.appointments.cancel(selectedAppointment.id, reason);
          await queryClient.invalidateQueries({
            queryKey: ['admin-appointments'],
          });
        }}
        successToast={{
          title: 'تم إلغاء الموعد',
          message: 'سُجّل إلغاء الموعد في النظام.',
          variant: 'success',
        }}
      />
      <AdminAppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appointmentId={selectedAppointmentId}
      />
    </>
  );
}
