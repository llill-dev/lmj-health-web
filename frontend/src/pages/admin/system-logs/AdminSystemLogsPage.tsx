import { Helmet } from 'react-helmet-async';
import {
  Activity,
  Search,
  ShieldCheck,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type LogLevel = 'نجاح' | 'تحذير' | 'خطأ';

type SystemLog = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  level: LogLevel;
};

export default function AdminSystemLogsPage() {
  const stats = [
    {
      title: 'إجمالي السجلات',
      value: '1,245',
      icon: Activity,
      tone: {
        border: 'border-[#E5E7EB]',
        bg: 'bg-white',
        iconBg: 'bg-[#F2FFFE]',
        iconFg: 'text-primary',
        valueFg: 'text-primary',
      },
    },
    {
      title: 'نجاح',
      value: '1,210',
      icon: CheckCircle2,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-[#F0FDF4]',
        iconBg: 'bg-[#16A34A]',
        iconFg: 'text-white',
        valueFg: 'text-[#16A34A]',
      },
    },
    {
      title: 'تحذير',
      value: '25',
      icon: AlertTriangle,
      tone: {
        border: 'border-[#FDE68A]',
        bg: 'bg-[#FFFBEB]',
        iconBg: 'bg-[#F0B100]',
        iconFg: 'text-white',
        valueFg: 'text-[#D97706]',
      },
    },
    {
      title: 'خطأ',
      value: '10',
      icon: ShieldCheck,
      tone: {
        border: 'border-[#FECACA]',
        bg: 'bg-[#FEF2F2]',
        iconBg: 'bg-[#EF4444]',
        iconFg: 'text-white',
        valueFg: 'text-[#EF4444]',
      },
    },
  ] as const;

  const logs: SystemLog[] = [
    {
      id: '1',
      action: 'تسجيل دخول المدير',
      actor: 'admin@lmjhealth.com',
      createdAt: '2026-02-19 10:15',
      level: 'نجاح',
    },
    {
      id: '2',
      action: 'تعديل نوع خدمة: العيادات',
      actor: 'admin@lmjhealth.com',
      createdAt: '2026-02-19 11:02',
      level: 'تحذير',
    },
    {
      id: '3',
      action: 'فشل محاولة تسجيل دخول',
      actor: 'unknown',
      createdAt: '2026-02-19 11:30',
      level: 'خطأ',
    },
  ];

  const levelPill = (l: LogLevel) => {
    if (l === 'نجاح') return 'bg-[#DCFCE7] text-[#16A34A]';
    if (l === 'تحذير') return 'bg-[#FFFBEB] text-[#D97706]';
    return 'bg-[#FEF2F2] text-[#EF4444]';
  };

  return (
    <>
      <Helmet>
        <title>سجلات النظام • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            سجلات النظام
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
            متابعة نشاطات النظام والأحداث
          </div>
        </div>

        <section className='mt-6 grid grid-cols-4 gap-4'>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`h-[92px] rounded-[12px] border px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${s.tone.border} ${s.tone.bg}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {s.title}
                    </div>
                    <div
                      className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${s.tone.valueFg}`}
                    >
                      {s.value}
                    </div>
                  </div>

                  <div
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] ${s.tone.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${s.tone.iconFg}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between gap-4'>
            <div className='font-cairo text-[12px] font-bold text-[#667085]'>
              {logs.length} سجل
            </div>

            <div className='relative flex-1'>
              <input
                placeholder='بحث في السجلات...'
                className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex items-center gap-2'>
              <Activity className='h-4 w-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                السجلات
              </div>
            </div>
          </div>

          <div className='grid grid-cols-12 border-b border-[#EEF2F6] px-6 py-3 font-cairo text-[12px] font-extrabold text-[#667085]'>
            <div className='col-span-5 text-right'>الإجراء</div>
            <div className='col-span-3 text-right'>المستخدم</div>
            <div className='col-span-2 text-right'>الوقت</div>
            <div className='col-span-2 text-right'>الحالة</div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {logs.map((l) => (
              <div
                key={l.id}
                className='grid grid-cols-12 items-center px-6 py-4'
              >
                <div className='col-span-5 text-right font-cairo text-[12px] font-bold text-[#111827]'>
                  {l.action}
                </div>
                <div className='col-span-3 text-right font-cairo text-[12px] font-bold text-[#667085]'>
                  <span className='inline-flex items-center gap-2'>
                    <User className='h-4 w-4 text-primary' />
                    {l.actor}
                  </span>
                </div>
                <div className='col-span-2 text-right font-cairo text-[12px] font-bold text-[#667085]'>
                  <span className='inline-flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primary' />
                    {l.createdAt}
                  </span>
                </div>
                <div className='col-span-2 text-right'>
                  <span
                    className={`inline-flex h-[22px] items-center rounded-[8px] px-3 font-cairo text-[11px] font-extrabold ${levelPill(l.level)}`}
                  >
                    {l.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
