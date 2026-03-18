import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft,
  Eye,
  Ban,
  Users,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Activity,
} from 'lucide-react';
import { Filter, Search } from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';

type PatientStatus = 'نشط' | 'معلق' | 'موقوف';

type PatientCard = {
  name: string;
  gender: string;
  phone: string;
  city: string;
  email: string;
  joinedAt: string;
  appointmentsCount: number;
  pendingAppointmentsCount: number;
  status: PatientStatus;
};

export default function AdminPatientsPage() {
  const patients: PatientCard[] = [
    {
      name: 'أحمد محمد العلي',
      gender: 'ذكر',
      phone: '+966501234567',
      city: 'دمشق سوريا',
      email: 'patient1@example.com',
      joinedAt: '1990-01-20',
      appointmentsCount: 3,
      pendingAppointmentsCount: 1,
      status: 'نشط',
    },
    {
      name: 'فاطمة أحمد السالم',
      gender: 'أنثى',
      phone: '+966502345678',
      city: 'دبي سوريا',
      email: 'patient2@example.com',
      joinedAt: '1990-05-10',
      appointmentsCount: 2,
      pendingAppointmentsCount: 0,
      status: 'نشط',
    },
  ];

  const statusTone = (s: PatientStatus) => {
    if (s === 'نشط') {
      return {
        chip: 'bg-[#16A34A] text-white',
      };
    }
    if (s === 'معلق') {
      return {
        chip: 'bg-[#F59E0B] text-white',
      };
    }
    return {
      chip: 'bg-[#EF4444] text-white',
    };
  };

  return (
    <>
      <Helmet>
        <title>إدارة المرضى • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة المرضى
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة ومراقبة حسابات المرضى
            </div>
          </div>
        </div>

        <AdminSearchFiltersBar
          queryPlaceholder='البحث عن مريض...'
          queryEndAdornment={<Search className='h-4 w-4' />}
          statusPlaceholder='جميع الحالات'
          statusOptions={[
            { label: 'نشط', value: 'active' },
            { label: 'معلق', value: 'suspended' },
            { label: 'موقوف', value: 'blocked' },
          ]}
          filtersLeading={
            <div className='flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#98A2B3]'>
              <Filter className='h-4 w-4' />
            </div>
          }
          onChange={() => {}}
        />

        <section className='mt-5 space-y-5'>
          {patients.map((p) => {
            const tone = statusTone(p.status);
            return (
              <div
                key={`${p.email}`}
                className='rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden'
              >
                <div className='flex'>
                  <div className='w-[190px] shrink-0 border-l border-[#EEF2F6] bg-white px-5 py-5'>
                    <div className='space-y-3'>
                      <button
                        type='button'
                        className='flex h-[34px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] font-cairo text-[12px] font-extrabold text-[#111827]'
                      >
                        <Eye className='h-4 w-4 text-[#667085]' />
                        عرض التفاصيل
                      </button>

                      <button
                        type='button'
                        className='flex h-[34px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#FB923C] bg-white font-cairo text-[12px] font-extrabold text-[#F97316]'
                      >
                        <Ban className='h-4 w-4' />
                        تعليق الحساب
                      </button>
                    </div>
                  </div>

                  <div className='flex-1 px-6 py-5'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <div className='flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-primary text-white'>
                          <Users className='h-6 w-6' />
                        </div>

                        <div className='text-right'>
                          <div className='font-cairo text-[16px] font-black leading-[20px] text-[#111827]'>
                            {p.name}
                          </div>
                          <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                            {p.gender}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div
                          className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${tone.chip}`}
                        >
                          {p.status}
                        </div>

                        <button
                          type='button'
                          className='flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-primary text-white'
                          aria-label='فتح ملف المريض'
                        >
                          <ChevronLeft className='h-5 w-5' />
                        </button>
                      </div>
                    </div>

                    <div className='mt-4 grid grid-cols-2 gap-x-10 gap-y-3'>
                      <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                        <Phone className='h-4 w-4 text-primary' />
                        {p.phone}
                      </div>
                      <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                        <Mail className='h-4 w-4 text-primary' />
                        {p.email}
                      </div>
                      <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                        <MapPin className='h-4 w-4 text-primary' />
                        {p.city}
                      </div>
                      <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                        <CalendarDays className='h-4 w-4 text-primary' />
                        {p.joinedAt}
                      </div>
                    </div>

                    <div className='mt-4 rounded-[10px] bg-[#F9FAFB] px-4 py-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#111827]'>
                          <Activity className='h-4 w-4 text-primary' />
                          {p.appointmentsCount} مواعيد
                          <span className='font-cairo text-[12px] font-bold text-[#98A2B3]'>
                            ({p.pendingAppointmentsCount} محتمل)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <div className='h-8' />
      </div>
    </>
  );
}
