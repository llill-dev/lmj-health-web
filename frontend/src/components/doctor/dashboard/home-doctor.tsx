'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  useDashboardPatientsSearch,
  useDashboardStats,
  useDoctorAppointmentsApi,
  useDoctorHomeSnapshot,
  useDoctorProfile,
  useDoctorSelfRating,
} from '@/hooks';
import ActiveConsultationsSection from '@/components/doctor/dashboard/active-consultations-section';
import ConsultationsWaitingSection from '@/components/doctor/dashboard/consultations-waiting-section';
import DiagnosisAnalyticsSection from '@/components/doctor/dashboard/diagnosis-analytics-section';
import QuickActionsSection from '@/components/doctor/dashboard/quick-actions-section';
import {
  DashboardPatientsSearchCard,
  DashboardPatientsTable,
} from '@/components/doctor/dashboard/dashboard-patients-section';
import { DoctorDashboardSkeleton } from '@/components/doctor/shared/skeletons';

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
      className='min-h-[180px] max-w-[500px] rounded-[16px] border border-[#E7EDF5] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]'
      style={{ borderBottomWidth: '4px', borderBottomColor: accent }}
    >
      <div className='flex justify-between items-start gap-5'>
        <div className='space-y-4 text-right'>
          <div className='font-cairo text-[16px] font-bold leading-[20px] text-[#243044]'>
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
  const patientsSearch = useDashboardPatientsSearch();

  const {
    stats,
    isAwaitingData: statsAwaiting,
    error: statsError,
  } = useDashboardStats();
  const {
    data: snapshotData,
    isAwaitingData: snapshotAwaiting,
    error: snapshotError,
  } = useDoctorHomeSnapshot();
  const {
    appointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useDoctorAppointmentsApi({
    page: 1,
    limit: 50,
    date: selectedDate,
  });
  const profileQuery = useDoctorProfile();
  const ratingQuery = useDoctorSelfRating({
    doctorId: profileQuery.data?.doctor?._id,
    searchHint:
      profileQuery.data?.doctor?.user?.email ??
      profileQuery.data?.doctor?.user?.phone ??
      null,
  });

  const snapshot = snapshotData?.snapshot;
  const refetch = () => {
    void refetchAppointments();
  };

  const isInitialLoading = statsAwaiting || snapshotAwaiting;

  if (isInitialLoading) {
    return <DoctorDashboardSkeleton />;
  }

  if (statsError || appointmentsError || snapshotError) {
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
      value: snapshot?.counts?.appointments ?? stats?.todayAppointments ?? 0,
      delta: `${snapshot?.counts?.appointments ?? 0} مجدول`,
      icon: Calendar,
      accent: '#129A98',
      soft: '#E9F7F6',
      iconColor: '#129A98',
    },
    {
      key: 'consultations',
      label: 'استشارات تحتاج متابعة',
      value: snapshot?.counts?.consultations ?? 0,
      delta: `${snapshot?.counts?.consultations ?? 0} نشطة`,
      icon: Users,
      accent: '#2D74F5',
      soft: '#EAF1FF',
      iconColor: '#2D74F5',
    },
    {
      key: 'waitlist',
      label: 'قائمة الانتظار',
      value: snapshot?.counts?.waitlist ?? 0,
      delta: `${snapshot?.counts?.waitlist ?? 0} طلب`,
      icon: Check,
      accent: '#22C55E',
      soft: '#EAFBF0',
      iconColor: '#22C55E',
    },
    {
      key: 'access',
      label: 'طلبات وصول معلّقة',
      value: snapshot?.pendingAccessRequestAlert?.count ?? 0,
      delta: `${snapshot?.pendingAccessRequestAlert?.count ?? 0} جديد`,
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

  const ratingValue =
    ratingQuery.data?.averageRating != null
      ? `${ratingQuery.data.averageRating.toFixed(1)}/5`
      : '—';
  const attendanceValue =
    stats?.attendanceRate != null ? `${stats.attendanceRate}%` : '—';

  return (
    <div dir='rtl' lang='ar' className='space-y-7 pb-8'>
      <section className='grid gap-12 md:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((card) => (
          <KpiStatCard
            key={card.key}
            label={card.label}
            value={card.value}
            delta={card.delta}
            icon={card.icon}
            accent={card.accent}
            soft={card.soft}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <QuickActionsSection />

      <section className='grid items-start gap-6 xl:grid-cols-2'>
        <ActiveConsultationsSection
          subject={
            typeof snapshot?.activeConsultation?.subject === 'string'
              ? snapshot.activeConsultation.subject
              : undefined
          }
          patientName={
            typeof snapshot?.activeConsultation?.patientSummary === 'object' &&
            snapshot.activeConsultation.patientSummary &&
            typeof (snapshot.activeConsultation.patientSummary as {
              userId?: { fullName?: string };
            }).userId?.fullName === 'string'
              ? (snapshot.activeConsultation.patientSummary as {
                  userId: { fullName: string };
                }).userId.fullName
              : undefined
          }
        />
        <ConsultationsWaitingSection
          patientName={snapshot?.nearestWaitlistRequest?.patientName as
            | string
            | undefined}
        />
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <DiagnosisAnalyticsSection />
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
        <DashboardPatientsSearchCard {...patientsSearch} />
      </section>

      <DashboardPatientsTable {...patientsSearch} />

      <div className='grid gap-8 md:grid-cols-3'>
        {[
          {
            key: 'rating',
            label: 'التقييم',
            value: ratingValue,
            icon: TrendingUp,
            iconClass: 'bg-[#ECFDF3] text-[#22C55E]',
          },
          {
            key: 'attendance',
            label: 'نسبة الحضور',
            value: attendanceValue,
            icon: Activity,
            iconClass: 'bg-[#F4EBFF] text-[#A855F7]',
          },
          {
            key: 'records',
            label: 'السجلات الطبية',
            value: `${stats?.totalMedicalRecords ?? 0}`,
            icon: FileText,
            iconClass: 'bg-[#EAF1FF] text-[#3B82F6]',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className='rounded-[10px] bg-[#FFFFFF] px-8 py-8 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_0px_rgba(0,0,0,0.10)]'
            >
              <div className='flex items-center justify-between'>
                <div className='text-right'>
                  <div className='font-cairo text-[22px] font-black text-[#243044]'>
                    {card.value}
                  </div>
                  <div className='mt-2 font-cairo text-[18px] font-semibold text-[#98A2B3]'>
                    {card.label}
                  </div>
                </div>
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-[16px] ${card.iconClass}`}
                >
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
