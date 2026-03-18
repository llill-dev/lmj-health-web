import { Helmet } from 'react-helmet-async';
import {
  CalendarDays,
  Users,
  Stethoscope,
  UserCheck,
  Bell,
  FileText,
  ClipboardList,
  X,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              لوحة التحكم الرئيسية
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              نظرة عامة شاملة على النظام وإدارة النشاط
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {['اليوم', 'الأسبوع', 'الشهر', 'السنة'].map((t, idx) => (
              <button
                key={idx}
                type='button'
                className={
                  t === 'الشهر'
                    ? 'h-[34px] rounded-[8px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_18px_rgba(15,143,139,0.25)]'
                    : 'h-[34px] rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]'
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <section className='mt-6 grid grid-cols-4 gap-5'>
          {[
            {
              title: 'طلبات الوصول المعلّقة',
              value: '1',
              icon: UserCheck,
              badge: 'معلّق',
            },
            {
              title: 'عدد المواعيد (الشهر)',
              value: '2',
              icon: CalendarDays,
              badge: '+18%',
            },
            { title: 'إجمالي عدد الأطباء', value: '5', icon: Stethoscope, badge: '+12%' },
            { title: 'إجمالي عدد المرضى', value: '2', icon: Users, badge: '+24%' },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className='relative overflow-hidden rounded-[12px] bg-primary px-5 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
              >
                <div className='flex items-start justify-between'>
                  <div className='inline-flex h-[26px] items-center justify-center rounded-full bg-white/15 px-3 font-cairo text-[11px] font-extrabold text-white'>
                    {c.badge}
                  </div>
                  <div className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white/12'>
                    <Icon className='h-[18px] w-[18px] text-white' />
                  </div>
                </div>

                <div className='mt-6 font-cairo text-[34px] font-extrabold leading-[34px] text-white'>
                  {c.value}
                </div>
                <div className='mt-2 font-cairo text-[12px] font-semibold text-white/85'>
                  {c.title}
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 grid grid-cols-3 gap-5'>
          {[
            {
              title: 'إشعارات غير مقروءة',
              value: '2',
              icon: Bell,
              tone: 'border-[#FECACA] bg-[#FFF7F7] text-[#111827]',
              iconBg: 'bg-[#FEE2E2]',
              iconColor: 'text-[#EF4444]',
            },
            {
              title: 'الملفات المنشورة',
              value: '45',
              icon: FileText,
              tone: 'border-[#CFFAFE] bg-white text-[#111827]',
              iconBg: 'bg-[#ECFEFF]',
              iconColor: 'text-primary',
            },
            {
              title: 'الندوات المنشورة',
              value: '25',
              icon: ClipboardList,
              tone: 'border-[#CFFAFE] bg-white text-[#111827]',
              iconBg: 'bg-[#ECFEFF]',
              iconColor: 'text-primary',
            },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className={`rounded-[12px] border px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone}`}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='font-cairo text-[26px] font-extrabold leading-[26px]'>
                      {c.value}
                    </div>
                    <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      {c.title}
                    </div>
                  </div>
                  <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-[12px] ${c.iconBg}`}>
                    <Icon className={`h-[18px] w-[18px] ${c.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div>
              <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                آخر الأنشطة
              </div>
              <div className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                Recent Activity
              </div>
            </div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className='flex items-center justify-between px-6 py-4'>
                <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  {idx === 0
                    ? 'منذ 5 دقائق'
                    : idx === 1
                      ? 'منذ 15 دقيقة'
                      : idx === 2
                        ? 'منذ 30 دقيقة'
                        : 'منذ ساعة'}
                </div>

                <div className='flex items-center gap-3'>
                  <div className='text-right'>
                    <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {idx === 0
                        ? 'د. خالد السمري'
                        : idx === 1
                          ? 'أحمد محمد العلي'
                          : idx === 2
                            ? 'د. فاطمة السالم'
                            : 'محمد علي الحسني'}
                    </div>
                    <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      {idx === 0
                        ? 'إضافة موعد جديد'
                        : idx === 1
                          ? 'سجل دخول للنظام'
                          : idx === 2
                            ? 'طلب الوصول للسجل الطبي'
                            : 'إلغاء موعد'}
                    </div>
                  </div>

                  <div
                    className={
                      idx === 0
                        ? 'flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#ECFDF3]'
                        : idx === 1
                          ? 'flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#EFF6FF]'
                          : idx === 2
                            ? 'flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FFF7ED]'
                            : 'flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FEF2F2]'
                    }
                  >
                    {idx === 0 ? (
                      <CalendarDays className='h-4 w-4 text-[#16A34A]' />
                    ) : idx === 1 ? (
                      <Users className='h-4 w-4 text-[#2563EB]' />
                    ) : idx === 2 ? (
                      <FileText className='h-4 w-4 text-[#F97316]' />
                    ) : (
                      <X className='h-4 w-4 text-[#EF4444]' />
                    )}
                  </div>
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
