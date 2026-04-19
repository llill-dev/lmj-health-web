import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ChevronLeft,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '@/motion';

/** Template data — replace with API when backend is ready. */
type ComplaintStatus = 'processed' | 'review' | 'new';

type ComplaintRow = {
  id: string;
  patientName: string;
  typeLabel: string;
  locationLine: string;
  timeLabel: string;
  status: ComplaintStatus;
};

const MOCK_COMPLAINTS: ComplaintRow[] = [
  {
    id: '1',
    patientName: 'خالد الأسعد',
    typeLabel: 'موعد',
    locationLine: 'سوريا، دمشق، شارع العابد',
    timeLabel: 'اليوم 12:45 ص',
    status: 'processed',
  },
  {
    id: '2',
    patientName: 'خالد الأسعد',
    typeLabel: 'موعد',
    locationLine: 'سوريا، دمشق، شارع العابد',
    timeLabel: 'اليوم 12:45 ص',
    status: 'review',
  },
  {
    id: '3',
    patientName: 'خالد الأسعد',
    typeLabel: 'موعد',
    locationLine: 'سوريا، دمشق، شارع العابد',
    timeLabel: 'اليوم 12:45 ص',
    status: 'processed',
  },
  {
    id: '4',
    patientName: 'نزار الأحمد',
    typeLabel: 'خدمة',
    locationLine: 'سوريا، حلب',
    timeLabel: 'أمس 4:20 م',
    status: 'new',
  },
];

function statusBadge(status: ComplaintStatus) {
  switch (status) {
    case 'processed':
      return (
        <span className='inline-flex items-center bg-[#00C950] border-[1.82px] border-[#00C950] h-[23px] text-white rounded-[6px] px-2 py-1 font-cairo text-[12px] font-semibold leading-[16px]'>
          معالَج
        </span>
      );
    case 'review':
      return (
        <span className='inline-flex items-center bg-[#4A5565] border-[1.82px] border-[#4A5565] h-[23px] text-white rounded-[6px] px-2 py-1 font-cairo text-[12px] font-semibold leading-[16px]'>
          قيد المراجعة
        </span>
      );
    default:
      return (
        <span className='inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 font-cairo text-[11px] font-extrabold text-amber-900 ring-1 ring-amber-200/80'>
          جديد
        </span>
      );
  }
}

function StatCard({
  label,
  value,
  className,
  delay = 0,
}: {
  label: string;
  value: number;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2 },
      }}
      className={`relative overflow-hidden rounded-xl border px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] ${className}`}
    >
      <div className='font-cairo text-[13px] font-bold opacity-90'>{label}</div>
      <div className='mt-2 font-cairo text-[32px] font-black tabular-nums leading-none tracking-tight'>
        {value}
      </div>
      <div className='pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10' />
    </motion.div>
  );
}

export default function AdminComplaintsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>(
    'all',
  );
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const total = MOCK_COMPLAINTS.length;
    const processed = MOCK_COMPLAINTS.filter(
      (c) => c.status === 'processed',
    ).length;
    const review = MOCK_COMPLAINTS.filter((c) => c.status === 'review').length;
    return { total, processed, review };
  }, []);

  const filtered = useMemo(() => {
    return MOCK_COMPLAINTS.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.typeLabel !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        c.patientName.toLowerCase().includes(q) ||
        c.locationLine.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, typeFilter]);

  const typeOptions = useMemo(() => {
    const set = new Set(MOCK_COMPLAINTS.map((c) => c.typeLabel));
    return ['all', ...Array.from(set)];
  }, []);

  return (
    <>
      <Helmet>
        <title>الشكاوي • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='text-right'
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className='font-cairo text-[22px] font-black leading-7 text-[#111827] md:text-[24px]'>
            الشكاوي
          </h1>
          <p className='mt-1 font-cairo text-[13px] font-semibold text-[#64748B]'>
            متابعة شكاوى المرضى وحالاتها في مكان واحد
          </p>
        </motion.div>

        {/* تنبيه — شكوى جديدة */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05, ease: 'easeOut' }}
          className='mt-6 flex items-start gap-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4 shadow-[0_12px_32px_rgba(249,115,22,0.12)]'
        >
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F97316] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)]'>
            <AlertTriangle
              className='h-5 w-5'
              strokeWidth={2.25}
            />
          </div>
          <p className='min-w-0 pt-0.5 font-cairo text-[14px] font-bold leading-relaxed text-[#9A3412]'>
            يوجد شكوى جديدة مقدمة من المريض{' '}
            <span className='font-black text-[#7C2D12]'>نزار الأحمد</span>!
          </p>
        </motion.section>

        {/* بطاقات الأرقام */}
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <StatCard
            label='إجمالي الشكاوي'
            value={stats.total}
            delay={0.08}
            className='border-[#0F8F8B]/25 bg-gradient-to-br from-[#0F8F8B] to-[#0c7a77] text-white'
          />
          <StatCard
            label='معالَج'
            value={stats.processed}
            delay={0.14}
            className='border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white text-emerald-950'
          />
          <StatCard
            label='قيد المراجعة'
            value={stats.review}
            delay={0.2}
            className='border-slate-200/90 bg-gradient-to-br from-slate-50 to-white text-slate-800'
          />
        </div>

        {/* شريط التصفية */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.12 }}
          className='mt-6 flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between'
        >
          <div className='relative min-w-0 flex-1 md:max-w-md'>
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='بحث بالاسم أو الموقع...'
              className='h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-3 pr-11 font-cairo text-[13px] font-medium text-[#111827] placeholder:text-[#94A3B8] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            />
            <Search className='pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]' />
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-1.5 text-[#64748B]'>
              <SlidersHorizontal className='h-4 w-4' />
              <span className='font-cairo text-[12px] font-extrabold'>
                تصفية
              </span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className='h-10 min-w-[140px] cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#334155] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
            >
              <option value='all'>الحالة — الكل</option>
              <option value='processed'>معالَج</option>
              <option value='review'>قيد المراجعة</option>
              <option value='new'>جديد</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className='h-10 min-w-[160px] cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#334155] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
            >
              {typeOptions.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t === 'all' ? 'نوع الشكوى — الكل' : `نوع: ${t}`}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* قائمة البطاقات */}
        <motion.ul
          variants={staggerContainer(0.07, 0.06)}
          initial='hidden'
          animate='show'
          className='mt-6 flex list-none flex-col gap-4 p-0'
        >
          {filtered.map((c) => (
            <motion.li
              key={c.id}
              variants={staggerItem}
              className='block'
            >
              <motion.button
                type='button'
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.998 }}
                transition={{ duration: 0.2 }}
                className='flex w-full cursor-pointer items-stretch gap-0 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white text-right shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(15,23,42,0.09)]'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-2 px-5 py-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex flex-items-center gap-4'>
                      <div className='flex h-[64px] w-[64px] items-center justify-center rounded-[6px] bg-primary text-white'>
                        <Users className='h-6 w-6' />
                      </div>
                      <div className='text-right flex flex-col gap-2'>
                        <div className='font-cairo text-[17px] font-black text-[#0F172A]'>
                          {c.patientName}
                        </div>
                        <div className='font-cairo leading-[20px] text-[18px] font-semibold text-primary'>
                          نوع الشكوى:{' '}
                          <span className='text-[#1F2937]'>{c.typeLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                      {statusBadge(c.status)}
                    </div>
                  </div>

                  <div className='flex justify-between gap-2 ms-[70px]'>
                    <div className='flex items-center gap-1.5 font-cairo font-cairo text-[17px] font-black text-[#4A5565]'>
                      <MapPin className='h-4 w-4 shrink-0 text-primary' />
                      <span>{c.locationLine}</span>
                    </div>
                    <div className='font-cairo text-[17px] font-black text-[#99A1AF]'>
                      {c.timeLabel}
                    </div>
                  </div>
                </div>
                <div className='flex w-[56px] shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-[#3e8f89]'>
                  <ChevronLeft
                    className='h-6 w-6'
                    strokeWidth={2.25}
                  />
                </div>
              </motion.button>
            </motion.li>
          ))}
        </motion.ul>

        {filtered.length === 0 ? (
          <p className='mt-8 text-center font-cairo text-sm font-semibold text-[#94A3B8]'>
            لا توجد نتائج مطابقة للتصفية الحالية.
          </p>
        ) : null}
      </div>
    </>
  );
}
