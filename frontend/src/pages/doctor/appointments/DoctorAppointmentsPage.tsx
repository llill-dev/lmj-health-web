import {
  Calendar,
  Check,
  Clock,
  Loader2,
  AlertCircle,
  X,
  Video,
  Search,
  Filter,
  Phone,
  UserX,
  XCircle,
  CheckCircle,
  Hospital,
} from 'lucide-react';
import {
  useAppointments,
  useDashboardStats,
  useCancelAppointment,
  useCompleteAppointment,
} from '@/hooks';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import BookAppointmentDialog from '@/components/doctor/appointments/book-appointment-dialog';
import AppointmentsEmptyState from '@/components/doctor/appointments/appointments-empty-state';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import CancelAppointmentDialog from '@/components/doctor/appointments/cancel-appointment-dialog';

export default function DoctorAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [bookOpen, setBookOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishTarget, setFinishTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmAbsenceOpen, setConfirmAbsenceOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);
  const [statusTab, setStatusTab] = useState<
    'scheduled' | 'completed' | 'cancelled' | 'absent'
  >('scheduled');

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch,
  } = useAppointments(1, 50, selectedDate, undefined, searchTerm);
  const { cancelAppointment, isLoading: cancelling } = useCancelAppointment();
  const { completeAppointment, isLoading: completing } =
    useCompleteAppointment();

  const todayAppointments = appointments.filter(
    (apt) => apt.date === selectedDate,
  );
  const otherPatients = appointments.filter((apt) => apt.date !== selectedDate);

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

  const visibleTodayAppointments = todayAppointments.filter((apt) => {
    if (statusTab === 'absent') return false;
    return apt.status === statusTab;
  });

  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment(id);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      await completeAppointment(id);
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
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
            await handleCancelAppointment(confirmTarget.id);
          }}
        />

        <ConfirmActionDialog
          open={confirmAbsenceOpen}
          onOpenChange={(open) => {
            setConfirmAbsenceOpen(open);
            if (!open) setConfirmTarget(null);
          }}
          title='تأكيد غياب المريض'
          description={
            <span>
              هل أنت متأكد من تسجيل غياب {confirmTarget?.patientName ?? ''} في
              موعده في {confirmTarget?.date ?? ''} الساعة{' '}
              {confirmTarget?.time ?? ''}؟
            </span>
          }
          confirmLabel='تأكيد'
          confirmDisabled={false}
          onConfirm={async () => {
            setConfirmAbsenceOpen(false);
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
            await handleCompleteAppointment(finishTarget.id);
          }}
        />

        <section className='mb-6 flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
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

        <section className='mb-6'>
          <div className='rounded-[6px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex gap-2 items-center px-6 py-4'>
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
                    scheduledCount
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
                    completedCount
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
                    cancelledCount
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

            <div className='px-6 py-4'>
              {appointmentsLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <Loader2 className='w-8 h-8 animate-spin text-primary' />
                </div>
              ) : todayAppointments.length === 0 ? (
                <AppointmentsEmptyState onBookClick={() => setBookOpen(true)} />
              ) : visibleTodayAppointments.length === 0 ? (
                <div className='py-12 text-center'>
                  <Calendar className='mx-auto h-12 w-12 text-gray-300' />
                  <p className='mt-3 font-cairo text-[14px] font-semibold text-[#667085]'>
                    لا توجد مواعيد ضمن هذا التبويب للتاريخ المحدد
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {visibleTodayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className='rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
                    >
                      <div className='px-6 pt-5'>
                        <div className='flex justify-between items-start'>
                          <div className='flex gap-3 items-start'>
                            <div className='flex h-[64px] w-[64px] items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_10px_20px_rgba(15, 143, 139,0.25)]'>
                              <span className='font-cairo text-[16px] font-extrabold'>
                                {appointment.patientInitials}
                              </span>
                            </div>

                            <div className='flex flex-col gap-1'>
                              <div className='font-cairo text-[18px] font-extrabold text-[#101828]'>
                                {appointment.patientName}
                              </div>
                              <div className='space-y-2'>
                                <div className='flex items-center justify-start gap-3 font-cairo text-[13px] font-bold text-[#667085]'>
                                  <span className='flex gap-1 items-center'>
                                    <Phone className='w-4 h-4' />
                                    0501234567
                                  </span>
                                  <span className='flex gap-1 items-center text-primary'>
                                    {appointment.type === 'video' ? (
                                      <Video className='w-4 h-4' />
                                    ) : (
                                      <Hospital className='w-4 h-4' />
                                    )}
                                    {appointment.type === 'video'
                                      ? 'أونلاين'
                                      : 'عيادة'}
                                  </span>
                                </div>
                                <div className='flex gap-2 items-center'>
                                  <div className='flex h-[36px] items-center gap-2 rounded-[6px] bg-[#EFFFFE] px-3 font-cairo text-[12px] font-extrabold text-primary'>
                                    <Calendar className='w-4 h-4' />
                                    {appointment.date}
                                  </div>
                                  <div className='flex h-[36px] items-center gap-2 rounded-[6px] bg-[#EFFFFE] px-3 font-cairo text-[12px] font-extrabold text-primary'>
                                    <Clock className='w-4 h-4' />
                                    {appointment.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='flex gap-3 items-center'>
                            <div className='flex flex-col gap-2 items-end'>
                              <div className='flex h-[24px] items-center justify-center rounded-[8px] bg-primary px-[8px] py-[2px] font-cairo text-[12px] leading-[16px] font-semibold text-[#FFFFFF]'>
                                مجدول
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='mt-4 h-[44px] w-full rounded-[6px] bg-[#F9FAFB] px-4 py-3 text-right font-cairo text-[14px] font-bold text-[#667085]'>
                          <span className='text-[#364153]'>السبب : </span>
                          {appointment.notes || 'السبب: فحص دوري'}
                        </div>
                      </div>

                      <div className='px-6 pt-4 pb-5'>
                        <div className='grid grid-cols-3 gap-3'>
                          <button
                            type='button'
                            onClick={() => {
                              setConfirmTarget({
                                id: appointment.id,
                                patientName: appointment.patientName,
                                date: appointment.date,
                                time: appointment.time,
                              });
                              setConfirmCancelOpen(true);
                            }}
                            disabled={cancelling}
                            className='flex h-[44px] items-center justify-center gap-2 rounded-[6px] border-[1.82px] border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#FF000C] disabled:opacity-50'
                          >
                            <X className='w-4 h-4' />
                            إلغاء
                          </button>

                          <button
                            type='button'
                            onClick={() => {
                              setConfirmTarget({
                                id: appointment.id,
                                patientName: appointment.patientName,
                                date: appointment.date,
                                time: appointment.time,
                              });
                              setConfirmAbsenceOpen(true);
                            }}
                            disabled={false}
                            className='flex h-[44px] items-center justify-center gap-2 rounded-[6px] border-[1.82px] border-[#F97316] bg-white font-cairo text-[14px] font-extrabold text-[#FF6900]'
                          >
                            <UserX className='w-4 h-4' />
                            غياب
                          </button>

                          <button
                            type='button'
                            onClick={() => {
                              setFinishTarget({
                                id: appointment.id,
                                patientName: appointment.patientName,
                              });
                              setFinishOpen(true);
                            }}
                            disabled={completing}
                            className='flex h-[44px] items-center justify-center gap-2 border-[1.82px] rounded-[6px] border-primary bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-50'
                          >
                            <Check className='w-4 h-4' />
                            إنهاء
                          </button>
                        </div>
                      </div>
                    </div>
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
