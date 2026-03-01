'use client';

import { useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  DollarSign,
  Video,
  Building,
} from 'lucide-react';
import DoctorDetailsDialog, {
  type DoctorCardItem,
} from '@/components/doctor/doctor-details-dialog';

const mockDoctors: DoctorCardItem[] = [
  {
    id: 'd-1',
    name: 'د. يوسف ابراهيم',
    specialty: 'طب القلب',
    rating: 4.7,
    reviews: 96,
    tags: ['أونلاين'],
    price: 380,
    city: 'حماة، سوريا',
  },
  {
    id: 'd-2',
    name: 'د. عبدالله محمد',
    specialty: 'طب العائلة',
    rating: 4.7,
    reviews: 16,
    tags: ['حضوري'],
    price: 400,
    city: 'دمشق، سوريا',
  },
  {
    id: 'd-3',
    name: 'د. منى عبدالله',
    specialty: 'طب الأطفال',
    rating: 4.8,
    reviews: 142,
    tags: ['أونلاين', 'حضوري'],
    price: 350,
    city: 'حمص، سوريا',
  },
  {
    id: 'd-4',
    name: 'د. خالد عبدالرحمن',
    specialty: 'طب الأسنان',
    rating: 4.5,
    reviews: 65,
    tags: ['حضوري'],
    price: 200,
    city: 'حماة، سوريا',
  },
  {
    id: 'd-5',
    name: 'د. نورة فهد',
    specialty: 'الجلدية',
    rating: 4.6,
    reviews: 87,
    tags: ['أونلاين', 'حضوري'],
    price: 280,
    city: 'حمص، سوريا',
  },
];

function tagChipClassName(tag: string) {
  if (tag === 'حضوري') {
    return 'border-[#2E90FA] text-[#2E90FA]';
  }
  return 'border-[#16C5C0] text-[#16C5C0]';
}

export default function DoctorsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const pageSize = 8;

  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return mockDoctors.find((d) => d.id === selectedDoctorId) ?? null;
  }, [selectedDoctorId]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return mockDoctors;
    const q = searchTerm.toLowerCase();
    return mockDoctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(total, page * pageSize);

  return (
    <div
      dir='rtl'
      lang='ar'
      className='mx-auto w-full max-w-[1120px] px-4'
    >
      <section className='rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[18px] font-extrabold text-[#111827]'>
              دليل الأطباء
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              تصفح وابحث عن الأطباء المعتمدين
            </div>
          </div>

          <span className='inline-flex h-[32px] items-center justify-center rounded-[6px] bg-[#16C5C0] px-4 font-cairo text-[12px] font-extrabold text-white'>
            {total} طبيب
          </span>
        </div>

        <div className='mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-center'>
          <div className='relative'>
            <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              <Search className='h-4 w-4' />
            </div>
            <input
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder='ابحث باسم الطبيب أو تخصصه أو مدينته...'
              className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
            />
          </div>

          <button
            type='button'
            className='flex h-[44px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)]'
          >
            <Navigation className='h-4 w-4 text-[#16C5C0]' />
            استخدم موقعي
          </button>

          <button
            type='button'
            className='flex h-[44px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)]'
          >
            <SlidersHorizontal className='h-4 w-4 text-[#667085]' />
            فلاتر متقدمة
          </button>
        </div>
      </section>

      <section className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
        {current.map((d) => (
          <div
            key={d.id}
            className='relative overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white px-6 pb-5 pt-6 text-center shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
          >
            <div className='mx-auto flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 border-[#C7F3F1] bg-[#F8FAFC]'>
              <span className='font-cairo text-[18px] font-extrabold text-[#98A2B3]'></span>
            </div>

            <div className='mt-4 font-cairo text-[14px] font-extrabold text-[#111827]'>
              {d.name}
            </div>
            <div className='mt-1 flex items-center justify-center gap-2 font-cairo text-[12px] font-semibold text-[#16C5C0]'>
              <Stethoscope className='h-4 w-4 text-[#16C5C0]' />
              {d.specialty}
            </div>

            <div className='mt-2 flex items-center justify-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
              <span className='flex items-center gap-1'>
                {d.rating.toFixed(1)}
                <Star
                  className='h-4 w-4 text-[#FACC15]'
                  fill='#FACC15'
                />
              </span>
              <span className='font-semibold text-[#98A2B3]'>
                ({d.reviews} تقييم)
              </span>
            </div>

            <div className='mt-3 flex flex-wrap items-center justify-center gap-2'>
              {d.tags.map((t) => (
                <span
                  key={t}
                  className={`flex gap-1 h-[22px] items-center justify-center rounded-full border-[1.82px] px-3 font-cairo text-[11px] font-extrabold ${tagChipClassName(t)}`}
                >
                  {t === 'أونلاين' ? (
                    <Video className='h-4 w-4 text-[#16C5C0]' />
                  ) : (
                    <Building className='h-3 w-3 text-[#2E90FA]' />
                  )}
                  {t}
                </span>
              ))}
            </div>

            <div className='mt-4 flex items-center justify-center gap-3'>
              <DollarSign className='h-4 w-4 text-[#16A34A]' />
              <span className='font-cairo text-[14px] font-extrabold text-[#16A34A]'>
                {d.price}
              </span>
            </div>

            <div className='mt-2 flex items-center justify-center gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              <MapPin className='h-4 w-4 text-[#98A2B3]' />
              {d.city}
            </div>

            <button
              type='button'
              onClick={() => setSelectedDoctorId(d.id)}
              className='mt-5 flex h-[36px] w-[290px] items-center justify-center rounded-[16px] bg-gradient-to-b from-[#16C5C0] to-[#14B3AE] font-cairo text-[14px] font-semibold  text-white transition-colors hover:from-[#14B3AE] hover:to-[#12A8A4]'
            >
              عرض التفاصيل
            </button>
          </div>
        ))}
      </section>

      <DoctorDetailsDialog
        open={Boolean(selectedDoctor)}
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctorId(null)}
      />

      <section className='mt-8 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
            عرض {showingFrom}-{showingTo} من أصل {total} طبيب
          </div>

          <div className='flex items-center justify-center gap-3'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
              aria-label='السابق'
            >
              <ChevronRight className='h-4 w-4' />
            </button>

            <div className='flex items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2'>
              <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                صفحة
              </div>
              <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                {page} من {totalPages}
              </div>
            </div>

            <button
              type='button'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40'
              aria-label='التالي'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
          </div>

          <div className='flex items-center justify-end gap-2'>
            <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              عدد النتائج:
            </div>
            <div className='rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#111827]'>
              {total}
            </div>
          </div>
        </div>
      </section>

      <div className='h-10' />
    </div>
  );
}
