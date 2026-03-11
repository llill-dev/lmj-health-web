import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Filter,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Signal,
  ChevronUp,
  User,
  Ticket,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type ConsultationStatus = 'closed' | 'in_progress' | 'waiting';

type ConsultationMessage = {
  id: string;
  author: 'patient' | 'doctor';
  authorName: string;
  text: string;
  timeLabel: string;
  isNew?: boolean;
};

type Consultation = {
  id: string;
  status: ConsultationStatus;
  statusLabel: string;
  priorityLabel: string;
  title: string;
  createdAtLabel: string;
  lastUpdateLabel: string;
  repliesCount: number;
  patientName: string;
  patientInitial: string;
  patientEmail: string;
  patientPhone: string;
  description: string;
  symptoms: string[];
  historyNote: string;
  messages: ConsultationMessage[];
};

const mockConsultations: Consultation[] = [
  {
    id: 'c1',
    status: 'in_progress',
    statusLabel: 'قيد المعالجة',
    priorityLabel: 'عالية',
    title: 'ألم في الصدر',
    createdAtLabel: '2024-01-17',
    lastUpdateLabel: '2024-01-17',
    repliesCount: 2,
    patientName: 'أحمد محمد العلي',
    patientInitial: 'أ',
    patientEmail: 'patient1@example.com',
    patientPhone: '+966501234567',
    description:
      'أشعر بألم في الصدر عند الجلوس وفي بعض الأحيان يزداد أثناء النوم.',
    symptoms: ['ألم في الصدر', 'خفقان'],
    historyNote:
      'مرحبًا، يرجى تحديد نوع الألم ومتى يبدأ وهل يزداد مع بذل المجهود؟',
    messages: [
      {
        id: 'm1',
        author: 'doctor',
        authorName: 'د. أحمد محمد العلي',
        text: 'مرحبًا، يرجى تحديد نوع الألم ومتى يبدأ وهل يزداد مع بذل المجهود؟',
        timeLabel: 'قبل 4 ساعات',
      },
      {
        id: 'm2',
        author: 'patient',
        authorName: 'أحمد محمد العلي',
        text: 'الألم يأتي فجأة ويستمر لمدة 5 دقائق، وأحيانًا يزيد عند الحركة.',
        timeLabel: 'قبل 10 دقائق',
        isNew: true,
      },
    ],
  },
];

function statusTabLabel(tab: 'all' | ConsultationStatus) {
  if (tab === 'all') return 'الكل';
  if (tab === 'closed') return 'مغلقة';
  if (tab === 'in_progress') return 'قيد المعالجة';
  return 'بالانتظار القبول';
}

function statusChipStyle(status: ConsultationStatus) {
  if (status === 'in_progress') {
    return 'bg-[#EFFFFE] text-[#16C5C0]';
  }
  if (status === 'waiting') {
    return 'bg-[#FFF7ED] text-[#F97316]';
  }
  return 'bg-[#ECFDF3] text-[#16A34A]';
}

export default function DoctorOnlineConsultationsPage() {
  const [tab, setTab] = useState<'all' | ConsultationStatus>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string>('c1');
  const [draft, setDraft] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  const stats = useMemo(() => {
    const total = mockConsultations.length;
    const waiting = mockConsultations.filter(
      (c) => c.status === 'waiting',
    ).length;
    const inProgress = mockConsultations.filter(
      (c) => c.status === 'in_progress',
    ).length;
    const closed = mockConsultations.filter(
      (c) => c.status === 'closed',
    ).length;

    return { total, waiting, inProgress, closed };
  }, []);

  const visibleConsultations = useMemo(() => {
    const base =
      tab === 'all'
        ? mockConsultations
        : mockConsultations.filter((c) => c.status === tab);

    if (!query.trim()) return base;

    const q = query.trim();
    return base.filter(
      (c) =>
        c.title.includes(q) ||
        c.patientName.includes(q) ||
        c.patientEmail.includes(q) ||
        c.patientPhone.includes(q),
    );
  }, [tab, query]);

  const active =
    visibleConsultations.find((c) => c.id === expandedId) ??
    visibleConsultations[0];

  return (
    <>
      <Helmet>
        <title>Online Consultations • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <section className='rounded-[16px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
                الاستشارات الأونلاين
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
                إدارة ومتابعة الاستشارات بشكل مباشر
              </div>
            </div>

            <div className='relative w-[320px]'>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='بحث...'
                className='h-[40px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] shadow-[0_10px_25px_rgba(0,0,0,0.06)] outline-none placeholder:font-cairo placeholder:text-[13px] placeholder:font-medium placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-[18px] w-[18px]' />
              </div>
            </div>
          </div>
        </section>

        <section className='mt-6 grid grid-cols-4 gap-4'>
          <div className='rounded-[6px] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] border-b-[3.98px] border-[#16C5C0]'>
            <div className='flex items-start justify-between'>
              <div className='text-right'>
                <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                  إجمالي الاستشارات
                </div>
                <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                  {stats.total}
                </div>
              </div>
              <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#EFFFFE]'>
                <MessageCircle className='h-[18px] w-[18px] text-[#16C5C0]' />
              </div>
            </div>
          </div>

          <div className='rounded-[6px] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] border-b-[3.98px] border-[#F97316]'>
            <div className='flex items-start justify-between'>
              <div className='text-right'>
                <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                  بالانتظار القبول
                </div>
                <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                  {stats.waiting}
                </div>
              </div>
              <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#FFF7ED]'>
                <Clock className='h-[18px] w-[18px] text-[#F97316]' />
              </div>
            </div>
          </div>

          <div className='rounded-[6px] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] border-b-[3.98px] border-[#06B6D4]'>
            <div className='flex items-start justify-between'>
              <div className='text-right'>
                <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                  قيد المعالجة
                </div>
                <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                  {stats.inProgress}
                </div>
              </div>
              <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFEFF]'>
                <Signal className='h-[18px] w-[18px] text-[#06B6D4]' />
              </div>
            </div>
          </div>

          <div className='rounded-[6px] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] border-b-[3.98px] border-[#16A34A]'>
            <div className='flex items-start justify-between'>
              <div className='text-right'>
                <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                  مغلقة
                </div>
                <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                  {stats.closed}
                </div>
              </div>
              <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFDF3]'>
                <CheckCircle2 className='h-[18px] w-[18px] text-[#16A34A]' />
              </div>
            </div>
          </div>
        </section>

        <section className='mt-4 rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-[0_10px_25px_rgba(0,0,0,0.06)]'>
          <div className='grid grid-cols-3 gap-3'>
            {(['waiting', 'in_progress', 'closed'] as const).map((key) => {
              const isActive = tab === key;
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => setTab(key)}
                  className={
                    isActive
                      ? 'h-[38px] rounded-[6px] bg-[#16C5C0] font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(22,197,192,0.25)]'
                      : 'h-[38px] rounded-[6px] bg-white font-cairo text-[13px] font-extrabold text-[#667085]'
                  }
                >
                  {statusTabLabel(key)}
                </button>
              );
            })}
          </div>

          <div className='mt-3 flex items-center gap-3'>
            <div className='relative flex-1'>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='ابحث في الاستشارات بالرقم العنوان أو المريض...'
                className='h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search className='h-[18px] w-[18px]' />
              </div>
            </div>

            <button
              type='button'
              className='flex h-[40px] w-[44px] items-center justify-center rounded-[6px] border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F9FAFB]'
              aria-label='فلتر'
            >
              <Filter className='h-[18px] w-[18px]' />
            </button>
          </div>
        </section>

        {active ? (
          <section className='mt-5 rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center justify-between border-b border-[#EEF2F6] px-5 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_10px_18px_rgba(22,197,192,0.25)]'>
                  <Ticket className='font-cairo text-[16px] font-extrabold' />
                </div>
                <div className='text-right'>
                  <div className='flex items-center gap-2'>
                    <div className='font-cairo text-[15px] font-extrabold text-[#111827]'>
                      {active.title}
                    </div>
                    <span className='inline-flex h-[22px] items-center justify-center rounded-[6px] bg-[#16C5C0] px-2 font-cairo text-[11px] font-extrabold text-white'>
                      جديد
                    </span>
                  </div>
                  <div className='mt-1 flex items-center gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    <span>#{active.id}</span>
                    <span className='h-1 w-1 rounded-full bg-[#D0D5DD]' />
                    <span>{active.createdAtLabel}</span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEF3C7] px-2 font-cairo text-[11px] font-extrabold text-[#B45309]'>
                  {active.priorityLabel}
                </span>
                <span
                  className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-2 font-cairo text-[11px] font-extrabold ${statusChipStyle(active.status)}`}
                >
                  {active.statusLabel}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setExpandedId((prev) => (prev ? '' : active.id))
                  }
                  className='h-[34px] w-[34px] font-bold  text-[#667085]'
                  aria-label='طي'
                >
                  <ChevronUp className='h-4 w-4' />
                </button>
              </div>
            </div>

            <div className='px-5 py-5'>
              <div className='grid grid-cols-4 gap-4 rounded-[12px] bg-[#F9FAFB] px-4 py-3'>
                <div className='text-right'>
                  <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    تاريخ الإنشاء
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                    {active.createdAtLabel}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    آخر تحديث
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                    {active.lastUpdateLabel}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    حالة الاستشارة
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                    {active.statusLabel}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[11px] font-bold text-[#98A2B3]'>
                    عدد الردود
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                    {active.repliesCount}
                  </div>
                </div>
              </div>

              <div className='mt-4 rounded-[12px] border border-[#D1E9FF] bg-[#EFF8FF] px-4 py-4'>
                <div className='flex items-center justify-start gap-3'>
                  <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_10px_18px_rgba(22,197,192,0.25)]'>
                    <span className='font-cairo text-[16px] font-extrabold'>
                      {active.patientInitial}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px]  text-[#16C5C0]'>
                      معلومات المريض
                    </div>
                    <div className='mt-2 font-cairo text-[14px] font-extrabold text-[#16C5C0]'>
                      {active.patientName}
                    </div>
                    <div className='mt-1 font-cairo text-[12px]  text-[#16C5C0]'>
                      {active.patientEmail} • {active.patientPhone}
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4'>
                  <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                    الوصف التفصيلي
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]'>
                    {active.description}
                  </div>
                </div>

                <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4'>
                  <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                    الأعراض
                  </div>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {active.symptoms.map((s) => (
                      <span
                        key={s}
                        className='inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEE2E2] px-3 font-cairo text-[11px] font-extrabold text-[#B42318]'
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <section className='mt-4 px-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                    سجل المحادثة ( {active.repliesCount} رد) :
                  </h2>
                </div>

                <div className='mt-3 space-y-3'>
                  {active.messages.map((m) => {
                    const isSelected = selectedMessageId === m.id;
                    return (
                      <button
                        key={m.id}
                        type='button'
                        onClick={() => setSelectedMessageId(m.id)}
                        className={
                          isSelected
                            ? 'w-full rounded-[10px] border border-[#EEF2F6] bg-[#16C5C01A] px-4 py-3 text-right'
                            : 'w-full rounded-[10px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-[#98A2B3]' />
                            <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                              {m.authorName}
                            </div>
                            {m.isNew ? (
                              <span className='inline-flex h-[18px] items-center justify-center rounded-[6px] bg-[#F43F5E] px-2 font-cairo text-[10px] font-extrabold text-white'>
                                جديد
                              </span>
                            ) : null}
                          </div>
                          <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                            {m.timeLabel}
                          </div>
                        </div>
                        <div className='mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]'>
                          {m.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className='mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4'>
                <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                  إرسال رد:
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder='اكتب ردك هنا...'
                  className='mt-2 h-[110px] w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white p-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]'
                />

                <div className='mt-3 flex items-center gap-3'>
                  <button
                    type='button'
                    className='flex h-[40px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#667085] hover:bg-[#F9FAFB]'
                  >
                    <Paperclip className='h-4 w-4' />
                    إرفاق ملف
                  </button>

                  <button
                    type='button'
                    className='flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-gradient-to-l from-[#18C6C0] via-[#12B9B4] to-[#0FA6A3] px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_14px_24px_rgba(22,197,192,0.30)]'
                  >
                    <Send className='h-4 w-4' />
                    إرسال الرد
                  </button>
                </div>

                <button
                  type='button'
                  className='mt-4 flex h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#475467] font-cairo text-[12px] font-extrabold text-white'
                >
                  <CheckCircle2 className='h-4 w-4' />
                  إنهاء الاستشارة
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className='mt-6 rounded-[14px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
              لا توجد استشارات
            </div>
          </div>
        )}

        <div className='h-10' />
      </div>
    </>
  );
}
