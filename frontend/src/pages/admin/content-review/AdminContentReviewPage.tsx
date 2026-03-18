import { Helmet } from 'react-helmet-async';
import { Check, CheckCircle2, Clock, LayoutGrid, User, X, XCircle } from 'lucide-react';

type ReviewStatus = 'قيد المراجعة' | 'مرفوض' | 'تمت الموافقة';

type ReviewItem = {
  id: string;
  title: string;
  author: string;
  category: string;
  wordsCount: number;
  status: ReviewStatus;
};

export default function AdminContentReviewPage() {
  const stats = [
    {
      title: 'قيد المراجعة',
      value: '3',
      icon: Clock,
      tone: {
        border: 'border-[#FFF085]',
        bg: 'bg-gradient-to-br from-[#FEFCE8] to-white',
        iconFg: 'text-[#F0B100]',
      },
    },
    {
      title: 'تمت الموافقة',
      value: '127',
      icon: CheckCircle2,
      tone: {
        border: 'border-[#B9F8CF]',
        bg: 'bg-gradient-to-br from-[#F0FDF4] to-white',
        iconFg: 'text-[#00C950]',
      },
    },
    {
      title: 'مرفوض',
      value: '8',
      icon: XCircle,
      tone: {
        border: 'border-[#FECACA]',
        bg: 'bg-[#FEF2F2]',
        iconFg: 'text-[#EF4444]',
      },
    },
  ] as const;

  const items: ReviewItem[] = [
    {
      id: '1',
      title: 'أعراض ارتفاع ضغط الدم',
      author: 'محمد الحمد',
      category: 'أعراض',
      wordsCount: 1250,
      status: 'قيد المراجعة',
    },
    {
      id: '2',
      title: 'دواء المتفورمين: الاستخدامات والآثار الجانبية',
      author: 'سارة عبدالله',
      category: 'أدوية',
      wordsCount: 980,
      status: 'قيد المراجعة',
    },
    {
      id: '3',
      title: 'الوقاية من أمراض القلب',
      author: 'أحمد محمود',
      category: 'وقاية',
      wordsCount: 1420,
      status: 'قيد المراجعة',
    },
  ];

  const statusPill = (s: ReviewStatus) => {
    if (s === 'تمت الموافقة') {
      return 'bg-[#DCFCE7] text-[#16A34A]';
    }
    if (s === 'مرفوض') {
      return 'bg-[#FEF2F2] text-[#EF4444]';
    }
    return 'bg-[#FBBF241A] text-[#D97706]';
  };

  return (
    <>
      <Helmet>
        <title>مراجعة المحتوى • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[24px] font-black leading-[26px] text-[#111827]'>
              مراجعة المحتوى
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              مراجعة والموافقة على المحتوى الطبي
            </div>
          </div>
          <div className='inline-flex h-[40px] items-center justify-center rounded-[8px] bg-[#F0B100] px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_22px_rgba(240,177,0,0.25)]'>
            قيد المراجعة
            <span className='ms-2 inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-[#F0B100]'>
              3
            </span>
          </div>
        </div>

        <div className='mt-6 flex items-start justify-between gap-4'>
          <div className='flex flex-1 justify-between gap-4'>
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`h-[92px] w-full rounded-[10px] border px-[18px] py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${s.tone.border} ${s.tone.bg}`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='text-right'>
                      <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                        {s.title}
                      </div>
                      <div
                        className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${s.tone.iconFg}`}
                      >
                        {s.value}
                      </div>
                    </div>

                    <div className='flex h-[40px] w-[40px] items-center justify-center'>
                      <Icon className={`h-5 w-5 ${s.tone.iconFg}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between px-6 py-5'>
            <div className='inline-flex items-center gap-2 text-right font-cairo text-[12px] font-extrabold text-[#4A5565]'>
              <LayoutGrid className='h-4 w-4 text-primary' />
              المحتوى قيد المراجعة
            </div>
            <span className='h-6 w-6' />
          </div>

          <div className='border-t border-[#EEF2F6]'>
            {items.map((it) => (
              <div
                key={it.id}
                className='border-b border-[#EEF2F6] px-6 py-5'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1 space-y-12 text-right'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='font-cairo text-[14px] font-black text-[#111827]'>
                        {it.title}
                      </div>
                      <span
                        className={`inline-flex h-[24px] items-center rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusPill(it.status)}`}
                      >
                        {it.status}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div className='mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                        <div className='inline-flex items-center gap-2'>
                          <User className='h-4 w-4' />
                          {it.author}
                        </div>
                        <div className='inline-flex items-center gap-2'>
                          <span className='inline-flex h-[20px] items-center rounded-full bg-[#F3F4F6] px-3 font-cairo text-[11px] font-extrabold text-[#4A5565]'>
                            {it.category}
                          </span>
                        </div>
                        <div className='inline-flex items-center gap-2'>
                          {it.wordsCount} كلمة
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          className='inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#67E8F9] bg-[#ECFEFF] px-4 font-cairo text-[12px] font-extrabold text-[#0891B2]'
                        >
                          معاينة
                        </button>
                        <button
                          type='button'
                          className='inline-flex h-[30px] items-center justify-center gap-2 rounded-[10px] bg-[#00C950] px-4 font-cairo text-[12px] font-extrabold text-white'
                        >
                          <Check className='h-4 w-4' />
                          موافقة
                        </button>
                        <button
                          type='button'
                          className='inline-flex h-[30px] items-center justify-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#EF4444]'
                        >
                          <X className='h-4 w-4' />
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
