import { Helmet } from 'react-helmet-async';
import {
  Building2,
  ClipboardList,
  FlaskConical,
  Hospital,
  Phone,
  Search,
  Stethoscope,
  MapPin,
  Clock,
  Pill,
  X,
  Pencil,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ServiceKind = 'المشافي' | 'المخابر' | 'الصيدليات' | 'مراكز الأشعة' | 'التخصصات';

type ServiceTag = {
  id: string;
  label: string;
};

type ServiceItem = {
  id: string;
  kind: Exclude<ServiceKind, 'التخصصات'>;
  name: string;
  city: string;
  phone: string;
  is24h: boolean;
  tags: ServiceTag[];
};

export default function AdminServicesPage() {
  const tabs: Array<{ label: ServiceKind; count: number; icon: any }> = [
    { label: 'المشافي', count: 1, icon: Hospital },
    { label: 'المخابر', count: 1, icon: FlaskConical },
    { label: 'الصيدليات', count: 1, icon: Pill },
    { label: 'مراكز الأشعة', count: 1, icon: Building2 },
    { label: 'التخصصات', count: 2, icon: Stethoscope },
  ];

  const [activeTab, setActiveTab] = useState<ServiceKind>('المشافي');

  const items: ServiceItem[] = [
    {
      id: '1',
      kind: 'المشافي',
      name: 'مستشفى القلب التخصصي',
      city: 'سوريا، دمشق',
      phone: '+966 11 464 2722',
      is24h: true,
      tags: [
        { id: 't1', label: 'القلب' },
        { id: 't2', label: 'الاورام' },
        { id: 't3', label: 'الأطفال' },
        { id: 't4', label: 'الجراحة' },
      ],
    },
  ];

  const visibleItems = useMemo(() => {
    if (activeTab === 'التخصصات') return [];
    return items.filter((i) => i.kind === activeTab);
  }, [activeTab, items]);

  return (
    <>
      <Helmet>
        <title>دليل الخدمات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة دليل الخدمات
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة الجهات الصحية المتاحة للمرضى
            </div>
          </div>

          <button
            type='button'
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
          >
            <ClipboardList className='h-4 w-4' />
            إضافة جديد
          </button>
        </div>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between gap-4'>
            <div className='relative w-full'>
              <input
                placeholder='ابحث...'
                className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
            </div>
            <div className='flex flex-1 items-center justify-center gap-2'>
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.label;
                return (
                  <button
                    key={t.label}
                    type='button'
                    onClick={() => setActiveTab(t.label)}
                    className={
                      active
                        ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                        : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
                    }
                  >
                    <Icon
                      className={
                        active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-[#667085]'
                      }
                    />
                    <span>{t.label}</span>
                    <span className='inline-flex min-w-[22px] items-center justify-center rounded-[8px] bg-white/90 px-2 font-cairo text-[11px] font-black text-primary'>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className='mt-6'>
          {visibleItems.map((it) => (
            <div
              key={it.id}
              className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'>
                    <Hospital className='h-5 w-5' />
                  </div>
                  <div className='text-right'>
                    <div className='font-cairo text-[16px] font-black text-[#111827]'>
                      {it.name}
                    </div>

                    <div className='mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                      <div className='inline-flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-primary' />
                        {it.city}
                      </div>
                      <div className='inline-flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-primary' />
                        {it.phone}
                      </div>
                      <div className='inline-flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-primary' />
                        {it.is24h ? '24 ساعة' : 'دوام جزئي'}
                      </div>
                    </div>

                    <div className='mt-8 flex flex-wrap items-center justify-start gap-2'>
                      {it.tags.map((t) => (
                        <span
                          key={t.id}
                          className='inline-flex h-[24px] items-center rounded-[10px] bg-[#E7FBFA] px-3 font-cairo text-[12px] font-extrabold text-primary'
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2 pt-1'>
                  <button
                    type='button'
                    className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#FEE2E2] bg-white text-[#EF4444]'
                    aria-label='حذف'
                  >
                    <X className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    className='flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#D1FAE5] bg-white text-primary'
                    aria-label='تعديل'
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'التخصصات' ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              <div className='mx-auto max-w-[520px] text-center'>
                <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                  لا توجد عناصر لعرضها
                </div>
                <div className='mt-2 font-cairo text-[12px] font-semibold leading-[18px] text-[#98A2B3]'>
                  اختر تبويب آخر لعرض العناصر
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
