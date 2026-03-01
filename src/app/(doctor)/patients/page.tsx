import {
  CalendarDays,
  ChevronDown,
  Clock,
  FileText,
  Heart,
  PhoneCall,
  Search,
  Users,
} from 'lucide-react';

type PatientStatus = 'active' | 'inactive';

type Patient = {
  id: string;
  name: string;
  initials: string;
  status: PatientStatus;
  statusLabel: string;
  ageLabel: string;
  bloodType: string;
  visits: number;
  records: number;
  phone: string;
  lastVisit: string;
};

const patients: Patient[] = [
  {
    id: '1',
    name: 'أحمد محمد العلي',
    initials: 'أ',
    status: 'inactive',
    statusLabel: 'غير نشط',
    ageLabel: '30 سنة',
    bloodType: 'A+',
    visits: 1,
    records: 1,
    phone: '+966501234567',
    lastVisit: '2024-12-10',
  },
  {
    id: '2',
    name: 'فاطمة أحمد السالم',
    initials: 'ف',
    status: 'inactive',
    statusLabel: 'غير نشط',
    ageLabel: '30 سنة',
    bloodType: 'A+',
    visits: 0,
    records: 1,
    phone: '+966502345678',
    lastVisit: 'لا توجد زيارات',
  },
];

export default function PatientsPage() {
  return (
    <div dir='rtl' lang='ar' className='mx-auto w-full max-w-[1120px]'>
      <section className='rounded-[16px] bg-[#16C5C0] px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-white/15'>
              <Users className='h-[18px] w-[18px] text-white' />
            </div>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold leading-[18px] text-white/90'>
                إجمالي المرضى
              </div>
              <div className='mt-1 font-cairo text-[28px] font-extrabold leading-[28px] text-white'>
                2
              </div>
            </div>
          </div>

          <div className='grid w-[520px] grid-cols-2 gap-4'>
            <div className='rounded-[6px] bg-white/15 px-5 py-4'>
              <div className='flex items-center justify-between'>
                <div className='font-cairo text-[12px] font-bold text-white/90'>
                  غير نشط
                </div>
                <div className='font-cairo text-[14px] font-extrabold text-white'>
                  0
                </div>
              </div>
            </div>
            <div className='rounded-[6px] bg-white/15 px-5 py-4'>
              <div className='flex items-center justify-between'>
                <div className='font-cairo text-[12px] font-bold text-white/90'>
                  نشط
                </div>
                <div className='font-cairo text-[14px] font-extrabold text-white'>
                  0
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
        <div className='relative'>
          <input
            type='text'
            placeholder='ابحث عن مريض...'
            className='h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]'
          />
          <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
            <Search className='h-[18px] w-[18px]' />
          </div>
        </div>

        <div className='mt-3 grid grid-cols-3 gap-3'>
          <button
            type='button'
            className='h-[34px] rounded-[6px] bg-[#16C5C0] font-cairo text-[12px] font-extrabold text-white shadow-[0_14px_24px_rgba(22,197,192,0.25)]'
          >
            الكل
          </button>
          <button
            type='button'
            className='h-[34px] rounded-[6px] bg-[#F2F4F7] font-cairo text-[12px] font-extrabold text-[#667085]'
          >
            نشط
          </button>
          <button
            type='button'
            className='h-[34px] rounded-[6px] bg-[#F2F4F7] font-cairo text-[12px] font-extrabold text-[#667085]'
          >
            غير نشط
          </button>
        </div>
      </section>

      <section className='mt-6 space-y-5'>
        {patients.map((patient) => {
          const statusPillClass =
            patient.status === 'active'
              ? 'bg-[#ECFDF3] text-[#16A34A]'
              : 'bg-[#F2F4F7] text-[#667085]';

          return (
            <div
              key={patient.id}
              className='rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.10)]'
            >
              <div className='flex items-start justify-between px-6 pb-4 pt-5'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_12px_25px_rgba(22,197,192,0.35)]'>
                    <span className='font-cairo text-[18px] font-extrabold leading-none'>
                      {patient.initials}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='font-cairo text-[16px] font-extrabold leading-[20px] text-[#111827]'>
                      {patient.name}
                    </div>
                    <div className='mt-2 flex items-center gap-2'>
                      <span
                        className={`inline-flex h-[24px] items-center justify-center rounded-full px-3 font-cairo text-[11px] font-extrabold ${statusPillClass}`}
                      >
                        {patient.statusLabel}
                      </span>
                      <span className='text-[#6A7282] text-[12px] leading-[16px]'>
                        {patient.ageLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    className='flex h-9 w-9  text-[#667085]'
                    aria-label='فتح'
                  >
                    <ChevronDown className='h-5 w-5' />
                  </button>
                </div>
              </div>

              <div className='px-6 pb-4'>
                <div className='grid grid-cols-3 gap-3'>
                  <div className='rounded-[6px] bg-[#EFFFFE] px-4 py-3 text-center'>
                    <Heart className='mx-auto h-[18px] w-[18px] text-[#16C5C0]' />
                    <div className='mt-1 font-cairo text-[14px] font-extrabold text-[#16C5C0]'>
                      {patient.bloodType}
                    </div>
                    <div className='mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                      الفصيلة
                    </div>
                  </div>

                  <div className='rounded-[6px] bg-[#F0FDF4] px-4 py-3 text-center'>
                    <CalendarDays className='mx-auto h-[18px] w-[18px] text-[#16A34A]' />
                    <div className='mt-1 font-cairo text-[14px] font-extrabold text-[#16A34A]'>
                      {patient.visits}
                    </div>
                    <div className='mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                      زيارة
                    </div>
                  </div>

                  <div className='rounded-[6px] bg-[#EFF6FF] px-4 py-3 text-center'>
                    <FileText className='mx-auto h-[18px] w-[18px] text-[#2563EB]' />
                    <div className='mt-1 font-cairo text-[14px] font-extrabold text-[#2563EB]'>
                      {patient.records}
                    </div>
                    <div className='mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                      سجل
                    </div>
                  </div>
                </div>

                <div className='mt-4 rounded-[6px] bg-[#F9FAFB] px-4 py-3'>
                  <div className='flex flex-col gap-1 items-start justify-start'>
                    <div className='flex items-center gap-2 text-[#667085]'>
                      <PhoneCall className='h-4 w-4' />
                      <div
                        dir='ltr'
                        className='font-cairo text-[12px] font-bold'
                      >
                        {patient.phone}
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-[#667085]'>
                      <Clock className='h-4 w-4' />
                      <div>
                        {' '}
                        <div className='font-cairo text-[12px] font-bold'>
                          آخر زيارة
                        </div>
                        <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                          {patient.lastVisit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <button
                    type='button'
                    className='flex h-[42px] items-center justify-center gap-2 rounded-[6px] border border-[#16C5C0] bg-white font-cairo text-[13px] font-extrabold text-[#16C5C0]'
                  >
                    <CalendarDays className='h-4 w-4' />
                    موعد جديد
                  </button>
                  <button
                    type='button'
                    className='flex h-[42px] items-center justify-center gap-2 rounded-[6px] bg-[#16C5C0] font-cairo text-[13px] font-extrabold text-white shadow-[0_18px_40px_rgba(22,197,192,0.28)]'
                  >
                    <FileText className='h-4 w-4' />
                    السجلات
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
