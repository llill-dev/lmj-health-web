import { Helmet } from 'react-helmet-async';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
  User,
  Eye,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ConfirmActionDialog,
  CancelAppointmentDialog,
} from '../../../components/admin/dialogs';
import AdminAppointmentDetailsDialog from '@/components/admin/dialogs/AdminAppointmentDetailsDialog';
import { adminApi } from '@/lib/admin/client';

import { useAdminAppointments } from '@/hooks/useAdminAppointments';
import type { AppointmentStatus, AppointmentSummary } from '@/lib/admin/types';

type UiAppointmentCard = {
  id: string;
  status: AppointmentStatus;
  typeLabel: 'clinic';
  code: string;
  doctorName: string;
  doctorSpecialization?: string;
  dateLabel: string;
  patientLabel: string;
  time: string;
};

const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: 'مجدولة',
  rescheduled: 'معاد جدولتها',
  completed: 'مكتملة',
  cancelled: 'ملغية',
  'no-show': 'عدم حضور',
};

const statusPill: Record<AppointmentStatus, string> = {
  completed: 'bg-[#DCFCE7] text-[#16A34A]',
  'no-show': 'bg-[#F3F4F6] text-[#4B5563]',
  cancelled: 'bg-[#FEF2F2] text-[#EF4444]',
  scheduled: 'bg-[#E0F2FE] text-[#0284C7]',
  rescheduled: 'bg-[#E0F2FE] text-[#0284C7]',
};

function formatDateLabel(a: AppointmentSummary) {
  const iso = a.date ?? a.startDateTime;
  if (!iso) return '—';

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().slice(0, 10);
}

export default function AdminAppointmentsPage() {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [cancelAppointmentOpen, setCancelAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<UiAppointmentCard | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    limit: 10,
    status: '',
    date: '',
    search: '',
  });

  const { appointments, results, total, isLoading, error } =
    useAdminAppointments({
      page: filters.page,
      limit: filters.limit,
      status: filters.status || undefined,
      date: filters.date || undefined,
    });

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const filteredAppointments = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const doctorName = a.doctor?.userId?.fullName ?? '';
      const patientName = a.patient?.userId?.fullName ?? '';
      const patientPublicId = a.patient?.publicId ?? '';
      return (
        doctorName.toLowerCase().includes(q) ||
        patientName.toLowerCase().includes(q) ||
        patientPublicId.toLowerCase().includes(q)
      );
    });
  }, [appointments, filters.search]);

  const uiAppointments = useMemo(() => {
    return filteredAppointments.map<UiAppointmentCard>((a) => {
      const doctorName = a.doctor?.userId?.fullName ?? '—';
      const patientLabel =
        a.patient?.userId?.fullName ?? a.patient?.publicId ?? '—';

      return {
        id: a._id,
        status: a.status,
        typeLabel: 'clinic',
        code: a._id,
        doctorName,
        doctorSpecialization: a.doctor?.specialization,
        dateLabel: formatDateLabel(a),
        patientLabel,
        time: a.startTime ?? '—',
      };
    });
  }, [filteredAppointments]);

  const statusCounts = useMemo(() => {
    const counts: Record<AppointmentStatus, number> = {
      scheduled: 0,
      rescheduled: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    };

    for (const a of appointments) {
      counts[a.status] += 1;
    }
    return counts;
  }, [appointments]);

  const stats = [
    {
      title: 'ملغية',
      value: String(statusCounts.cancelled),
      icon: Ban,
      tone: {
        border: 'border-[#FECACA]',
        bg: 'bg-[#FEF2F2]',
        iconBg: 'bg-[#EF4444]',
        iconFg: 'text-white',
        valueFg: 'text-[#EF4444]',
      },
    },
    {
      title: 'عدم حضور',
      value: String(statusCounts['no-show']),
      icon: AlertCircle,
      tone: {
        border: 'border-[#E5E7EB]',
        bg: 'bg-white',
        iconBg: 'bg-[#4B5563]',
        iconFg: 'text-white',
        valueFg: 'text-[#111827]',
      },
    },
    {
      title: 'مكتملة',
      value: String(statusCounts.completed),
      icon: CheckCircle2,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-[#F0FDF4]',
        iconBg: 'bg-[#16A34A]',
        iconFg: 'text-white',
        valueFg: 'text-[#16A34A]',
      },
    },
    {
      title: 'مجدولة',
      value: String(statusCounts.scheduled + statusCounts.rescheduled),
      icon: Clock,
      tone: {
        border: 'border-[#99F6E4]',
        bg: 'bg-[#ECFEFF]',
        iconBg: 'bg-primary',
        iconFg: 'text-white',
        valueFg: 'text-primary',
      },
    },
  ] as const;

  return (
    <>
      <Helmet>
        <title>إدارة المواعيد • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            إدارة المواعيد
          </div>
        </div>

        <section className='mt-6 grid grid-cols-4 gap-4'>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`h-[92px] rounded-[12px] border px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${s.tone.border} ${s.tone.bg}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {s.title}
                    </div>
                    <div
                      className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${s.tone.valueFg}`}
                    >
                      {s.value}
                    </div>
                  </div>

                  <div
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] ${s.tone.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${s.tone.iconFg}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between gap-4'>
            <div className='relative flex-1'>
              <input
                placeholder='بحث بالطبيب او المريض...'
                className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
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

            <div className='flex items-center gap-3'>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (e.target.value as AppointmentStatus | '') || '',
                    page: 1,
                  }))
                }
                className='h-[42px] w-[160px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827]'
              >
                <option value=''>كل الحالات</option>
                <option value='scheduled'>مجدولة</option>
                <option value='rescheduled'>معاد جدولتها</option>
                <option value='completed'>مكتملة</option>
                <option value='cancelled'>ملغية</option>
                <option value='no-show'>عدم حضور</option>
              </select>

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
                className='h-[42px] w-[170px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827]'
              />
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => setConfirmResetOpen(true)}
                className='inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              >
                إعادة تعيين
              </button>
              <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                {results} نتيجة
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 space-y-4'>
          {isLoading ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              جارِ تحميل المواعيد...
            </div>
          ) : error ? (
            <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 font-cairo text-[12px] font-semibold text-[#B42318] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              تعذّر تحميل المواعيد.
            </div>
          ) : uiAppointments.length === 0 ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              لا توجد مواعيد مطابقة.
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
                  <div className='flex-1 space-y-6'>
                    <div className='text-right'>
                      <div className='flex items-center justify-start gap-2'>
                        <div className='font-cairo text-[14px] font-black text-[#111827]'>
                          {a.typeLabel}
                        </div>
                        <span
                          className={`flex gap-1 items-center h-[22px] rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusPill[a.status]}`}
                        >
                          <Clock className='h-3 w-3' />
                          {statusLabel[a.status]}
                        </span>
                      </div>
                      <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                        موعد: {a.code}
                      </div>
                    </div>

                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='text-right'>
                          <div className='flex flex-col items-start gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-primary' />
                              {a.patientLabel}
                            </div>
                          </div>
                          <div className='mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                            <Clock className='h-4 w-4 text-primary' />
                            {a.time}
                          </div>
                        </div>

                        <div className='text-right'>
                          <div className='flex flex-col items-start gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-primary' />
                              {a.doctorName}
                            </div>
                          </div>
                          <div className='mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                            <CalendarDays className='h-4 w-4 text-primary' />
                            {a.dateLabel}
                          </div>
                        </div>
                      </div>

                      <div className='mt-4 flex justify-end gap-2'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedAppointment(a);
                            setCancelAppointmentOpen(true);
                          }}
                          disabled={
                            !(
                              a.status === 'scheduled' ||
                              a.status === 'rescheduled'
                            )
                          }
                          className='inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#FEF2F2] px-4 font-cairo text-[12px] font-extrabold text-[#EF4444]'
                        >
                          <AlertCircle className='h-4 w-4' />
                          إلغاء الموعد
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedAppointmentId(a.id);
                            setDetailsOpen(true);
                          }}
                          className='inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#4B5563]'
                        >
                          <Eye className='h-4 w-4' />
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
                className='h-[36px] w-[110px] appearance-none rounded-[10px] border border-primary/25 bg-primary/10 px-4 text-right font-cairo text-[12px] font-extrabold text-primary outline-none'
              >
                {[10, 20, 50, 100].map((v) => (
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
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
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
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
            >
              التالي
            </button>
          </div>
        </section>

        <ConfirmActionDialog
          open={confirmResetOpen}
          onOpenChange={setConfirmResetOpen}
          title='إعادة تعيين عرض المواعيد'
          description='سيتم إرجاع البحث والتصفية والتاريخ وعدد النتائج في الصفحة إلى الوضع الافتراضي. لا يُعدّل ذلك بيانات المواعيد المخزّنة.'
          confirmLabel='إعادة التعيين'
          onConfirm={async () => {
            setFilters({
              page: 1,
              limit: 10,
              status: '',
              date: '',
              search: '',
            });
          }}
          successToast={{
            title: 'تمت إعادة التعيين',
            message: 'أُعيد ضبط عرض البحث والتصفية والتاريخ. لم تتغيّر المواعيد نفسها.',
            variant: 'info',
          }}
        />

        <CancelAppointmentDialog
          open={cancelAppointmentOpen}
          onOpenChange={setCancelAppointmentOpen}
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
          }}
          successToast={{
            title: 'تم إلغاء الموعد',
            message:
              'سُجّل إلغاء الموعد في النظام. سيتم إشعار الأطراف عند اكتمال تدفق الإشعارات.',
            variant: 'success',
          }}
        />

        <AdminAppointmentDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          appointmentId={selectedAppointmentId}
        />
      </div>
    </>
  );
}
