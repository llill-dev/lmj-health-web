import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2,
  Clock,
  Ban,
  Stethoscope,
  Mail,
  Phone,
  BadgeCheck,
  ChevronLeft,
} from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';

type DoctorStatus = 'مرفوض' | 'معلّق' | 'مقبول' | 'إجمالي الأطباء';

type DoctorCard = {
  name: string;
  subtitle: string;
  code: string;
  email: string;
  phone: string;
  patients: number;
  schedule: number;
  vacations: number;
};

export default function AdminDoctorsPage() {
  const stats: Array<{
    title: DoctorStatus;
    value: number;
    icon: typeof Ban;
    tone: {
      border: string;
      bg: string;
      iconBg: string;
      iconColor: string;
      valueColor: string;
    };
  }> = [
    {
      title: 'مرفوض',
      value: 0,
      icon: Ban,
      tone: {
        border: 'border-[#FECACA]',
        bg: 'bg-[#FFF5F5]',
        iconBg: 'bg-[#FEE2E2]',
        iconColor: 'text-[#EF4444]',
        valueColor: 'text-[#EF4444]',
      },
    },
    {
      title: 'معلّق',
      value: 1,
      icon: Clock,
      tone: {
        border: 'border-[#E5E7EB]',
        bg: 'bg-white',
        iconBg: 'bg-[#F3F4F6]',
        iconColor: 'text-[#475467]',
        valueColor: 'text-[#111827]',
      },
    },
    {
      title: 'مقبول',
      value: 2,
      icon: CheckCircle2,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-[#F0FDF4]',
        iconBg: 'bg-[#DCFCE7]',
        iconColor: 'text-[#16A34A]',
        valueColor: 'text-[#16A34A]',
      },
    },
    {
      title: 'إجمالي الأطباء',
      value: 3,
      icon: Stethoscope,
      tone: {
        border: 'border-[#CFFAFE]',
        bg: 'bg-[#ECFEFF]',
        iconBg: 'bg-primary/15',
        iconColor: 'text-primary',
        valueColor: 'text-primary',
      },
    },
  ];

  const doctors: DoctorCard[] = [
    {
      name: 'د. خالد عبدالله الشمري',
      subtitle: 'طب الأطفال',
      code: 'MED - 12345',
      email: 'doctor1@example.com',
      phone: '+966503456789',
      patients: 2,
      schedule: 1,
      vacations: 0,
    },
    {
      name: 'د. سارة محمد القحطاني',
      subtitle: 'طب الأطفال',
      code: 'MED - 23456',
      email: 'doctor2@example.com',
      phone: '+966504557890',
      patients: 1,
      schedule: 0,
      vacations: 1,
    },
    {
      name: 'د. عمر حسن البلوي',
      subtitle: 'طب الأطفال',
      code: 'MED - 34567',
      email: 'doctor3@example.com',
      phone: '+966505678901',
      patients: 1,
      schedule: 0,
      vacations: 0,
    },
    {
      name: 'د. منى خالد التميمي',
      subtitle: 'طب الأطفال',
      code: 'MED - 45678',
      email: 'doctor4@example.com',
      phone: '+966509012345',
      patients: 0,
      schedule: 0,
      vacations: 0,
    },
    {
      name: 'د. يوسف سعيد العنزي',
      subtitle: 'طب الأطفال',
      code: 'MED - 56789',
      email: 'doctor5@example.com',
      phone: '+966510123456',
      patients: 0,
      schedule: 0,
      vacations: 0,
    },
  ];

  return (
    <>
      <Helmet>
        <title>إدارة الأطباء • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة الأطباء
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة ومتابعة بيانات الأطباء
            </div>
          </div>
        </div>

        <section className='mt-6 grid grid-cols-4 gap-5'>
          {stats.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`flex items-center justify-between rounded-[12px] border px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone.border} ${c.tone.bg}`}
              >
                <div className='text-right'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    {c.title}
                  </div>
                  <div
                    className={`mt-2 font-cairo text-[22px] font-black leading-[22px] ${c.tone.valueColor}`}
                  >
                    {c.value}
                  </div>
                </div>

                <div
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] ${c.tone.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${c.tone.iconColor}`} />
                </div>
              </div>
            );
          })}
        </section>

        <AdminSearchFiltersBar
          queryPlaceholder='ابحث عن طبيب...'
          specialtyPlaceholder='الاختصاص'
          specialtyOptions={[
            { label: 'طب الأطفال', value: 'pediatrics' },
            { label: 'طب الأسرة', value: 'family' },
          ]}
          statusPlaceholder='الحالة'
          statusOptions={[
            { label: 'مقبول', value: 'approved' },
            { label: 'معلّق', value: 'pending' },
            { label: 'مرفوض', value: 'rejected' },
          ]}
          onChange={() => {}}
        />

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex items-center gap-2'>
              <BadgeCheck className='h-4 w-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                قائمة الأطباء ({doctors.length})
              </div>
            </div>
          </div>

          <div className='space-y-4 p-6'>
            {doctors.map((d) => (
              <div
                key={d.code}
                className='rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden'
              >
                <div className='flex'>
                  <div className='flex-1 px-5 py-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-2'>
                        <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-[18px] font-bold text-white'>
                          {d.name.charAt(3)}
                        </div>
                        <div className='text-right'>
                          <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                            {d.name}
                          </div>
                          <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                            {d.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex mt-5 justify-between'>
                      <div className='flex flex-wrap items-center gap-4 text-[#98A2B3]'>
                        <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                          <BadgeCheck className='h-4 w-4 text-primary' />
                          {d.code}
                        </div>
                        <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                          <Mail className='h-4 w-4 text-primary' />
                          {d.email}
                        </div>
                        <div className='inline-flex items-center gap-2 font-cairo text-[11px] font-bold'>
                          <Phone className='h-4 w-4 text-primary' />
                          {d.phone}
                        </div>
                      </div>
                    </div>
                    <div className='mt-4 grid grid-cols-3 gap-3'>
                      <div className='rounded-[10px] bg-[#F9FAFB] px-4 py-3 text-center'>
                        <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                          المرضى
                        </div>
                        <div className='mt-1 font-cairo text-[14px] font-black text-[#2563EB]'>
                          {d.patients}
                        </div>
                      </div>
                      <div className='rounded-[10px] bg-[#F9FAFB] px-4 py-3 text-center'>
                        <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                          مواعيده
                        </div>
                        <div className='mt-1 font-cairo text-[14px] font-black text-[#16A34A]'>
                          {d.schedule}
                        </div>
                      </div>
                      <div className='rounded-[10px] bg-[#F9FAFB] px-4 py-3 text-center'>
                        <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                          إجازاته
                        </div>
                        <div className='mt-1 font-cairo text-[14px] font-black text-[#111827]'>
                          {d.vacations}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type='button'
                    className='flex w-[54px] shrink-0 items-center justify-center bg-primary text-white'
                    aria-label='فتح ملف الطبيب'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className='h-8' />
      </div>
    </>
  );
}
