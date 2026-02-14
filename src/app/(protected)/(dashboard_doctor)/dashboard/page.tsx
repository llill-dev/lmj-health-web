'use client';

import {
  Calendar,
  Check,
  Clock,
  Users,
  TrendingUp,
  Plus,
  FileText,
  Loader2,
  AlertCircle,
  X,
  Video,
  MapPin,
} from 'lucide-react';
import {
  useAppointments,
  useDashboardStats,
  useCancelAppointment,
  useCompleteAppointment,
} from '@/hooks';
import { useState } from 'react';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );

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
      className='mx-auto w-full max-w-[1120px]'
    >
      {/* Appointments Overview: top KPI/stat cards */}
      <section className='grid grid-cols-4 gap-4'>
        <div className='border-b-[3.98px] border-[#16C5C0] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد اليوم
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EFFFFE]'>
              <Calendar className='h-[18px] w-[18px] text-[#16C5C0]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#EFFFFE] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#16C5C0]'>
              +12%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#2563EB] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                إجمالي المرضى
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EFF6FF]'>
              <Users className='h-[18px] w-[18px] text-[#2563EB]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#EFF6FF] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#2563EB]'>
              +8%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#16A34A] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد مكتملة
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                {statsLoading ? (
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                ) : (
                  stats?.completedAppointments || 0
                )}
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#ECFDF3]'>
              <Check className='h-[18px] w-[18px] text-[#16A34A]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#ECFDF3] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#16A34A]'>
              +15%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#F97316] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد معلقة
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF7ED]'>
              <Clock className='h-[18px] w-[18px] text-[#F97316]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#FFF7ED] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#F97316]'>
              +12%
            </span>
          </div>
        </div>
      </section>

      {/* Today's Appointments: list of upcoming appointments for the day */}
      <section className='mt-6 grid grid-cols-2 gap-4'>
        <div className='col-span-2 rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
              مواعيد اليوم
            </div>
            <div className='rounded-full bg-[#16C5C0] px-3 py-1 font-cairo text-[12px] font-extrabold text-white'>
              2 موعد
            </div>
          </div>

          <div className='px-6 py-4'>
            <div className='flex items-center justify-between rounded-[14px] border border-[#EEF2F6] bg-white px-4 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#16C5C0] text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'>
                  <span className='font-cairo text-[16px] font-extrabold'>
                    أ
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                    أحمد محمد العلي
                  </div>
                  <div className='mt-0.5 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    clinic
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='text-center'>
                  <div className='flex gap-2 items-center'>
                    <div className='text-[#16C5C0]'>
                      <Clock className='h-[14px] w-[14px] text-[#16C5C0]' />
                    </div>
                    <div className='font-cairo text-center text-[12px] font-bold text-[#16C5C0]'>
                      10:00
                    </div>
                  </div>
                  <div className='mt-1 flex items-center justify-end gap-2'>
                    <div className='flex h-[22px] items-center justify-center rounded-full border border-[#16C5C0] px-3 font-cairo text-[11px] font-extrabold text-[#16C5C0]'>
                      مجدول
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-4 flex items-center justify-between rounded-[14px] border border-[#EEF2F6] bg-white px-4 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#16C5C0] text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'>
                  <span className='font-cairo text-[16px] font-extrabold'>
                    ف
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                    فاطمة أحمد السالم
                  </div>
                  <div className='mt-0.5 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    video
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='text-center'>
                  <div className='flex gap-2 items-center'>
                    <div className='text-[#16C5C0]'>
                      <Clock className='h-[14px] w-[14px] text-[#16C5C0]' />
                    </div>
                    <div className='font-cairo text-center text-[12px] font-bold text-[#16C5C0]'>
                      11:30
                    </div>
                  </div>
                  <div className='mt-1 flex items-center justify-end gap-2'>
                    <div className='flex h-[22px] items-center justify-center rounded-full border border-[#16C5C0] px-3 font-cairo text-[11px] font-extrabold text-[#16C5C0]'>
                      مجدول
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Insights: compact summary cards (records, attendance, rating) */}
      <section className='grid grid-cols-3 gap-4  my-4'>
        <div className='h-[103.95px] col-span-1 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] '>
          <div className='flex items-center justify-start gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EFF6FF]'>
              <FileText className='h-[18px] w-[18px] text-[#2563EB]' />
            </div>
            <div className='text-right'>
              <div className='font-cairo text-[12px] font-bold text-[#98A2B3]'>
                السجلات الطبية
              </div>
              <div className='mt-1 font-cairo text-[18px] font-extrabold text-[#111827]'>
                6
              </div>
            </div>
          </div>
        </div>
        <div className='h-[103.95px] col-span-1 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] '>
          <div className='flex items-center justify-start gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F5F3FF]'>
              <Plus className='h-[18px] w-[18px] text-[#7C3AED]' />
            </div>
            <div className='text-right'>
              <div className='font-cairo text-[12px] font-bold text-[#98A2B3]'>
                نسبة الحضور
              </div>
              <div className='mt-1 font-cairo text-[18px] font-extrabold text-[#111827]'>
                94%
              </div>
            </div>
          </div>
        </div>

        <div className='h-[103.95px] col-span-1 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] '>
          <div className='flex items-center justify-start gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#ECFDF3]'>
              <TrendingUp className='h-[18px] w-[18px] text-[#16A34A]' />
            </div>
            <div className='text-right'>
              <div className='font-cairo text-[12px] font-bold text-[#98A2B3]'>
                التقييم
              </div>
              <div className='mt-1 font-cairo text-[18px] font-extrabold text-[#111827]'>
                4.9/5
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Patients: additional patients list with quick access to profile */}
      <section className='mt-6'>
        <div className='rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
              المرضى الآخرين
            </div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            <div className='flex items-center justify-between px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#16C5C0] text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'>
                  <span className='font-cairo text-[16px] font-extrabold'>
                    أ
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                    أحمد محمد العلي
                  </div>
                  <div className='mt-0.5 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    patient1@example.com
                  </div>
                </div>
              </div>

              <button
                type='button'
                className='h-[34px] rounded-[10px] border border-[#16C5C0] px-4 font-cairo text-[12px] font-extrabold text-[#16C5C0]'
              >
                عرض الملف
              </button>
            </div>

            <div className='flex items-center justify-between px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#16C5C0] text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'>
                  <span className='font-cairo text-[16px] font-extrabold'>
                    ف
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                    فاطمة أحمد السالم
                  </div>
                  <div className='mt-0.5 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    patient2@example.com
                  </div>
                </div>
              </div>

              <button
                type='button'
                className='h-[34px] rounded-[10px] border border-[#16C5C0] px-4 font-cairo text-[12px] font-extrabold text-[#16C5C0]'
              >
                عرض الملف
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
