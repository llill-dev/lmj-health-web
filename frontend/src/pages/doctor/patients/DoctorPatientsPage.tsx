import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import DoctorPatientExpandableCard, {
  type DoctorPatientExpandableCardData,
} from '@/components/doctor/patients/doctor-patient-expandable-card';
import { useMemo, useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/ToastProvider';

type PatientFilter = 'all' | 'today' | 'upcoming' | 'active';

type PatientStatus = 'active' | 'inactive';

type PatientRow = DoctorPatientExpandableCardData & {
  status: PatientStatus;
  hasUpcomingAppointment: boolean;
};

const patientsSeed: PatientRow[] = [
  {
    id: '1',
    fileNo: '12345',
    name: 'محمد أحمد السالم',
    status: 'active',
    ageLabel: '45 سنة',
    genderLabel: 'ذكر',
    phone: '0501234567',
    lastVisit: '2026-02-10',
    lastVisitIso: '2026-02-10',
    hasUpcomingAppointment: true,
    weightKg: '80 كجم',
    heightCm: '175 سم',
    bloodPressure: '120/80',
    allergySummary: 'حساسية دوائية',
    sensitivities: ['البنسلين'],
    chronicConditions: ['السكري', 'الضغط'],
  },
  {
    id: '2',
    fileNo: '12346',
    name: 'فاطمة أحمد السالم',
    status: 'inactive',
    ageLabel: '30 سنة',
    genderLabel: 'أنثى',
    phone: '0509876543',
    lastVisit: 'لا توجد زيارات',
    lastVisitIso: '',
    hasUpcomingAppointment: false,
    weightKg: '62 كجم',
    heightCm: '162 سم',
    bloodPressure: '110/70',
    allergySummary: 'لا يوجد',
    sensitivities: [],
    chronicConditions: [],
  },
];

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DoctorPatientsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<PatientFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = patientsSeed.length;
  const activeCount = patientsSeed.filter((p) => p.status === 'active').length;
  const inactiveCount = patientsSeed.filter((p) => p.status === 'inactive').length;

  const visiblePatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let list = patientsSeed;

    if (filter === 'today') {
      const t = todayIso();
      list = list.filter((p) => p.lastVisitIso === t);
    } else if (filter === 'upcoming') {
      list = list.filter((p) => p.hasUpcomingAppointment);
    } else if (filter === 'active') {
      list = list.filter((p) => p.status === 'active');
    }

    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fileNo.includes(q) ||
        p.phone.replace(/\s/g, '').includes(q),
    );
  }, [searchTerm, filter]);

  const handleAddPatient = () => {
    toast('سيتم ربط «إضافة مريض جديد» بواجهة الخادم عند جاهزية المسار.', {
      title: 'قريباً',
      variant: 'info',
      durationMs: 4200,
    });
  };

  const tabClass = (key: PatientFilter) =>
    filter === key
      ? 'h-[34px] flex-1 rounded-[6px] bg-primary font-cairo text-[12px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.25)]'
      : 'h-[34px] flex-1 rounded-[6px] bg-[#F2F4F7] font-cairo text-[12px] font-extrabold text-[#667085]';

  return (
    <>
      <Helmet>
        <title>Patients • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <DoctorDashboardOverview
          variant='patients'
          surface='mint'
          title='إجمالي المرضى'
          subtitle={
            <span>
              <span className='font-extrabold text-primary'>{total}</span>
              <span className='text-primary/90'> — متابعة ملفات المرضى والزيارات</span>
            </span>
          }
          onActionClick={handleAddPatient}
          actionLabel='إضافة مريض جديد'
          kpis={[
            {
              key: 'active',
              icon: <UserCheck className='h-5 w-5 shrink-0' />,
              value: activeCount,
              label: 'نشط',
            },
            {
              key: 'inactive',
              icon: <UserX className='h-5 w-5 shrink-0' />,
              value: inactiveCount,
              label: 'غير نشط',
            },
          ]}
        />

        <section className='mb-5 rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='relative'>
            <Search className='absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='ابحث عن مريض...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-[6px] border border-[#E5E7EB] bg-white py-3 pl-4 pr-10 font-cairo text-[14px] font-semibold text-[#111827] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]/20'
            />
          </div>

          <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
            <button
              type='button'
              onClick={() => setFilter('all')}
              className={tabClass('all')}
            >
              الكل
            </button>
            <button
              type='button'
              onClick={() => setFilter('today')}
              className={tabClass('today')}
            >
              اليوم
            </button>
            <button
              type='button'
              onClick={() => setFilter('upcoming')}
              className={tabClass('upcoming')}
            >
              مواعيد قادمة
            </button>
            <button
              type='button'
              onClick={() => setFilter('active')}
              className={tabClass('active')}
            >
              نشط
            </button>
          </div>
        </section>

        <section className='space-y-3'>
          {visiblePatients.map((patient) => {
            const {
              status: _s,
              hasUpcomingAppointment: _h,
              ...cardPatient
            } = patient;
            return (
              <DoctorPatientExpandableCard
                key={patient.id}
                patient={cardPatient}
                expanded={expandedId === patient.id}
                onToggle={() =>
                  setExpandedId((cur) =>
                    cur === patient.id ? null : patient.id,
                  )
                }
                onStartConsultation={() =>
                  toast('سيتم ربط «بدء استشارة» بالخادم.', {
                    title: 'قريباً',
                    variant: 'info',
                    durationMs: 3800,
                  })
                }
                onStartVisit={() =>
                  toast('سيتم ربط «بدء زيارة» بالخادم.', {
                    title: 'قريباً',
                    variant: 'info',
                    durationMs: 3800,
                  })
                }
                onRequestAccess={() =>
                  toast('سيتم ربط «طلب وصول» للملف الطبي بالخادم.', {
                    title: 'قريباً',
                    variant: 'info',
                    durationMs: 3800,
                  })
                }
              />
            );
          })}

          {visiblePatients.length === 0 ? (
            <div className='rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-12 text-center font-cairo text-[14px] font-semibold text-[#667085]'>
              لا توجد مرضى مطابقون لهذا الفلتر أو البحث.
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
