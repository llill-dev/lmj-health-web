import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  FileText,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  LayoutGrid,
  HeartPulse,
  Stethoscope,
  Pill,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ContentStatus = 'منشور' | 'قيد المراجعة' | 'مسودة';

type ContentItem = {
  id: string;
  title: string;
  category: string;
  author: string;
  views: number;
  updatedAt: string;
  status: ContentStatus;
};

export default function AdminMedicalContentPage() {
  const [activeStatus, setActiveStatus] = useState<'الكل' | ContentStatus>(
    'الكل',
  );

  const statCards: Array<{
    title: string;
    value: string;
    icon: typeof LayoutGrid;
    valueColor: string;
    tone: {
      border: string;
      bg: string;
      iconBg: string;
    };
  }> = [
    {
      title: 'المشاهدات',
      value: '10,260',
      icon: Eye,
      valueColor: 'text-[#0F8F8B]',
      tone: {
        border: 'border-[#0F8F8B]',
        bg: 'bg-[#16C5C00D]',
        iconBg: 'bg-[#0F8F8B]',
      },
    },
    {
      title: 'مسودات',
      value: '1',
      icon: FileText,
      valueColor: 'text-[#00C950]',
      tone: {
        border: 'border-[#B9F8CF]',
        bg: 'bg-gradient-to-br from-[#F0FDF4] to-white',
        iconBg: 'bg-[#00C950]',
      },
    },
    {
      title: 'قيد المراجعة',
      value: '1',
      icon: Clock,
      valueColor: 'text-[#F0B100]',
      tone: {
        border: 'border-[#FFF085]',
        bg: 'bg-gradient-to-br from-[#FEFCE8] to-white',
        iconBg: 'bg-[#F0B100]',
      },
    },
    {
      title: 'منشور',
      value: '3',
      icon: CheckCircle2,
      valueColor: 'text-[#4A5565]',
      tone: {
        border: 'border-[#E5E7EB]',
        bg: 'bg-gradient-to-br from-[#F9FAFB] to-white',
        iconBg: 'bg-[#4A5565]',
      },
    },
    {
      title: 'إجمالي المحتوى',
      value: '5',
      icon: BookOpen,
      valueColor: 'text-[#8200DB]',
      tone: {
        border: 'border-[#E9D4FF]',
        bg: 'bg-gradient-to-br from-[#FAF5FF] to-white',
        iconBg: 'bg-[#8200DB]',
      },
    },
  ];

  const items: ContentItem[] = [
    {
      id: '1',
      title: 'داء السكري: الأعراض والعلاج',
      category: 'الحالات الطبية',
      author: 'أحمد محمود',
      views: 5420,
      updatedAt: '10-02-2024',
      status: 'منشور',
    },
    {
      id: '2',
      title: 'الصداع النصفي: الأسباب والوقاية',
      category: 'الحالات الطبية',
      author: 'سارة عبدالله',
      views: 3280,
      updatedAt: '09-02-2024',
      status: 'منشور',
    },
    {
      id: '3',
      title: 'أعراض ارتفاع ضغط الدم',
      category: 'الأعراض',
      author: 'محمد الأحمد',
      views: 0,
      updatedAt: '11-02-2024',
      status: 'قيد المراجعة',
    },
    {
      id: '4',
      title: 'إجراء تنظير القولون',
      category: 'الإجراءات',
      author: 'أحمد محمود',
      views: 1560,
      updatedAt: '08-02-2024',
      status: 'منشور',
    },
    {
      id: '5',
      title: 'دواء الميتفورمين: الاستخدامات والآثار الجانبية',
      category: 'الأدوية',
      author: 'سارة عبدالله',
      views: 0,
      updatedAt: '11-02-2024',
      status: 'مسودة',
    },
  ];

  const filteredItems = useMemo(() => {
    if (activeStatus === 'الكل') return items;
    return items.filter((it) => it.status === activeStatus);
  }, [activeStatus, items]);

  const statusBadge = (s: ContentStatus) => {
    if (s === 'منشور') {
      return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
    }
    if (s === 'قيد المراجعة') {
      return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
    }
    return 'bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]';
  };

  return (
    <>
      <Helmet>
        <title>إدارة المحتوى الطبي • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              إدارة المحتوى الطبي
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              إدارة المقالات والمحتوى التعليمي الطبي
            </div>
          </div>

          <button
            type='button'
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.20)]'
          >
            <Plus className='h-4 w-4' />
            إضافة محتوى جديد
          </button>
        </div>

        <section className='mt-6 flex justify-between gap-4'>
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`w-[200px] h-[92px] rounded-[10px] border-[1.82px] px-[16px] py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone.border} ${c.tone.bg}`}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {c.title}
                    </div>
                    <div
                      className={`mt-2 font-cairo text-[20px] font-black leading-[20px] ${c.valueColor}`}
                    >
                      {c.value}
                    </div>
                  </div>

                  <div
                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-[6px] ${c.tone.iconBg}`}
                  >
                    <Icon className='h-5 w-5 text-white' />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='relative'>
            <input
              placeholder='بحث في المحتوى...'
              className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            />
            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              <Search className='h-5 w-5' />
            </div>
          </div>

          <div className='mt-5 flex items-center justify-start gap-2'>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
            >
              <BookOpen className='h-4 w-4' />
              الكل
            </button>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
            >
              <HeartPulse className='h-4 w-4 text-[#667085]' />
              الحالات الطبية
            </button>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
            >
              <FileText className='h-4 w-4 text-[#667085]' />
              الأعراض
            </button>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
            >
              <Stethoscope className='h-4 w-4 text-[#667085]' />
              الإجراءات
            </button>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
            >
              <Pill className='h-4 w-4 text-[#667085]' />
              الأدوية
            </button>
            <button
              type='button'
              className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
            >
              <ShieldCheck className='h-4 w-4 text-[#667085]' />
              الوقاية
            </button>
          </div>

          <div className='mt-4 flex items-center justify-start gap-2'>
            <button
              type='button'
              onClick={() => setActiveStatus('الكل')}
              className={
                activeStatus === 'الكل'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              الكل
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('منشور')}
              className={
                activeStatus === 'منشور'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              منشور
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('قيد المراجعة')}
              className={
                activeStatus === 'قيد المراجعة'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              قيد المراجعة
            </button>
            <button
              type='button'
              onClick={() => setActiveStatus('مسودة')}
              className={
                activeStatus === 'مسودة'
                  ? 'inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                  : 'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]'
              }
            >
              مسودة
            </button>
          </div>
        </section>

        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)] overflow-hidden'>
          <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                المحتوى الطبي ({items.length})
              </div>
            </div>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {filteredItems.map((it) => (
              <div
                key={it.id}
                className='flex items-center justify-between px-6 py-5'
              >
                <div className='flex-1 text-right'>
                  <div className='flex items-center justify-start gap-3'>
                    <div className='font-cairo text-[14px] font-black text-[#111827]'>
                      {it.title}
                    </div>
                    <div
                      className={`inline-flex h-[22px] items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusBadge(it.status)}`}
                    >
                      {it.status}
                    </div>
                  </div>

                  <div className='mt-2 flex flex-wrap items-center justify-start gap-6 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    <div className='inline-flex items-center gap-2'>
                      <LayoutGrid className='h-4 w-4' />
                      {it.category}
                    </div>
                    <div className='inline-flex items-center gap-2'>
                      <ClipboardCheck className='h-4 w-4' />
                      الكاتب: {it.author}
                    </div>
                    <div className='inline-flex items-center gap-2'>
                      <Eye className='h-4 w-4' />
                      {it.views.toLocaleString()} مشاهدة
                    </div>
                    <div className='inline-flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      آخر تحديث: {it.updatedAt}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#EF4444]'
                    aria-label='حذف'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-primary'
                    aria-label='تعديل'
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    className='flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#2563EB]'
                    aria-label='عرض'
                  >
                    <Eye className='h-4 w-4' />
                  </button>
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
