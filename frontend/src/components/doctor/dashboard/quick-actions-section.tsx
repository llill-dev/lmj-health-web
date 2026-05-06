'use client';

import {
  BookMarked,
  BookOpen,
  CalendarPlus,
  MessageSquare,
  Search,
  UsersRound,
} from 'lucide-react';

import DashboardSectionHeading from '@/components/doctor/dashboard/dashboard-section-heading';

const quickActions = [
  {
    id: 'start-visit',
    title: 'بدء زيارة',
    description: 'الكشوفات الطبيه',
    icon: CalendarPlus,
  },
  {
    id: 'start-consultation',
    title: 'بدء استشارة',
    description: 'المحادثات الخاصه بالمرضى',
    icon: MessageSquare,
  },
  {
    id: 'search-patient',
    title: 'بحث عن مريض',
    description: 'البحث عن المرضى',
    icon: Search,
  },
  {
    id: 'add-patient',
    title: 'اضافة مريض',
    description: 'اضافة مريض جديد',
    icon: UsersRound,
  },
  {
    id: 'medical-library',
    title: 'مكتبتي الطبية',
    description: 'تجمع الأدوية والتحاليل والإجراءات',
    icon: BookOpen,
  },
  {
    id: 'medical-services-guide',
    title: 'دليل الخدمات الطبية',
    description: 'للوصول للخدمات المتاحة',
    icon: BookMarked,
  },
];

export default function QuickActionsSection() {
  return (
    <section className='mt-6'>
      <DashboardSectionHeading title='الإجراءات السريعة' className='mb-[22px]' />

      <div className='grid grid-cols-6 justify-items-center gap-5'>
        {quickActions.map((action) => (
          <article
            key={action.id}
            className='flex max-h-[160px] w-full  flex-col items-center rounded-[10px] border-[0.5px] border-[#078F8D] bg-[#E6F6F6] px-4 py-4 text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)]'
          >
            <div className='flex px-[8px] py-[5px] h-[40px] w-[43px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.28)]'>
              <action.icon className='h-full w-full'  aria-hidden />
            </div>

            <h3 className='mt-3 font-cairo text-[16px] font-bold leading-[24px] text-primary'>
              {action.title}
            </h3>

            <p className='mt-3 font-cairo text-[14px] font-medium leading-[16px] text-[#4A5565]'>
              {action.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
