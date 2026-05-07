import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Search,
  XCircle,
  CheckCircle,
  UserX,
} from 'lucide-react';
import {
  useAppointments,
  useDashboardStats,
  useCancelAppointment,
  useCompleteAppointment,
} from '@/hooks';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/ToastProvider';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import BookAppointmentDialog from '@/components/doctor/appointments/book-appointment-dialog';
import DoctorAppointmentExpandableCard from '@/components/doctor/appointments/doctor-appointment-expandable-card';
import AppointmentsEmptyState from '@/components/doctor/appointments/appointments-empty-state';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import CancelAppointmentDialog from '@/components/doctor/appointments/cancel-appointment-dialog';
import type { Appointment } from '@/lib/api/api';

type MainView = 'schedule' | 'waiting';
type PeriodFilter = 'all' | 'today' | 'week' | 'month';

function formatIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** بداية الأسبوع بمعيار الاثنين (شائع في التنسيق الطبي المحلي). */
function isoWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(12, 0, 0, 0);
  return mon;
}

function filterAppointmentsByPeriod(
  list: Appointment[],
  period: PeriodFilter,
  anchor: Date,
): Appointment[] {
  if (period === 'all') return list;
  const isoToday = formatIsoLocal(anchor);
  if (period === 'today') {
    return list.filter((a) => a.date === isoToday);
  }
  if (period === 'week') {
    const start = isoWeekMonday(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const s = formatIsoLocal(start);
    const e = formatIsoLocal(end);
    return list.filter((a) => a.date >= s && a.date <= e);
  }
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const s = formatIsoLocal(first);
  const e = formatIsoLocal(last);
  return list.filter((a) => a.date >= s && a.date <= e);
}

function sortByDateTimeAsc(a: Appointment, b: Appointment): number {
  const d = a.date.localeCompare(b.date);
  if (d !== 0) return d;
  return a.time.localeCompare(b.time);
}

function countAppointmentsForPeriod(
  list: Appointment[],
  period: PeriodFilter,
  anchor: Date,
): number {
  return filterAppointmentsByPeriod(list, period, anchor).length;
}

export default function DoctorAppointmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookOpen, setBookOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishTarget, setFinishTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);
  const [statusTab, setStatusTab] = useState<
    'scheduled' | 'completed' | 'cancelled' | 'absent'
  >('scheduled');
  const [mainView, setMainView] = useState<MainView>('schedule');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    appointments: rawAppointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch,
  } = useAppointments(1, 100, undefined, undefined, searchTerm);
  const { cancelAppointment, isLoading: cancelling } = useCancelAppointment();
  const { completeAppointment, isLoading: completing } =
    useCompleteAppointment();

  const todayAppointments = rawAppointments.filter(
    (apt) => apt.date === selectedDate,
  );

  const scheduledCount = todayAppointments.filter(
    (apt) => apt.status === 'scheduled',
  ).length;
  const completedCount = todayAppointments.filter(
    (apt) => apt.status === 'completed',
  ).length;
  const cancelledCount = todayAppointments.filter(
    (apt) => apt.status === 'cancelled',
  ).length;
  const absentCount = 0;

  const periodScoped = useMemo(() => {
    const anchor = new Date();
    return filterAppointmentsByPeriod(rawAppointments, periodFilter, anchor);
  }, [rawAppointments, periodFilter]);

  const periodCounts = useMemo(() => {
    const anchor = new Date();
    return {
      all: countAppointmentsForPeriod(rawAppointments, 'all', anchor),
      today: countAppointmentsForPeriod(rawAppointments, 'today', anchor),
      week: countAppointmentsForPeriod(rawAppointments, 'week', anchor),
      month: countAppointmentsForPeriod(rawAppointments, 'month', anchor),
    };
  }, [rawAppointments]);

  const waitingListAppointments = useMemo(
    () =>
      [...periodScoped]
        .filter((a) => a.status === 'scheduled')
        .sort(sortByDateTimeAsc),
    [periodScoped],
  );

  const scheduleViewAppointments = useMemo(() => {
    return periodScoped.filter((apt) => {
      if (statusTab === 'absent') return false;
      return apt.status === statusTab;
    });
  }, [periodScoped, statusTab]);

  const visibleAppointments =
    mainView === 'waiting' ? waitingListAppointments : scheduleViewAppointments;

  const periodPills: { key: PeriodFilter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'today', label: 'اليوم' },
    { key: 'week', label: 'الأسبوع' },
    { key: 'month', label: 'الشهر' },
  ];

  const handleCancelAppointment = async (id: string) => {
    await cancelAppointment(id);
  };

  const handleCompleteAppointment = async (id: string) => {
    await completeAppointment(id);
  };

  if (statsError || appointmentsError) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='mx-auto w-12 h-12 text-red-500' />
          <p className='mt-2 text-red-600'>فشل تحميل البيانات</p>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 mt-2 text-white bg-blue-500 rounded hover:bg-blue-600'
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Appointments • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <DoctorDashboardOverview
          variant='appointments'
          surface='mint'
          title='إدارة المواعيد'
          subtitle='جدول المرضى والاستشارات'
          onActionClick={() => setBookOpen(true)}
          actionLabel='حجز موعد جديد'
          kpis={[
            {
              key: 'scheduled',
              icon: <Clock className='h-5 w-5 shrink-0' />,
              value: statsLoading ? '—' : scheduledCount,
              label: 'مجدولة',
            },
            {
              key: 'completed',
              icon: <CheckCircle className='h-5 w-5 shrink-0' />,
              value: statsLoading ? '—' : completedCount,
              label: 'مكتملة',
            },
            {
              key: 'cancelled',
              icon: <XCircle className='h-5 w-5 shrink-0' />,
              value: statsLoading ? '—' : cancelledCount,
              label: 'ملغية',
            },
            {
              key: 'absent',
              icon: <UserX className='h-5 w-5 shrink-0' />,
              value: statsLoading ? '—' : absentCount,
              label: 'غياب',
            },
          ]}
        />

        <BookAppointmentDialog
          open={bookOpen}
          onOpenChange={setBookOpen}
          patients={[
            { id: 'p-1', name: 'أحمد محمد' },
            { id: 'p-2', name: 'سارة عبدالله' },
            { id: 'p-3', name: 'محمد علي' },
          ]}
          onSubmit={() => {
            setBookOpen(false);
          }}
        />

        <ConfirmActionDialog
          open={confirmCancelOpen}
          onOpenChange={(open) => {
            setConfirmCancelOpen(open);
            if (!open) setConfirmTarget(null);
          }}
          title='تأكيد إلغاء الموعد'
          description={
            <span>
              هل أنت متأكد من إلغاء موعد {confirmTarget?.patientName ?? ''} في{' '}
              {confirmTarget?.date ?? ''} الساعة {confirmTarget?.time ?? ''}؟
            </span>
          }
          confirmLabel='تأكيد'
          confirmDisabled={cancelling}
          onConfirm={async () => {
            if (!confirmTarget) return;
            try {
              await handleCancelAppointment(confirmTarget.id);
            } catch {
              toast('تعذّر إلغاء الموعد. تحقق من الاتصال وحاول مرة أخرى.', {
                title: 'خطأ',
                variant: 'error',
                durationMs: 4800,
              });
              throw new Error('cancel-failed');
            }
          }}
        />

        <CancelAppointmentDialog
          open={finishOpen}
          onOpenChange={(open) => {
            setFinishOpen(open);
            if (!open) setFinishTarget(null);
          }}
          patientName={finishTarget?.patientName ?? ''}
          confirmDisabled={completing}
          onConfirm={async (_medicalNotes) => {
            if (!finishTarget) return;
            try {
              await handleCompleteAppointment(finishTarget.id);
            } catch {
              toast('تعذّر إنهاء الموعد. تحقق من الاتصال وحاول مرة أخرى.', {
                title: 'خطأ',
                variant: 'error',
                durationMs: 4800,
              });
              throw new Error('complete-failed');
            }
          }}
        />

        <section className='mb-5 flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-1 gap-4 items-center'>
            <div className='relative flex-1'>
              <Search className='absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2' />
              <input
                type='text'
                placeholder='ابحث بالاسم أو رقم الهاتف...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-[6px] bg-[#FFFFFF] border border-[#E5E7EB] pr-10 pl-4 py-3 font-cairo text-[14px] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20'
              />
            </div>
          </div>
        </section>

        {/* مُبدّل رئيسي: الجدول المجدول | قائمة الانتظار — مطابقاً لتصميم لوحة الطبيب */}
        <section className='mb-4'>
          <div className='flex gap-3 sm:gap-4'>
            <button
              type='button'
              onClick={() => setMainView('schedule')}
              className={
                mainView === 'schedule'
                  ? 'min-h-[56px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-cairo text-[15px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.35)] transition-all sm:min-h-[60px] sm:text-[16px]'
                  : 'min-h-[56px] flex-1 rounded-[8px] border-2 border-primary/35 bg-white px-4 py-3 font-cairo text-[15px] font-extrabold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:border-primary/55 hover:bg-[#F0FDFC] sm:min-h-[60px] sm:text-[16px]'
              }
            >
              المواعيد المجدولة
            </button>
            <button
              type='button'
              onClick={() => setMainView('waiting')}
              className={
                mainView === 'waiting'
                  ? 'min-h-[56px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-cairo text-[15px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.35)] transition-all sm:min-h-[60px] sm:text-[16px]'
                  : 'min-h-[56px] flex-1 rounded-[8px] border-2 border-primary/35 bg-white px-4 py-3 font-cairo text-[15px] font-extrabold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,1)] transition-all hover:border-primary/55 hover:bg-[#F0FDFC] sm:min-h-[60px] sm:text-[16px]'
              }
            >
              قائمة الانتظار
            </button>
          </div>
        </section>

        <section className='mb-4 flex flex-wrap gap-2'>
          {periodPills.map(({ key, label }) => {
            const count = periodCounts[key];
            const active = periodFilter === key;
            return (
              <button
                key={key}
                type='button'
                onClick={() => setPeriodFilter(key)}
                className={
                  active
                    ? 'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.25)]'
                    : 'inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054] transition-colors hover:border-primary/40 hover:text-primary'
                }
              >
                <span>{label}</span>
                <span
                  className={
                    active
                      ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 font-cairo text-[11px] font-extrabold text-white'
                      : 'flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[11px] font-extrabold text-[#344054]'
                  }
                >
                  {appointmentsLoading ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    count
                  )}
                </span>
              </button>
            );
          })}
        </section>

        <section className='mb-6'>
          <div className='rounded-[6px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            {mainView === 'schedule' ? (
              <div className='flex flex-wrap gap-2 items-center px-6 py-4 border-b border-[#F2F4F7]'>
                <button
                  type='button'
                  onClick={() => setStatusTab('scheduled')}
                  className={
                    statusTab === 'scheduled'
                      ? 'flex items-center gap-2 rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
                      : 'flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                  }
                >
                  <span className='whitespace-nowrap'>المجدولة</span>
                  <span
                    className={
                      statusTab === 'scheduled'
                        ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 font-cairo text-[12px] font-extrabold text-white'
                        : 'flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[12px] font-extrabold text-[#344054]'
                    }
                  >
                    {appointmentsLoading ? (
                      <Loader2 className='w-3 h-3 animate-spin' />
                    ) : (
                      periodScoped.filter((a) => a.status === 'scheduled').length
                    )}
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setStatusTab('completed')}
                  className={
                    statusTab === 'completed'
                      ? 'flex items-center gap-2 rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
                      : 'flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                  }
                >
                  <span className='whitespace-nowrap'>المكتملة</span>
                  <span
                    className={
                      statusTab === 'completed'
                        ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 font-cairo text-[12px] font-extrabold text-white'
                        : 'flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[12px] font-extrabold text-[#344054]'
                    }
                  >
                    {appointmentsLoading ? (
                      <Loader2 className='w-3 h-3 animate-spin' />
                    ) : (
                      periodScoped.filter((a) => a.status === 'completed').length
                    )}
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setStatusTab('cancelled')}
                  className={
                    statusTab === 'cancelled'
                      ? 'flex items-center gap-2 rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
                      : 'flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                  }
                >
                  <span className='whitespace-nowrap'>الملغية</span>
                  <span
                    className={
                      statusTab === 'cancelled'
                        ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 font-cairo text-[12px] font-extrabold text-white'
                        : 'flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[12px] font-extrabold text-[#344054]'
                    }
                  >
                    {appointmentsLoading ? (
                      <Loader2 className='w-3 h-3 animate-spin' />
                    ) : (
                      periodScoped.filter((a) => a.status === 'cancelled').length
                    )}
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setStatusTab('absent')}
                  className={
                    statusTab === 'absent'
                      ? 'flex items-center gap-2 rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
                      : 'flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                  }
                >
                  <span className='whitespace-nowrap'>الغياب</span>
                  <span
                    className={
                      statusTab === 'absent'
                        ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 font-cairo text-[12px] font-extrabold text-white'
                        : 'flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F2F4F7] px-2 font-cairo text-[12px] font-extrabold text-[#344054]'
                    }
                  >
                    {appointmentsLoading ? (
                      <Loader2 className='w-3 h-3 animate-spin' />
                    ) : (
                      absentCount
                    )}
                  </span>
                </button>
              </div>
            ) : (
              <div className='px-6 py-3 border-b border-[#F2F4F7]'>
                <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                  مواعيد بانتظار الدور (مجدولة فقط) — مرتبة حسب التاريخ والوقت ضمن النطاق المحدد.
                </p>
              </div>
            )}

            <div className='px-6 py-4'>
              {appointmentsLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <Loader2 className='w-8 h-8 animate-spin text-primary' />
                </div>
              ) : periodScoped.length === 0 ? (
                <AppointmentsEmptyState onBookClick={() => setBookOpen(true)} />
              ) : visibleAppointments.length === 0 ? (
                <div className='py-12 text-center'>
                  <Calendar className='mx-auto h-12 w-12 text-gray-300' />
                  <p className='mt-3 font-cairo text-[14px] font-semibold text-[#667085]'>
                    {mainView === 'waiting'
                      ? 'لا توجد مواعيد مجدولة في قائمة الانتظار ضمن هذا النطاق'
                      : 'لا توجد مواعيد ضمن هذا التبويب والنطاق الزمني'}
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {visibleAppointments.map((appointment) => (
                    <DoctorAppointmentExpandableCard
                      key={appointment.id}
                      appointment={appointment}
                      expanded={expandedCardIds.has(appointment.id)}
                      onToggle={() => {
                        setExpandedCardIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(appointment.id)) {
                            next.delete(appointment.id);
                          } else {
                            next.add(appointment.id);
                          }
                          return next;
                        });
                      }}
                      cancelling={cancelling}
                      completing={completing}
                      onCancel={() => {
                        setConfirmTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                          date: appointment.date,
                          time: appointment.time,
                        });
                        setConfirmCancelOpen(true);
                      }}
                      onComplete={() => {
                        setFinishTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setFinishOpen(true);
                      }}
                      onEdit={() => setBookOpen(true)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
