'use client';

import {
  BookMarked,
  BookOpen,
  CalendarPlus,
  MessageSquare,
  Search,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import DashboardSectionHeading from '@/components/doctor/dashboard/dashboard-section-heading';

const quickActions = [
  {
    id: 'start-visit',
    title: 'بدء زيارة',
    description: 'الكشوفات الطبيه',
    icon: CalendarPlus,
    href: '/doctor/encounters',
  },
  {
    id: 'start-consultation',
    title: 'بدء استشارة',
    description: 'المحادثات الخاصه بالمرضى',
    icon: MessageSquare,
    href: '/doctor/online-consultations',
  },
  {
    id: 'search-patient',
    title: 'بحث عن مريض',
    description: 'البحث عن المرضى',
    icon: Search,
    href: '/doctor/patients',
  },
  {
    id: 'add-patient',
    title: 'اضافة مريض',
    description: 'اضافة مريض جديد',
    icon: UsersRound,
    href: '/doctor/patients',
  },
  {
    id: 'medical-library',
    title: 'مكتبتي الطبية',
    description: 'تجمع الأدوية والتحاليل والإجراءات',
    icon: BookOpen,
    href: '/doctor/medical-requests',
  },
  {
    id: 'medical-services-guide',
    title: 'دليل الخدمات الطبية',
    description: 'للوصول للخدمات المتاحة',
    icon: BookMarked,
    href: '/doctor/medical-services-directory',
  },
];

export default function QuickActionsSection() {
  return (
    <section className='mt-6'>
      <DashboardSectionHeading title='الإجراءات السريعة' className='mb-[22px]' />

      <div className='grid grid-cols-6 justify-items-center gap-5'>
        {quickActions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className='flex max-h-[160px] w-full flex-col items-center rounded-[10px] border-[0.5px] border-[#078F8D] bg-[#E6F6F6] px-4 py-4 text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:border-primary hover:shadow-[0_12px_24px_rgba(15,143,139,0.12)]'
          >
            <div className='flex h-[40px] w-[43px] items-center justify-center rounded-[10px] bg-primary px-[8px] py-[5px] text-white shadow-[0_14px_28px_rgba(15,143,139,0.28)]'>
              <action.icon className='h-full w-full' aria-hidden />
            </div>

            <h3 className='mt-3 font-cairo text-[16px] font-bold leading-[24px] text-primary'>
              {action.title}
            </h3>

            <p className='mt-3 font-cairo text-[14px] font-medium leading-[16px] text-[#4A5565]'>
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
