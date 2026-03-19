import { Helmet } from 'react-helmet-async';
import {
  Check,
  Search,
  ShieldCheck,
  MapPin,
  Stethoscope,
  X,
  CalendarDays,
  Users,
  UserCog,
  AlertCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { useMemo } from 'react';

export default function AdminVerificationRequestsPage() {
  const stats = [
    {
      title: 'إجمالي الأطباء',
      subtitle: '0 نشط',
      value: '5',
      tone: {
        border: 'border-[#E5E7EB]',
        chip: 'bg-[#F2F4F7] text-[#667085]',
        iconBg: 'bg-primary',
        valueFg: 'text-[#111827]',
      },
      icon: Stethoscope,
    },
    {
      title: 'إجمالي المرضى',
      subtitle: '2 مضاف',
      value: '2',
      tone: {
        border: 'border-[#E5E7EB]',
        chip: 'bg-[#E7FBFA] text-primary',
        iconBg: 'bg-primary',
        valueFg: 'text-[#111827]',
      },
      icon: Users,
    },
    {
      title: 'السكرتارية',
      subtitle: 'نشط',
      value: '0',
      tone: {
        border: 'border-[#E5E7EB]',
        chip: 'bg-[#F2F4F7] text-[#667085]',
        iconBg: 'bg-primary',
        valueFg: 'text-[#111827]',
      },
      icon: UserCog,
    },
    {
      title: 'إجمالي المواعيد',
      subtitle: '2 اليوم',
      value: '5',
      tone: {
        border: 'border-[#E5E7EB]',
        chip: 'bg-[#E7FBFA] text-primary',
        iconBg: 'bg-primary',
        valueFg: 'text-[#111827]',
      },
      icon: CalendarDays,
    },
  ] as const;

  const locationRequests = useMemo(
    () => [
      {
        id: 'l1',
        doctor: 'د. أحمد محمد',
        address: 'سوريا، دمشق، شارع العابد',
        city: 'الجندليات',
        lat: '24.7136',
        lng: '46.6753',
      },
      {
        id: 'l2',
        doctor: 'د. فاطمة علي',
        address: 'سوريا، حمص، حي الزهراء',
        city: 'الجندليات',
        lat: '21.5433',
        lng: '39.1728',
      },
    ],
    [],
  );

  return (
    <>
      <Helmet>
        <title>طلبات التحقق • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            إدارة الطلبات
          </div>
        </div>

        <section className='mt-6 rounded-[12px] border border-[#F7D7B6] bg-[#FFF7ED] px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-[#F97316]'>
                <AlertCircle className='h-6 w-6 text-white' />
              </div>
              <div className='text-right'>
                <div className='font-cairo text-[14px] font-black text-[#9A3412]'>
                  يوجد طلبات تحتاج لمراجعة:
                </div>
                <div className='mt-2 inline-flex h-[24px] items-center rounded-[8px] bg-[#F97316] px-3 font-cairo text-[12px] font-extrabold text-white'>
                  2 مواقع بإنتظار التحقق
                </div>
              </div>
            </div>

            <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-[#F97316]'>
              <AlertCircle className='h-6 w-6 text-white' />
            </div>
          </div>
        </section>

        <section className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4'>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`rounded-[12px] border bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${s.tone.border}`}
              >
                <div className='flex items-start justify-between'>
                  <div
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-[10px] ${s.tone.iconBg}`}
                  >
                    <Icon className='h-6 w-6 text-white' />
                  </div>
                  <div className='inline-flex h-[22px] items-center rounded-[8px] px-3 font-cairo text-[11px] font-extrabold '>
                    <span
                      className={
                        s.tone.chip +
                        ' inline-flex h-[22px] items-center rounded-[8px] px-3'
                      }
                    >
                      {s.subtitle}
                    </span>
                  </div>
                </div>

                <div className='mt-4 text-right'>
                  <div
                    className={`font-cairo text-[26px] font-black leading-[28px] ${s.tone.valueFg}`}
                  >
                    {s.value}
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-bold text-[#667085]'>
                    {s.title}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-primary'>
                <MapPin className='h-5 w-5 text-white' />
              </div>
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                مواقع بإنتظار التحقق
              </div>
            </div>
            <div className='flex h-[32px] items-center rounded-[8px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'>
              {locationRequests.length} موقع
            </div>
          </div>

          <div className='px-6 py-6'>
            <div className='space-y-6'>
              {locationRequests.map((r) => (
                <div
                  key={r.id}
                  className='rounded-[12px] border border-[#D1E9FF] bg-white p-5'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-[46px] w-[46px] items-center justify-center rounded-[10px] bg-primary'>
                        <MapPin className='h-6 w-6 text-white' />
                      </div>
                      <div className='text-right'>
                        <div className='font-cairo text-[14px] font-black text-[#111827]'>
                          {r.doctor}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-bold text-[#667085]'>
                          {r.address}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                          {r.city}
                        </div>
                      </div>
                    </div>
                    <div className='flex h-[22px] items-center gap-2 rounded-[6px] bg-primary px-3 font-cairo text-[11px] text-white'>
                      <Clock className='w-3 h-3' />
                      معلق
                    </div>
                  </div>

                  <div className='mt-5 rounded-[12px] bg-[#F2F4F7] px-4 py-10' />

                  <div className='mt-4 text-right font-mono text-[12px] font-semibold text-[#98A2B3]'>
                    Lat: {r.lat}, Lng: {r.lng}
                  </div>

                  <div className='mt-4 flex flex-wrap items-center justify-start gap-3'>
                    <button
                      type='button'
                      className='inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-[#00C950] px-5 font-cairo text-[12px] font-extrabold text-white'
                    >
                      <CheckCheck className='h-4 w-4' />
                      قبول الموقع
                    </button>
                    <button
                      type='button'
                      className='inline-flex h-[34px] items-center gap-2 rounded-[8px] border-[1.82px] border-[#FCA5A5] bg-white px-5 font-cairo text-[12px] font-extrabold text-[#EF4444]'
                    >
                      <X className='h-4 w-4' />
                      رفض
                    </button>
                    <button
                      type='button'
                      className='inline-flex h-[34px] items-center gap-2 rounded-[8px] border-[1.82px] border-primary bg-white px-5 font-cairo text-[12px] font-extrabold text-primary'
                    >
                      <MapPin className='h-4 w-4' />
                      عرض الخريطة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
