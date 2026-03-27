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
} from 'lucide-react';
import { useState } from 'react';
import {
  ConfirmActionDialog,
  CancelAppointmentDialog,
} from '../../../components/admin/dialogs';
import AdminAppointmentDetailsDialog from '@/components/admin/dialogs/AdminAppointmentDetailsDialog';
import { adminApi } from '@/lib/admin/client';

type AppointmentStatus = 'مجدولة' | 'مكتملة' | 'عدم حضور' | 'ملغية';

type AppointmentCard = {
  id: string;
  status: AppointmentStatus;
  typeLabel: 'clinic';
  code: string;
  doctorName: string;
  date: string;
  patientName: string;
  time: string;
};

export default function AdminAppointmentsPage() {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [cancelAppointmentOpen, setCancelAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentCard | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const stats = [
    {
      title: 'ملغية',
      value: '0',
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
      value: '1',
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
      value: '2',
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
      value: '3',
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

  const appointments: AppointmentCard[] = [
    {
      id: '1',
      status: 'مجدولة',
      typeLabel: 'clinic',
      code: 'apt-1#',
      doctorName: 'د. خالد عبدالله الشمري',
      date: '2026-02-19',
      patientName: 'أحمد محمد العلي',
      time: '10:00',
    },
    {
      id: '2',
      status: 'مجدولة',
      typeLabel: 'clinic',
      code: 'apt-1b#',
      doctorName: 'د. خالد عبدالله الشمري',
      date: '2026-02-19',
      patientName: 'فاطمة أحمد السالم',
      time: '11:30',
    },
  ];

  const statusPill = (s: AppointmentStatus) => {
    if (s === 'مكتملة') return 'bg-[#DCFCE7] text-[#16A34A]';
    if (s === 'عدم حضور') return 'bg-[#F3F4F6] text-[#4B5563]';
    if (s === 'ملغية') return 'bg-[#FEF2F2] text-[#EF4444]';
    return 'bg-[#E0F2FE] text-[#0284C7]';
  };

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
              />
              <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
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
                5 نتيجة
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 space-y-4'>
          {appointments.map((a) => (
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
                        className={`flex gap-1 items-center h-[22px] rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusPill(a.status)}`}
                      >
                        <Clock className='h-3 w-3' />
                        {a.status}
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
                            {a.patientName}
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
                          {a.date}
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
          ))}
        </section>

        <ConfirmActionDialog
          open={confirmResetOpen}
          onOpenChange={setConfirmResetOpen}
          title='إعادة تعيين المواعيد'
          description='هل أنت متأكد من أنك تريد إعادة تعيين جميع المواعيد؟ هذا الإجراء لا يمكن التراجع عنه.'
          confirmLabel='إعادة تعيين'
          onConfirm={async () => {
            console.log('Reset appointments confirmed');
          }}
        />

        <CancelAppointmentDialog
          open={cancelAppointmentOpen}
          onOpenChange={setCancelAppointmentOpen}
          targetName={selectedAppointment?.patientName || ''}
          onConfirm={async (reason) => {
            if (!selectedAppointment?.id) return;
            await adminApi.appointments.cancel(selectedAppointment.id, reason);
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
