import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  CalendarDays,
  Eye,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';

type StatCardTone = {
  border: string;
  icon: string;
  iconBg: string;
  delta: string;
};

export default function AdminAnalyticsPage() {
  const statCards: Array<{
    id: string;
    title: string;
    value: string;
    delta: string;
    icon: any;
    tone: StatCardTone;
  }> = [
    {
      id: 'views',
      title: 'المشاهدات',
      value: '45.2K',
      delta: '٪22 عن الشهر الماضي',
      icon: Eye,
      tone: {
        border: 'border-[#86EFAC]',
        icon: 'text-[#16A34A]',
        iconBg: 'bg-[#DCFCE7]',
        delta: 'text-[#16A34A]',
      },
    },
    {
      id: 'published',
      title: 'المحتوى المنشور',
      value: '342',
      delta: '٪15 عن الشهر الماضي',
      icon: FileText,
      tone: {
        border: 'border-[#67E8F9]',
        icon: 'text-primary',
        iconBg: 'bg-[#E7FBFA]',
        delta: 'text-primary',
      },
    },
    {
      id: 'appointments',
      title: 'المواعيد الشهرية',
      value: '456',
      delta: '٪8 عن الشهر الماضي',
      icon: CalendarDays,
      tone: {
        border: 'border-[#86EFAC]',
        icon: 'text-[#16A34A]',
        iconBg: 'bg-[#DCFCE7]',
        delta: 'text-[#16A34A]',
      },
    },
    {
      id: 'users',
      title: 'إجمالي المستخدمين',
      value: '1,245',
      delta: '٪12 عن الشهر الماضي',
      icon: Users,
      tone: {
        border: 'border-[#67E8F9]',
        icon: 'text-primary',
        iconBg: 'bg-[#E7FBFA]',
        delta: 'text-primary',
      },
    },
  ];

  const doctorRows = [
    {
      id: 'd1',
      name: 'د. سارة محمود',
      specialty: 'القلب',
      appointments: 145,
      diagnoses: 132,
      rating: 4.9,
      completion: '91%',
    },
    {
      id: 'd2',
      name: 'د. أحمد حسين',
      specialty: 'الباطنة',
      appointments: 128,
      diagnoses: 118,
      rating: 4.7,
      completion: '92%',
    },
    {
      id: 'd3',
      name: 'د. نور الدين',
      specialty: 'الأطفال',
      appointments: 167,
      diagnoses: 155,
      rating: 4.8,
      completion: '93%',
    },
  ];

  return (
    <>
      <Helmet>
        <title>التحليلات • LMJ Health</title>
      </Helmet>

      <div className='space-y-4' dir='rtl' lang='ar'>
        <div className='text-right'>
          <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
            التحليلات والإحصائيات
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
            تحليلات شاملة لأداء المنصة
          </div>
        </div>

        <section className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`rounded-[12px] border bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone.border}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#667085]'>
                      {c.title}
                    </div>
                    <div className='mt-2 font-cairo text-[22px] font-black leading-[26px] text-[#111827]'>
                      {c.value}
                    </div>
                    <div className={`mt-2 font-cairo text-[11px] font-extrabold ${c.tone.delta}`}>
                      {c.delta}
                    </div>
                  </div>

                  <div
                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-[10px] ${c.tone.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${c.tone.icon}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between px-6 py-5'>
            <div className='inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
              تحليلات الأطباء
              <TrendingUp className='h-4 w-4 text-primary' />
            </div>
          </div>

          <div className='px-6 pb-6'>
            <div className='overflow-hidden rounded-[10px] border border-[#EEF2F6]'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-[#F9FAFB]'>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      الطبيب
                    </th>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      التخصص
                    </th>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      المواعيد
                    </th>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      التشخيصات
                    </th>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      التقييم
                    </th>
                    <th className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                      معدل الإكمال
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#EEF2F6]'>
                  {doctorRows.map((r) => (
                    <tr key={r.id} className='bg-white'>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                        {r.name}
                      </td>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-bold text-[#667085]'>
                        {r.specialty}
                      </td>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                        {r.appointments}
                      </td>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                        {r.diagnoses}
                      </td>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-primary'>
                        <span className='me-2'>★</span>
                        {r.rating}
                      </td>
                      <td className='px-4 py-4 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                        {r.completion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center justify-between'>
              <div className='inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                أداء النظام
                <TrendingUp className='h-4 w-4 text-primary' />
              </div>
            </div>

            <div className='mt-6 space-y-5'>
              <div>
                <div className='flex items-center justify-between'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    معدل إكمال المواعيد
                  </div>
                  <div className='font-cairo text-[12px] font-extrabold text-[#16A34A]'>
                    92%
                  </div>
                </div>
                <div className='mt-2 h-[10px] w-full rounded-full bg-[#EEF2F6]'>
                  <div className='h-[10px] w-[92%] rounded-full bg-[#22C55E]' />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    رضا المرضى
                  </div>
                  <div className='font-cairo text-[12px] font-extrabold text-primary'>
                    88%
                  </div>
                </div>
                <div className='mt-2 h-[10px] w-full rounded-full bg-[#EEF2F6]'>
                  <div className='h-[10px] w-[88%] rounded-full bg-primary' />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                    معدل المحافظة على المحتوى
                  </div>
                  <div className='font-cairo text-[12px] font-extrabold text-primary'>
                    94%
                  </div>
                </div>
                <div className='mt-2 h-[10px] w-full rounded-full bg-[#EEF2F6]'>
                  <div className='h-[10px] w-[94%] rounded-full bg-primary' />
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center justify-between'>
              <div className='inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
                نمو المستخدمين
                <BarChart3 className='h-4 w-4 text-primary' />
              </div>
            </div>

            <div className='mt-6 space-y-4'>
              <div className='flex items-center justify-between rounded-[10px] bg-[#E7FBFA] px-5 py-4'>
                <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  أطباء جدد
                </div>
                <div className='font-cairo text-[12px] font-black text-primary'>
                  +12
                </div>
              </div>

              <div className='flex items-center justify-between rounded-[10px] bg-[#ECFDF3] px-5 py-4'>
                <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  مرضى جدد
                </div>
                <div className='font-cairo text-[12px] font-black text-[#16A34A]'>
                  +89
                </div>
              </div>

              <div className='flex items-center justify-between rounded-[10px] bg-[#EFF6FF] px-5 py-4'>
                <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  سكرتارية جدد
                </div>
                <div className='font-cairo text-[12px] font-black text-primary'>
                  +5
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
