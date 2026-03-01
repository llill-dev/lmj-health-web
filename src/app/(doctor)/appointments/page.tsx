'use client';
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
import DoctorDashboardOverview from '@/components/doctor/doctor-dashboard-overview';
import BookAppointmentDialog from '@/components/doctor/book-appointment-dialog';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import CancelAppointmentDialog from '@/components/doctor/cancel-appointment-dialog';

export default function AppointmentsPage() {
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
          <AlertCircle className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-2 text-red-600'>فشل تحميل البيانات</p>
          <button
            onClick={() => refetch()}
            className='mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir='rtl'
      lang='ar'
      className='mx-auto w-full max-w-[1120px] px-4'
    >
      {/* Appointments Overview: top KPI/stat cards */}
      <DoctorDashboardOverview
        variant='appointments'
        title='إدارة المواعيد'
        subtitle='جدول المرضى والاستشارات'
        onActionClick={() => setBookOpen(true)}
        actionLabel='حجز موعد جديد'
        kpis={[
          {
            key: 'absent',
            icon: <Clock />,
            value: 2,
            label: 'غياب',
          },
          {
            key: 'completed',
            icon: <CheckCircle />,
            value: 1,
            label: 'غياب',
          },
          {
            key: 'cancelled',
            icon: <XCircle />,
            value: 0,
            label: 'غياب',
          },
          {
            key: 'noShow',
            icon: <UserX />,
            value: 0,
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

      {/* Search and Filter Bar */}
      <section className='mb-6 flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
        <div className='flex items-center gap-4 flex-1'>
          <div className='relative flex-1'>
            <Search className='absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='ابحث بالاسم أو رقم الهاتف...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-[6px] bg-[#FFFFFF] border border-[#E5E7EB] pr-10 pl-4 py-3 font-cairo text-[14px] placeholder:text-gray-400 focus:border-[#16C5C0] focus:outline-none focus:ring-2 focus:ring-[#16C5C0] focus:ring-opacity-20'
            />
          </div>
        </div>
      </section>

      {/* Today's Appointments: list of upcoming appointments for day */}
      <section className='mb-6'>
        <div className='rounded-[6px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center px-6 py-4 gap-2'>
            <button
              type='button'
              onClick={() => setStatusTab('scheduled')}
              className={
                statusTab === 'scheduled'
                  ? 'flex items-center gap-2 rounded-[6px] bg-[#16C5C0] px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
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
                  <Loader2 className='h-3 w-3 animate-spin' />
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
                  ? 'flex items-center gap-2 rounded-[6px] bg-[#16C5C0] px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
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
                  <Loader2 className='h-3 w-3 animate-spin' />
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
                  ? 'flex items-center gap-2 rounded-[6px] bg-[#16C5C0] px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
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
                  <Loader2 className='h-3 w-3 animate-spin' />
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
                  ? 'flex items-center gap-2 rounded-[6px] bg-[#16C5C0] px-4 py-2 font-cairo text-[13px] font-extrabold text-white'
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
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  absentCount
                )}
              </span>
            </button>
          </div>

          <div className='px-6 py-4'>
            {appointmentsLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-[#16C5C0]' />
              </div>
            ) : visibleTodayAppointments.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='mx-auto h-12 w-12 text-gray-300' />
                <p className='mt-2 font-cairo text-[14px] text-gray-500'>
                  لا توجد مواعيد اليوم
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
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-3'>
                          <div className='flex h-[64px] w-[64px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'>
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
                                <span className='flex items-center gap-1'>
                                  <Phone className='h-4 w-4' />
                                  0501234567
                                </span>
                                <span className='flex items-center gap-1 text-[#16C5C0]'>
                                  {appointment.type === 'video' ? (
                                    <Video className='h-4 w-4' />
                                  ) : (
                                    <Hospital className='h-4 w-4' />
                                  )}
                                  {appointment.type === 'video'
                                    ? 'أونلاين'
                                    : 'عيادة'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='flex h-[36px] items-center gap-2 rounded-[6px] bg-[#EFFFFE] px-3 font-cairo text-[12px] font-extrabold text-[#16C5C0]'>
                                  <Calendar className='h-4 w-4' />
                                  {appointment.date}
                                </div>
                                <div className='flex h-[36px] items-center gap-2 rounded-[6px] bg-[#EFFFFE] px-3 font-cairo text-[12px] font-extrabold text-[#16C5C0]'>
                                  <Clock className='h-4 w-4' />
                                  {appointment.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-3'>
                          <div className='flex flex-col items-end gap-2'>
                            <div className='flex h-[24px] items-center justify-center rounded-[8px] bg-[#16C5C0] px-[8px] py-[2px] font-cairo text-[12px] leading-[16px] font-semibold text-[#FFFFFF]'>
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

                    <div className='px-6 pb-5 pt-4'>
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
                          <X className='h-4 w-4' />
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
                          <UserX className='h-4 w-4' />
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
                          className='flex h-[44px] items-center justify-center gap-2 border-[1.82px] rounded-[6px] border-[#16C5C0] bg-[#16C5C0] font-cairo text-[14px] font-extrabold text-white disabled:opacity-50'
                        >
                          <Check className='h-4 w-4' />
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
  );
}
