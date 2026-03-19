import { Helmet } from 'react-helmet-async';
import {
  Activity,
  CalendarDays,
  FileText,
  Search,
  AlertTriangle,
  Users,
} from 'lucide-react';

type SystemLog = {
  id: string;
  action: string;
  actorName: string;
  actorRole: 'طبيب' | 'سكرتير' | 'مدير';
  createdAt: string;
  ip: string;
  details: string;
};

export default function AdminSystemLogsPage() {
  const stats = [
    {
      title: 'هذا الأسبوع',
      value: '892',
      icon: CalendarDays,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-gradient-to-br from-[#F0FDF4] to-white',
        iconFg: 'text-[#16A34A]',
        valueFg: 'text-[#16A34A]',
      },
    },
    {
      title: 'اليوم',
      value: '145',
      icon: FileText,
      tone: {
        border: 'border-[#67E8F9]',
        bg: 'bg-gradient-to-br from-[#ECFEFF] to-white',
        iconFg: 'text-primary',
        valueFg: 'text-primary',
      },
    },
    {
      title: 'مستخدمون نشطون',
      value: '87',
      icon: Users,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-gradient-to-br from-[#F0FDF4] to-white',
        iconFg: 'text-[#16A34A]',
        valueFg: 'text-[#16A34A]',
      },
    },
    {
      title: 'إجمالي الأنشطة',
      value: '2,340',
      icon: Activity,
      tone: {
        border: 'border-[#67E8F9]',
        bg: 'bg-gradient-to-br from-[#ECFEFF] to-white',
        iconFg: 'text-primary',
        valueFg: 'text-primary',
      },
    },
  ] as const;

  const logs: SystemLog[] = [
    {
      id: '1',
      action: 'تسجيل دخول',
      actorName: 'د. سارة محمود',
      actorRole: 'طبيب',
      createdAt: '2024-02-11 14:30:25',
      ip: '192.168.1.10',
      details: 'تسجيل دخول ناجح',
    },
    {
      id: '2',
      action: 'إنشاء موعد',
      actorName: 'أحمد السكرتير',
      actorRole: 'سكرتير',
      createdAt: '2024-02-11 14:25:10',
      ip: '192.168.1.15',
      details: 'موعد جديد للمريض محمد أحمد',
    },
    {
      id: '3',
      action: 'تحديث بيانات',
      actorName: 'مدير النظام',
      actorRole: 'مدير',
      createdAt: '2024-02-11 13:45:00',
      ip: '192.168.1.5',
      details: 'تحديث بيانات الطبيب أحمد حسن',
    },
    {
      id: '4',
      action: 'موافقة على محتوى',
      actorName: 'مدير النظام',
      actorRole: 'مدير',
      createdAt: '2024-02-11 12:30:15',
      ip: '192.168.1.5',
      details: 'الموافقة على مقالة "داء السكري"',
    },
    {
      id: '5',
      action: 'حذف سجل',
      actorName: 'د. أحمد حسن',
      actorRole: 'طبيب',
      createdAt: '2024-02-11 11:15:30',
      ip: '192.168.1.12',
      details: 'حذف سجل طبي قديم',
    },
  ];

  const actionPill = (action: string) => {
    return 'border border-[#E5E7EB] bg-white text-[#344054]';
  };

  const rolePill = (role: SystemLog['actorRole']) => {
    if (role === 'طبيب') return 'bg-[#E0F2FE] text-primary';
    if (role === 'سكرتير') return 'bg-[#ECFDF3] text-[#16A34A]';
    return 'bg-[#E7FBFA] text-primary';
  };

  return (
    <>
      <Helmet>
        <title>سجلات النظام • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
            سجلات النظام
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
            مراجعة جميع الأنشطة والحركات في النظام
          </div>
        </div>

        <section className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4'>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`h-[147px] rounded-[12px] border px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${s.tone.border} ${s.tone.bg}`}
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

                  <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-white'>
                    <Icon className={`h-6 w-6 ${s.tone.iconFg}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='border-b border-[#EEF2F6] px-6 py-5'>
            <div className='relative'>
              <input
                placeholder='بحث في السجلات...'
                className='h-[56px] w-full rounded-[12px] border border-[#EEF2F6] bg-white pe-14 ps-5 text-right font-cairo text-[13px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-5 w-5' />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-12 px-6 py-4 font-cairo text-[13px] font-extrabold text-[#667085]'>
            <div className='col-span-2 text-right'>الإجراء</div>
            <div className='col-span-3 text-right'>المستخدم</div>
            <div className='col-span-2 text-right'>الوقت</div>
            <div className='col-span-2 text-right'>IP Address</div>
            <div className='col-span-3 text-right'>التفاصيل</div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {logs.map((l) => (
              <div
                key={l.id}
                className='grid grid-cols-12 px-6 py-5'
              >
                <div className='col-span-2 flex items-center justify-start'>
                  <span
                    className={`inline-flex h-[22px] items-center rounded-full px-2 font-cairo text-[12px] font-extrabold ${actionPill(l.action)}`}
                  >
                    {l.action}
                  </span>
                </div>

                <div className='col-span-3 text-right'>
                  <div className='font-cairo text-[14px] font-black text-[#111827]'>
                    {l.actorName}
                  </div>
                  <div
                    className={`mt-2 inline-flex h-[22px] items-center rounded-full px-3 font-cairo text-[11px] font-extrabold ${rolePill(l.actorRole)}`}
                  >
                    {l.actorRole}
                  </div>
                </div>

                <div className='col-span-2 text-right font-cairo text-[12px] font-bold text-[#667085]'>
                  {l.createdAt}
                </div>

                <div className='col-span-2 text-right font-cairo text-[12px] font-bold text-[#667085]'>
                  {l.ip}
                </div>

                <div className='col-span-3 text-right'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    {l.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-6 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-4'>
          <div className='flex items-start justify-between gap-4'>
            <div className='text-right'>
              <div className='font-cairo text-[14px] font-black text-[#92400E]'>
                ملاحظة الخصوصية
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold leading-[18px] text-[#B45309]'>
                لا تتضمن سجلات التدقيق البيانات الحساسة للمرضى. يتم تتبع الأنشطة
                فقط للأغراض الأمنية والإدارية.
              </div>
            </div>
            <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FDE68A]'>
              <AlertTriangle className='h-5 w-5 text-[#B45309]' />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
