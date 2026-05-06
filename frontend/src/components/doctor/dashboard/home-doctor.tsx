'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useAppointments, useDashboardStats } from '@/hooks';
import ActiveConsultationsSection from '@/components/doctor/dashboard/active-consultations-section';
import ConsultationsWaitingSection from '@/components/doctor/dashboard/consultations-waiting-section';
import QuickActionsSection from '@/components/doctor/dashboard/quick-actions-section';

type KpiCard = {
  key: string;
  label: string;
  value: number;
  delta: string;
  icon: typeof Calendar;
  accent: string;
  soft: string;
  iconColor: string;
};

function KpiStatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  soft,
  iconColor,
}: KpiCard) {
  return (
    <article
      className='min-h-[180px] max-w-[245px] rounded-[16px] border border-[#E7EDF5] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]'
      style={{ borderBottomWidth: '4px', borderBottomColor: accent }}
    >
      <div className='flex items-start justify-between gap-5'>
        <div className='space-y-4 text-right'>
          <div className='font-cairo font-bold text-[16px] leading-[20px] text-[#243044]'>
            {label}
          </div>
          <div className='font-cairo text-[30px] font-bold leading-none text-[#1F2937]'>
            {value}
          </div>
        </div>
                <div
          className='flex h-[56px] w-[56px] items-center justify-center rounded-[6px]'
          style={{ backgroundColor: soft, color: iconColor }}
        >
          <Icon className='h-8 w-8' />
        </div>
      </div>

      <div className='mt-[34px] flex justify-start'>
        <span
          className='inline-flex items-center rounded-[10px] px-3 py-1.5 font-cairo text-[13px] font-black'
          style={{ backgroundColor: soft, color: iconColor }}
        >
          {delta}
        </span>
      </div>
    </article>
  );
}

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]'>
      <header className='border-b border-[#EDF2F7] px-8 py-9'>
        <h2 className='text-right font-cairo text-[23px] font-black leading-none text-[#243044]'>
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export default function HomeDoctor() {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeStatus, setActiveStatus] = useState('الكل');
  const searchTerm = '';

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    appointments,
    error: appointmentsError,
    refetch,
  } = useAppointments(1, 50, selectedDate, undefined, searchTerm);

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

  const kpis: KpiCard[] = [
    {
      key: 'today',
      label: 'مواعيد اليوم',
      value: stats?.todayAppointments ?? 2,
      delta: '↑ +12%',
      icon: Calendar,
      accent: '#129A98',
      soft: '#E9F7F6',
      iconColor: '#129A98',
    },
    {
      key: 'patients',
      label: 'إجمالي المرضى',
      value: stats?.totalPatients ?? 2,
      delta: '↑ +8%',
      icon: Users,
      accent: '#2D74F5',
      soft: '#EAF1FF',
      iconColor: '#2D74F5',
    },
    {
      key: 'completed',
      label: 'مواعيد مكتملة',
      value: stats?.completedAppointments ?? 0,
      delta: '↑ +15%',
      icon: Check,
      accent: '#22C55E',
      soft: '#EAFBF0',
      iconColor: '#22C55E',
    },
    {
      key: 'pending',
      label: 'مواعيد معلقة',
      value: stats?.pendingAppointments ?? 2,
      delta: '↑ +12%',
      icon: Clock,
      accent: '#FF6A00',
      soft: '#FFF2E8',
      iconColor: '#FF6A00',
    },
  ];

  const todayRows = appointments.slice(0, 2).map((row) => ({
    time: row.time,
    name: row.patientName,
    mode: row.type,
    initial: row.patientInitials,
  }));

  return (
    <div dir='rtl' lang='ar' className='space-y-7 pb-8'>
      <section className='grid gap-12 md:grid-cols-2 2xl:grid-cols-4'>
        {kpis.map((card) => (
          <KpiStatCard key={card.key} {...card} />
        ))}
      </section>

      <QuickActionsSection />

      <section className='grid items-start gap-6 xl:grid-cols-2'>
        <ActiveConsultationsSection />
        <ConsultationsWaitingSection />
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <SurfaceSection title='مواعيد اليوم'>
          <div className='space-y-4 px-5 py-6'>
            {todayRows.length > 0 ? (
              todayRows.map((row) => (
                <article
                  key={`${row.time}-${row.name}`}
                  className='flex items-center justify-between rounded-[16px] bg-[#F8FAFC] px-4 py-4'
                >
                  <div className='flex items-center gap-4'>
                                        <div className='flex h-[45px] w-[45px] items-center justify-center rounded-[10px] bg-primary text-white'>
                      <span className='font-cairo text-[20px] font-black'>
                        {row.initial}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='font-cairo text-[18px] font-black text-[#243044]'>
                        {row.name}
                      </div>
                      <div className='font-cairo text-[14px] font-medium lowercase text-[#98A2B3]'>
                        {row.mode}
                      </div>
                    </div>
                  </div>
                                <div className='text-left'>
                    <div className='font-cairo text-[18px] font-black text-[#243044]'>
                      {row.time}
                    </div>
                    <div className='mt-2 inline-flex rounded-[8px] bg-[#DDF4F1] px-3 py-1 font-cairo text-[13px] font-black text-primary'>
                      مجدول
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className='flex min-h-[250px] items-center justify-center rounded-[18px] border border-dashed border-[#D8E2EE] bg-[#FBFDFE] px-6 text-center font-cairo text-[15px] font-semibold leading-7 text-[#8A94A6]'>
                لا توجد مواعيد مجدولة لهذا اليوم بعد.
              </div>
            )}
          </div>
        </SurfaceSection>
                <SurfaceSection title='المرضى'>
          <div className='px-5 py-6'>
            <div className='relative'>
              <input
                placeholder='بحث...'
                className='h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
            </div>

            <div className='mt-5 flex min-h-[270px] flex-col justify-between rounded-[18px] bg-[#E3F6F8] px-6 py-6'>
              <div className='text-right font-cairo text-[16px] font-bold text-[#A3B2BF]'>
                نشاط المواعيد - آخر 7 أيام
              </div>

              <div>
                <div className='mt-8 flex items-end justify-between gap-3'>
                  {[
                    { day: 'الثلاثاء', h: 24 },
                    { day: 'الأربعاء', h: 24 },
                    { day: 'الخميس', h: 24 },
                    { day: 'الجمعة', h: 24 },
                    { day: 'السبت', h: 24 },
                    { day: 'الأحد', h: 24 },
                    { day: 'الاثنين', h: 24 },
                  ].map((item) => (
                    <div key={item.day} className='flex flex-1 flex-col items-center gap-3'>
                      <div
                        className='w-full max-w-[52px] rounded-t-[16px] bg-primary'
                        style={{ height: `${item.h}px` }}
                      />
                      <div className='font-cairo text-[13px] font-bold text-[#9AA9B5]'>
                        {item.day}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-4 text-center font-cairo text-[13px] font-semibold text-[#9AA9B5]'>
                  متوسط: 0 موعد/يوم
                </div>
              </div>
            </div>
          </div>
        </SurfaceSection>
      </section>

      <section className='overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]'>
        <div className='flex flex-col gap-4 border-b border-[#EEF2F6] px-8 py-6 lg:flex-row lg:items-center lg:justify-between'>
          <h2 className='text-right font-cairo text-[23px] font-black text-[#243044]'>
            المرضى
          </h2>

          <div className='flex flex-wrap items-center gap-2'>
            {['الكل', 'اليوم', 'نشط', 'القادم'].reverse().map((status) => (
              <button
                key={status}
                type='button'
                onClick={() => setActiveStatus(status)}
                className={`h-[42px] rounded-[10px] border px-5 font-cairo text-[15px] font-black transition-colors ${
                  activeStatus === status
                    ? 'border-primary bg-primary text-white'
                    : 'border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F8FAFC]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className='border-b border-[#EEF2F6] px-8 py-4'>
          <div className='grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]'>
            <div className='col-span-4'>اسم المريض</div>
            <div className='col-span-3'>رقم الهاتف</div>
            <div className='col-span-2'>آخر زيارة</div>
            <div className='col-span-1'>الحالة</div>
            <div className='col-span-2'>الإجراءات</div>
          </div>
        </div>

        {[0, 1].map((idx) => (
          <div
            key={idx}
            className='grid grid-cols-12 items-center gap-4 border-b border-[#EEF2F6] px-8 py-5 last:border-b-0'
          >
            <div className='col-span-4 flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]'>
                <span className='font-cairo text-[20px] font-black'>
                  {idx === 0 ? 'أ' : 'ف'}
                </span>
              </div>
              <div className='text-right'>
                <div className='font-cairo text-[18px] font-black text-[#243044]'>
                  {idx === 0 ? 'أحمد محمد' : 'فاطمة أحمد'}
                </div>
                <div className='font-cairo text-[14px] font-semibold text-[#98A2B3]'>
                  {idx === 0 ? 'patient1@example.com' : 'patient2@example.com'}
                </div>
              </div>
            </div>

            <div className='col-span-3 font-cairo text-[16px] font-bold text-[#243044]'>
              {idx === 0 ? '+966501234567' : '+966502345678'}
            </div>
            <div className='col-span-2 font-cairo text-[16px] font-extrabold text-[#243044]'>
              2024-12-10
            </div>
            <div className='col-span-1'>
              <span className='inline-flex rounded-[8px] bg-[#ECFDF3] px-3 py-1.5 font-cairo text-[13px] font-black text-[#16A34A]'>
                نشط
              </span>
            </div>
            <div className='col-span-2 text-left'>
              <button
                type='button'
                className='inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]'
              >
                عرض التفاصيل
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        ))}
      </section>
              <div className="grid gap-8  md:grid-cols-3">
          {[
            {
              key: 'rating',
              label: 'التقييم',
              value: '4.9/5',
              icon: TrendingUp,
              iconClass: 'bg-[#ECFDF3] text-[#22C55E]',
            },
            {
              key: 'attendance',
              label: 'نسبة الحضور',
              value: '94%',
              icon: Activity,
              iconClass: 'bg-[#F4EBFF] text-[#A855F7]',
            },
            {
              key: 'records',
              label: 'السجلات الطبية',
              value: `${stats?.totalMedicalRecords ?? 6}`,
              icon: FileText,
              iconClass: 'bg-[#EAF1FF] text-[#3B82F6]',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className='bg-white px-8 py-8 rounded-[10px] bg-[#FFFFFF]  shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_0px_rgba(0,0,0,0.10)]'>
                <div className='flex items-center justify-between'>
                  <div className='text-right'>
                    <div className='font-cairo text-[22px] font-black text-[#243044]'>
                      {card.value}
                    </div>
                    <div className='mt-2 font-cairo text-[18px] font-semibold text-[#98A2B3]'>
                      {card.label}
                    </div>
                  </div>
                               <div className={`flex h-16 w-16 items-center justify-center rounded-[16px] ${card.iconClass}`}>
                    <Icon className='h-8 w-8' />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}
