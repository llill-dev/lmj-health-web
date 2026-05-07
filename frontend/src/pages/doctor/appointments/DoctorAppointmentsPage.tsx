import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  UserX,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/ToastProvider';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import BookAppointmentDialog from '@/components/doctor/appointments/book-appointment-dialog';
import DoctorAppointmentExpandableCard from '@/components/doctor/appointments/doctor-appointment-expandable-card';
import AppointmentsEmptyState from '@/components/doctor/appointments/appointments-empty-state';
import CancelAppointmentDialog from '@/components/admin/appointments/dialogs/CancelAppointmentDialog';
import CompleteOrReasonDialog from '@/components/doctor/appointments/cancel-appointment-dialog';
import RescheduleAppointmentDialog from '@/components/doctor/appointments/reschedule-appointment-dialog';
import {
  useBookDoctorAppointmentApi,
  useCancelDoctorAppointmentApi,
  useCompleteDoctorAppointmentApi,
  useDoctorAppointmentDetailsApi,
  useDoctorAppointmentsApi,
  useNoShowDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
  usePatients,
} from '@/hooks';
import { readAuthUser } from '@/lib/cookies';

type MainView = 'schedule' | 'waiting';
type StatusTab = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

const UI_ONLY = import.meta.env.VITE_UI_ONLY === 'true';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function filterLocalSearch<
  T extends {
    patientName?: string;
    notes?: string;
    patientId?: string;
  },
>(items: T[], searchTerm: string): T[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const haystacks = [item.patientName, item.patientId, item.notes]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return haystacks.some((value) => value.includes(query));
  });
}

export default function DoctorAppointmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(todayIso());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [bookOpen, setBookOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [noShowTarget, setNoShowTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<
    string | null
  >(null);
  const [statusTab, setStatusTab] = useState<StatusTab>('scheduled');
  const [mainView, setMainView] = useState<MainView>('schedule');

  const selectedStatus = mainView === 'waiting' ? 'scheduled' : statusTab;

  const listQuery = useDoctorAppointmentsApi({
    page,
    limit,
    status: selectedStatus,
    date: dateFilter || undefined,
  });
  const detailsQuery = useDoctorAppointmentDetailsApi(expandedAppointmentId ?? '');

  const scheduledToday = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: 'scheduled',
    date: todayIso(),
  });
  const completedToday = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: 'completed',
    date: todayIso(),
  });
  const cancelledToday = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: 'cancelled',
    date: todayIso(),
  });
  const noShowToday = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: 'no-show',
    date: todayIso(),
  });

  const cancelMutation = useCancelDoctorAppointmentApi();
  const completeMutation = useCompleteDoctorAppointmentApi();
  const rescheduleMutation = useRescheduleDoctorAppointmentApi();
  const noShowMutation = useNoShowDoctorAppointmentApi();
  const bookMutation = useBookDoctorAppointmentApi();

  const { patients: uiOnlyPatients } = usePatients(1, 100);

  const mergedAppointments = useMemo(() => {
    return listQuery.appointments.map((appointment) => {
      if (
        expandedAppointmentId &&
        expandedAppointmentId === appointment.id &&
        detailsQuery.appointment
      ) {
        return detailsQuery.appointment;
      }
      return appointment;
    });
  }, [detailsQuery.appointment, expandedAppointmentId, listQuery.appointments]);

  const visibleAppointments = useMemo(
    () => filterLocalSearch(mergedAppointments, searchTerm),
    [mergedAppointments, searchTerm],
  );

  const totalPages = Math.max(1, Math.ceil(listQuery.total / Math.max(limit, 1)));
  const showingFrom = listQuery.total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(listQuery.total, page * limit);

  const appointmentLoadError = listQuery.error;

  const handleBookingAction = () => {
    if (!UI_ONLY) {
      toast('ربط حجز الموعد يحتاج مصدر مرضى فعلي للطبيب قبل التفعيل الكامل.', {
        title: 'قيد الاستكمال',
        variant: 'info',
        durationMs: 4500,
      });
      return;
    }
    setBookOpen(true);
  };

  if (appointmentLoadError) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-2 text-red-600'>تعذّر تحميل المواعيد</p>
          <button
            onClick={() => listQuery.refetch()}
            className='mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
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

      <div dir='rtl' lang='ar'>
        <DoctorDashboardOverview
          variant='appointments'
          surface='mint'
          title='إدارة المواعيد'
          subtitle='قائمة المواعيد مربوطة بعقدة الـ API الفعلية للعرض والتحديث'
          onActionClick={handleBookingAction}
          actionLabel='حجز موعد جديد'
          kpis={[
            {
              key: 'scheduled',
              icon: <Clock className='h-5 w-5 shrink-0' />,
              value: scheduledToday.isLoading ? '—' : scheduledToday.total,
              label: 'مجدولة اليوم',
            },
            {
              key: 'completed',
              icon: <CheckCircle className='h-5 w-5 shrink-0' />,
              value: completedToday.isLoading ? '—' : completedToday.total,
              label: 'مكتملة اليوم',
            },
            {
              key: 'cancelled',
              icon: <XCircle className='h-5 w-5 shrink-0' />,
              value: cancelledToday.isLoading ? '—' : cancelledToday.total,
              label: 'ملغية اليوم',
            },
            {
              key: 'no-show',
              icon: <UserX className='h-5 w-5 shrink-0' />,
              value: noShowToday.isLoading ? '—' : noShowToday.total,
              label: 'عدم حضور اليوم',
            },
          ]}
        />

        <BookAppointmentDialog
          open={bookOpen}
          onOpenChange={setBookOpen}
          patients={uiOnlyPatients.map((patient) => ({
            id: patient.id,
            name: patient.name,
          }))}
          onSubmit={async (values) => {
            const doctorId = readAuthUser()?.actorIds?.doctorId;
            if (!doctorId) {
              toast('تعذّر تحديد هوية الطبيب الحالية لهذا الحجز.', {
                title: 'خطأ',
                variant: 'error',
              });
              return;
            }
            await bookMutation.mutateAsync({
              doctorId,
              patientId: values.patientId,
              date: values.date,
              startTime: values.time,
              notes: values.notes,
            });
          }}
        />

        <CancelAppointmentDialog
          open={cancelOpen}
          onOpenChange={(open) => {
            setCancelOpen(open);
            if (!open) setCancelTarget(null);
          }}
          targetName={cancelTarget?.patientName ?? ''}
          confirmDisabled={cancelMutation.isPending}
          onConfirm={async (reason) => {
            if (!cancelTarget) return;
            try {
              await cancelMutation.mutateAsync({
                id: cancelTarget.id,
                body: { reason },
              });
            } catch (error) {
              toast(error instanceof Error ? error.message : 'تعذّر إلغاء الموعد.', {
                title: 'خطأ',
                variant: 'error',
                durationMs: 4800,
              });
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={completeOpen}
          onOpenChange={(open) => {
            setCompleteOpen(open);
            if (!open) setCompleteTarget(null);
          }}
          patientName={completeTarget?.patientName ?? ''}
          confirmDisabled={completeMutation.isPending}
          title='إنهاء الموعد'
          fieldLabel='ملاحظات الإنهاء'
          placeholder='اكتب ملاحظات الطبيب التي يجب إرسالها مع إنهاء الموعد...'
          confirmLabel='إنهاء الموعد'
          onConfirm={async (medicalNotes) => {
            if (!completeTarget) return;
            try {
              await completeMutation.mutateAsync({
                id: completeTarget.id,
                body: { notes: medicalNotes },
              });
            } catch (error) {
              toast(error instanceof Error ? error.message : 'تعذّر إنهاء الموعد.', {
                title: 'خطأ',
                variant: 'error',
                durationMs: 4800,
              });
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={noShowOpen}
          onOpenChange={(open) => {
            setNoShowOpen(open);
            if (!open) setNoShowTarget(null);
          }}
          patientName={noShowTarget?.patientName ?? ''}
          confirmDisabled={noShowMutation.isPending || UI_ONLY}
          title='تسجيل عدم حضور'
          fieldLabel='سبب عدم الحضور'
          placeholder='اكتب سبب تسجيل الموعد كعدم حضور...'
          confirmLabel='تسجيل عدم الحضور'
          onConfirm={async (reason) => {
            if (!noShowTarget) return;
            try {
              await noShowMutation.mutateAsync({
                id: noShowTarget.id,
                body: { reason },
              });
            } catch (error) {
              toast(
                error instanceof Error ? error.message : 'تعذّر تسجيل عدم الحضور.',
                {
                  title: 'خطأ',
                  variant: 'error',
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        <RescheduleAppointmentDialog
          open={rescheduleOpen}
          onOpenChange={(open) => {
            setRescheduleOpen(open);
            if (!open) setRescheduleTarget(null);
          }}
          patientName={rescheduleTarget?.patientName ?? ''}
          initialDate={rescheduleTarget?.date}
          initialTime={rescheduleTarget?.time}
          confirmDisabled={rescheduleMutation.isPending || UI_ONLY}
          onConfirm={async (values) => {
            if (!rescheduleTarget) return;
            try {
              await rescheduleMutation.mutateAsync({
                id: rescheduleTarget.id,
                body: values,
              });
            } catch (error) {
              toast(
                error instanceof Error ? error.message : 'تعذّر إعادة جدولة الموعد.',
                {
                  title: 'خطأ',
                  variant: 'error',
                  durationMs: 4800,
                },
              );
              throw error;
            }
          }}
        />

        <section className='mb-5 rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='relative min-w-[260px] flex-1'>
              <Search className='absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='بحث محلي داخل الصفحة الحالية فقط'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-[6px] border border-[#E5E7EB] bg-white py-3 pl-4 pr-10 font-cairo text-[14px] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]/20'
              />
            </div>

            <input
              type='date'
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className='h-[46px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827]'
            />

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className='h-[46px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827]'
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value} / صفحة
                </option>
              ))}
            </select>
          </div>

          <p className='mt-3 text-right font-cairo text-[12px] font-semibold text-[#667085]'>
            البحث هنا محلي على نتائج الصفحة الحالية فقط. الفلترة المرسلة للباكند حالياً:
            التاريخ، الحالة، الصفحة، والحد.
          </p>
        </section>

        <section className='mb-4'>
          <div className='flex gap-3 sm:gap-4'>
            <button
              type='button'
              onClick={() => {
                setMainView('schedule');
                setPage(1);
              }}
              className={
                mainView === 'schedule'
                  ? 'min-h-[56px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-cairo text-[15px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.35)]'
                  : 'min-h-[56px] flex-1 rounded-[8px] border-2 border-primary/35 bg-white px-4 py-3 font-cairo text-[15px] font-extrabold text-primary'
              }
            >
              المواعيد
            </button>
            <button
              type='button'
              onClick={() => {
                setMainView('waiting');
                setPage(1);
              }}
              className={
                mainView === 'waiting'
                  ? 'min-h-[56px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-cairo text-[15px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.35)]'
                  : 'min-h-[56px] flex-1 rounded-[8px] border-2 border-primary/35 bg-white px-4 py-3 font-cairo text-[15px] font-extrabold text-primary'
              }
            >
              قائمة الانتظار
            </button>
          </div>
        </section>

        <section className='mb-6'>
          <div className='rounded-[6px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            {mainView === 'schedule' ? (
              <div className='flex flex-wrap items-center gap-2 border-b border-[#F2F4F7] px-6 py-4'>
                {([
                  ['scheduled', 'المجدولة'],
                  ['completed', 'المكتملة'],
                  ['cancelled', 'الملغية'],
                  ['no-show', 'عدم الحضور'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => {
                      setStatusTab(key);
                      setPage(1);
                    }}
                    className={
                      statusTab === key
                        ? 'rounded-[6px] bg-primary px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
                        : 'rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-extrabold text-[#344054]'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className='border-b border-[#F2F4F7] px-6 py-3'>
                <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                  قائمة الانتظار تعرض المواعيد المجدولة ضمن نفس فلاتر الباكند الحالية.
                </p>
              </div>
            )}

            <div className='px-6 py-4'>
              {listQuery.isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
              ) : listQuery.total === 0 ? (
                <AppointmentsEmptyState onBookClick={handleBookingAction} />
              ) : visibleAppointments.length === 0 ? (
                <div className='py-12 text-center'>
                  <Calendar className='mx-auto h-12 w-12 text-gray-300' />
                  <p className='mt-3 font-cairo text-[14px] font-semibold text-[#667085]'>
                    لا توجد نتائج مطابقة للبحث المحلي ضمن هذه الصفحة.
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {visibleAppointments.map((appointment) => (
                    <DoctorAppointmentExpandableCard
                      key={appointment.id}
                      appointment={appointment}
                      expanded={expandedAppointmentId === appointment.id}
                      detailsLoading={
                        expandedAppointmentId === appointment.id &&
                        detailsQuery.isLoading
                      }
                      onToggle={() => {
                        setExpandedAppointmentId((current) =>
                          current === appointment.id ? null : appointment.id,
                        );
                      }}
                      cancelling={cancelMutation.isPending}
                      completing={completeMutation.isPending}
                      rescheduling={rescheduleMutation.isPending || UI_ONLY}
                      noShowing={noShowMutation.isPending || UI_ONLY}
                      onCancel={() => {
                        setCancelTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setCancelOpen(true);
                      }}
                      onComplete={() => {
                        setCompleteTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setCompleteOpen(true);
                      }}
                      onEdit={() => {
                        if (UI_ONLY) {
                          toast('إعادة الجدولة الفعلية متاحة فقط مع الباكند الحقيقي.', {
                            title: 'محدود في وضع الواجهة',
                            variant: 'info',
                          });
                          return;
                        }
                        setRescheduleTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                          date: appointment.date,
                          time: appointment.time,
                        });
                        setRescheduleOpen(true);
                      }}
                      onNoShow={() => {
                        if (UI_ONLY) {
                          toast('عدم الحضور الفعلي متاح فقط مع الباكند الحقيقي.', {
                            title: 'محدود في وضع الواجهة',
                            variant: 'info',
                          });
                          return;
                        }
                        setNoShowTarget({
                          id: appointment.id,
                          patientName: appointment.patientName,
                        });
                        setNoShowOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className='mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-bold text-[#667085]'>
            عرض {showingFrom}–{showingTo} من {listQuery.total} • الصفحة {page} من {totalPages}
          </div>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || listQuery.isFetching}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:opacity-60'
            >
              السابق
            </button>

            <button
              type='button'
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || listQuery.isFetching}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:opacity-60'
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
