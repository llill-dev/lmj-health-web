import { Helmet } from 'react-helmet-async';
import { Eye, Plus, TrendingUp, Newspaper } from 'lucide-react';

export default function AdminMedicalNewsPage() {
  const statCards = [
    {
      title: 'المشاهدات',
      value: '45.2K',
      icon: Eye,
      valueColor: 'text-primary',
    },
    {
      title: 'هذا الشهر',
      value: '28',
      icon: TrendingUp,
      valueColor: 'text-[#16A34A]',
    },
    {
      title: 'إجمالي الأخبار',
      value: '342',
      icon: Newspaper,
      valueColor: 'text-primary',
    },
  ] as const;

  return (
    <>
      <Helmet>
        <title>الأخبار الطبية • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              الأخبار الطبية
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              استيراد وإدارة الأخبار الطبية
            </div>
          </div>

          <button
            type='button'
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
          >
            <Plus className='h-4 w-4' />
            استيراد اخبار جديدة
          </button>
        </div>

        <section className='mt-6 flex gap-4'>
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className='h-[120px] w-full rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'
              >
                <div className='flex items-start justify-between'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {c.title}
                    </div>
                    <div
                      className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${c.valueColor}`}
                    >
                      {c.value}
                    </div>
                  </div>

                  <div className='flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#F2FFFE] text-primary'>
                    <Icon className='h-5 w-5' />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='mx-auto flex max-w-[520px] flex-col items-center justify-center text-center'>
            <div className='flex h-[66px] w-[66px] items-center justify-center rounded-[14px] border border-[#EEF2F6] bg-white text-[#98A2B3] shadow-[0_10px_20px_rgba(0,0,0,0.06)]'>
              <Newspaper className='h-8 w-8' />
            </div>

            <div className='mt-4 font-cairo text-[16px] font-black text-[#111827]'>
              إدارة الأخبار الطبية
            </div>
            <div className='mt-2 font-cairo text-[12px] font-semibold leading-[18px] text-[#98A2B3]'>
              استيراد وإدارة الأخبار الطبية من مصادر موثوقة
            </div>

            <button
              type='button'
              className='mt-5 inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
            >
              <Plus className='h-4 w-4' />
              ابدأ باستيراد الأخبار
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
