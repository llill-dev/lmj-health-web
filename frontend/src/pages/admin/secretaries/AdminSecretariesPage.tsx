import { Helmet } from 'react-helmet-async';
import {
  Ban,
  ChevronLeft,
  Eye,
  Mail,
  Phone,
  Stethoscope,
  Users,
} from 'lucide-react';
import AdminSearchFiltersBar from '@/components/admin/AdminSearchFiltersBar';

type SecretaryStatus = 'نشط' | 'معلق' | 'موقوف';

type SecretaryCard = {
  name: string;
  roleLabel: string;
  doctorName: string;
  doctorSpecialty: string;
  email: string;
  phone: string;
  status: SecretaryStatus;
};

export default function AdminSecretariesPage() {
  const secretaries: SecretaryCard[] = [
    {
      name: 'فاطمة أحمد',
      roleLabel: 'سكرتير د. خالد عبدالله الشمري',
      doctorName: 'د. خالد عبدالله الشمري',
      doctorSpecialty: 'طب القلب',
      email: 'secretary1@example.com',
      phone: '+966501234567',
      status: 'نشط',
    },
    {
      name: 'نورة محمد',
      roleLabel: 'سكرتير د. سارة محمد القحطاني',
      doctorName: 'د. سارة محمد القحطاني',
      doctorSpecialty: 'طب الأطفال',
      email: 'secretary2@example.com',
      phone: '+966502345678',
      status: 'نشط',
    },
  ];

  const statusTone = (s: SecretaryStatus) => {
    if (s === 'نشط') return 'bg-[#16A34A] text-white';
    if (s === 'معلق') return 'bg-[#F59E0B] text-white';
    return 'bg-[#EF4444] text-white';
  };

  return (
    <>
      <Helmet>
        <title>إدارة السكرتارية • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة السكرتارية
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة ومراقبة حساب السكرتيرة
            </div>
          </div>
        </div>

        <AdminSearchFiltersBar
          queryPlaceholder='البحث عن سكرتير...'
          statusPlaceholder='جميع الحالات'
          statusOptions={[
            { label: 'نشط', value: 'active' },
            { label: 'معلق', value: 'suspended' },
            { label: 'موقوف', value: 'blocked' },
          ]}
          onChange={() => {}}
        />

        <section className='mt-5 space-y-5'>
          {secretaries.map((s) => (
            <div
              key={s.email}
              className='rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden'
            >
              <div className='flex'>
                <div className='flex-1 px-6 py-5'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white'>
                        <Users className='h-5 w-5' />
                      </div>
                      <div className='text-right'>
                        <div className='font-cairo text-[16px] font-black leading-[20px] text-[#111827]'>
                          {s.name}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                          {s.roleLabel}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <button
                        type='button'
                        className='flex h-[34px] w-[100px] items-center justify-center gap-2 rounded-[10px] border border-[#FB923C] bg-white font-cairo text-[12px] font-extrabold text-[#F97316]'
                      >
                        <Ban className='h-4 w-4' />
                        تعليق الحساب
                      </button>
                      <div
                        className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusTone(s.status)}`}
                      >
                        {s.status}
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-start gap-8'>
                    <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                      <Phone className='h-4 w-4 text-primary' />
                      {s.phone}
                    </div>
                    <div className='flex items-center justify-end gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                      <Mail className='h-4 w-4 text-primary' />
                      {s.email}
                    </div>
                  </div>

                  <div className='mt-4 rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] px-5 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-primary'>
                        <Stethoscope className='h-4 w-4' />
                        <div className='font-cairo text-[12px] font-extrabold'>
                          الطبيب المسؤول
                        </div>
                      </div>

                      <div className='text-right'>
                        <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                          {s.doctorName}
                        </div>
                        <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                          {s.doctorSpecialty}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-between'>
                    <div className='flex gap-2'>
                      {' '}
                      <button
                        type='button'
                        className='h-[30px] rounded-[8px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary'
                      >
                        إدارة المواعيد
                      </button>
                      <button
                        type='button'
                        className='h-[30px] rounded-[8px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary'
                      >
                        عرض المواعيد
                      </button>
                      <button
                        type='button'
                        className='h-[30px] rounded-[8px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary'
                      >
                        إلغاء المواعيد
                      </button>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        className='ms-auto flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-primary text-white'
                        aria-label='فتح ملف السكرتير'
                      >
                        <ChevronLeft className='h-5 w-5' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className='h-8' />
      </div>
    </>
  );
}
