import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '@/motion';
import { adminApi } from '@/lib/admin/client';
import type { ComplaintLifecycleStatus, ComplaintType } from '@/lib/admin/types';
import ComplaintsSummaryStatCard from '@/components/admin/complaints/ComplaintsSummaryStatCard';
import {
  COMPLAINT_TYPES,
  complaintTypeAr,
  formatListTime,
  listPreviewLine,
  statusBadgeClasses,
  statusLabelAr,
} from '@/components/admin/complaints/complaintsListUtils';

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | ComplaintLifecycleStatus
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ComplaintType>('all');

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      350,
    );
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  const countQueries = useQueries({
    queries: [
      {
        queryKey: ['admin', 'complaints', 'count', 'all'],
        queryFn: () => adminApi.complaints.list({ page: 1, limit: 1 }),
        staleTime: 30_000,
      },
      {
        queryKey: ['admin', 'complaints', 'count', 'under_review'],
        queryFn: () =>
          adminApi.complaints.list({
            page: 1,
            limit: 1,
            status: 'under_review',
          }),
        staleTime: 30_000,
      },
      {
        queryKey: ['admin', 'complaints', 'count', 'in_progress'],
        queryFn: () =>
          adminApi.complaints.list({
            page: 1,
            limit: 1,
            status: 'in_progress',
          }),
        staleTime: 30_000,
      },
      {
        queryKey: ['admin', 'complaints', 'count', 'resolved'],
        queryFn: () =>
          adminApi.complaints.list({ page: 1, limit: 1, status: 'resolved' }),
        staleTime: 30_000,
      },
      {
        queryKey: ['admin', 'complaints', 'count', 'closed'],
        queryFn: () =>
          adminApi.complaints.list({ page: 1, limit: 1, status: 'closed' }),
        staleTime: 30_000,
      },
    ],
  });

  const submittedPreview = useQuery({
    queryKey: ['admin', 'complaints', 'first-submitted'],
    queryFn: () =>
      adminApi.complaints.list({ status: 'submitted', page: 1, limit: 1 }),
    staleTime: 25_000,
  });

  const listQuery = useQuery({
    queryKey: [
      'admin',
      'complaints',
      'list',
      page,
      limit,
      statusFilter,
      typeFilter,
      debouncedSearch,
    ],
    queryFn: () =>
      adminApi.complaints.list({
        page,
        limit,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const stats = useMemo(() => {
    const total = countQueries[0].data?.total ?? 0;
    const review =
      (countQueries[1].data?.total ?? 0) + (countQueries[2].data?.total ?? 0);
    const closed =
      (countQueries[3].data?.total ?? 0) + (countQueries[4].data?.total ?? 0);
    return { total, review, closed };
  }, [countQueries]);

  const countsLoading = countQueries.some((q) => q.isLoading);

  const complaints = listQuery.data?.complaints ?? [];
  const totalList = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalList / Math.max(limit, 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const bannerName =
    submittedPreview.data?.complaints?.[0]?.contactSnapshot?.fullName;
  const showNewBanner = (submittedPreview.data?.total ?? 0) > 0;

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
            متابعة شكاوى المرضى عبر GET /api/complaints (إداري)
          </p>
        </motion.div>

        {showNewBanner && bannerName ? (
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
              يوجد شكوى جديدة (حالة مقدّمة) مقدمة من المريض{' '}
              <span className='font-black text-[#7C2D12]'>{bannerName}</span>.
            </p>
          </motion.section>
        ) : null}

        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <ComplaintsSummaryStatCard
            variant='total'
            value={countsLoading ? 0 : stats.total}
            delay={0.08}
          />
          <ComplaintsSummaryStatCard
            variant='closed'
            value={countsLoading ? 0 : stats.closed}
            delay={0.14}
          />
          <ComplaintsSummaryStatCard
            variant='review'
            value={countsLoading ? 0 : stats.review}
            delay={0.2}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.12 }}
          className='mt-6 flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between'
        >
          <div className='relative min-w-0 flex-1 md:max-w-md'>
            <input
              type='search'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='بحث (اسم، بريد، موضوع، النص...)'
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
              className='h-10 min-w-[160px] cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#334155] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
            >
              <option value='all'>الحالة — الكل</option>
              <option value='submitted'>مقدّمة</option>
              <option value='under_review'>قيد المراجعة</option>
              <option value='in_progress'>قيد المعالجة</option>
              <option value='resolved'>تم الحل</option>
              <option value='closed'>مغلقة</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className='h-10 min-w-[180px] cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#334155] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
            >
              <option value='all'>نوع الشكوى — الكل</option>
              {COMPLAINT_TYPES.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {complaintTypeAr(t)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {listQuery.isError ? (
          <p className='mt-8 text-center font-cairo text-sm font-semibold text-red-600'>
            فشل تحميل قائمة الشكاوي. تحقق من الصلاحيات والاتصال بالخادم.
          </p>
        ) : listQuery.isLoading && !listQuery.data ? (
          <p className='mt-8 text-center font-cairo text-sm font-semibold text-[#94A3B8]'>
            جاري تحميل الشكاوي...
          </p>
        ) : (
          <>
            <motion.ul
              variants={staggerContainer(0.07, 0.06)}
              initial='hidden'
              animate='show'
              className='mt-6 flex list-none flex-col gap-4 p-0'
            >
              {complaints.map((c) => (
                <motion.li
                  key={c._id}
                  variants={staggerItem}
                  className='block'
                >
                  <motion.button
                    type='button'
                    onClick={() => navigate(`/admin/complaints/${c._id}`)}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.998 }}
                    transition={{ duration: 0.2 }}
                    className='flex w-full cursor-pointer items-stretch gap-0 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white text-right shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(15,23,42,0.09)]'
                  >
                    <div className='flex min-w-0 flex-1 flex-col gap-2 px-5 py-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex min-w-0 items-start gap-4'>
                          <div className='flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white'>
                            <Stethoscope className='h-6 w-6' />
                          </div>
                          <div className='min-w-0 text-right'>
                            <div className='font-cairo text-[17px] font-black text-[#0F172A]'>
                              {c.contactSnapshot?.fullName ?? '—'}
                            </div>
                            <div className='mt-1 font-cairo text-[18px] font-semibold leading-[22px] text-primary'>
                              نوع الشكوى:{' '}
                              <span className='text-[#1F2937]'>
                                {complaintTypeAr(c.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex h-[23px] shrink-0 items-center rounded-[6px] border-[1.82px] px-2 py-1 font-cairo text-[12px] font-semibold leading-[16px] ${statusBadgeClasses(
                            c.status,
                          )}`}
                        >
                          {statusLabelAr(c.status)}
                        </span>
                      </div>

                      <div className='flex flex-wrap items-start justify-between gap-2 ms-0 sm:ms-[80px]'>
                        <div className='flex min-w-0 items-start gap-1.5 font-cairo text-[15px] font-semibold text-[#4A5565]'>
                          <MessageSquare className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
                          <span className='break-words'>{listPreviewLine(c)}</span>
                        </div>
                        <div className='shrink-0 font-cairo text-[14px] font-bold text-[#99A1AF]'>
                          {formatListTime(c.createdAt)}
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

            {complaints.length === 0 ? (
              <p className='mt-8 text-center font-cairo text-sm font-semibold text-[#94A3B8]'>
                لا توجد شكاوٍ مطابقة.
              </p>
            ) : null}

            {totalPages > 1 ? (
              <div className='mt-6 flex flex-wrap items-center justify-center gap-2'>
                <button
                  type='button'
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className='inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#475467] disabled:opacity-40'
                >
                  <ChevronsRight className='h-4 w-4' />
                  السابق
                </button>
                <span className='font-cairo text-[12px] font-semibold text-[#64748B]'>
                  صفحة {page} / {totalPages} · {totalList} شكوى
                </span>
                <button
                  type='button'
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                  className='inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#475467] disabled:opacity-40'
                >
                  التالي
                  <ChevronsLeft className='h-4 w-4' />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
