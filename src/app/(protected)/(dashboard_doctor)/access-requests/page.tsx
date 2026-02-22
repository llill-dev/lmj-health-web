'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Plus,
  Search,
  Shield,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardOverviewSection from '@/components/dashboard/dashboard-overview-section';
import AddAccessRequestForm from '@/components/dashboard/add-access-request-form';

type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

type AccessRequestItem = {
  id: string;
  patientName: string;
  patientInitial: string;
  status: AccessRequestStatus;
  requestedAt: string;
  note: string;
};

const mockRequests: AccessRequestItem[] = [
  {
    id: 'ar-1',
    patientName: 'أحمد محمد العلي',
    patientInitial: 'أ',
    status: 'pending',
    requestedAt: '2024/12/11',
    note: 'في انتظار موافقة المريض',
  },
  {
    id: 'ar-2',
    patientName: 'أحمد محمد',
    patientInitial: 'أ',
    status: 'approved',
    requestedAt: '2024/12/11',
    note: 'تم الموافقة على الطلب',
  },
];

function statusLabel(status: AccessRequestStatus) {
  switch (status) {
    case 'pending':
      return 'قيد المراجعة';
    case 'approved':
      return 'مقبول';
    case 'rejected':
      return 'مرفوض';
  }
}

function statusChipClassName(status: AccessRequestStatus) {
  switch (status) {
    case 'pending':
      return 'inline-flex items-center justify-center rounded-full bg-[#FEF6EE] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#F79009]';
    case 'approved':
      return 'inline-flex items-center justify-center rounded-full bg-[#ECFDF3] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#027A48]';
    case 'rejected':
      return 'inline-flex items-center justify-center rounded-full bg-[#FEF3F2] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#B42318]';
  }
}

function bottomBarClassName(status: AccessRequestStatus) {
  // screenshot shows a pale yellow bar for info messages
  return status === 'approved'
    ? 'mt-4 flex items-center justify-start gap-2 rounded-[12px] bg-[#F0FDF4] px-4 py-3'
    : status === 'rejected'
      ? 'mt-4 flex items-center justify-start gap-2 rounded-[12px] bg-[#FEF3F2] px-4 py-3'
      : 'mt-4 flex items-center justify-start gap-2 rounded-[12px] bg-[#FFFAEB] px-4 py-3';
}

function bottomBarIcon(status: AccessRequestStatus) {
  if (status === 'approved')
    return <CheckCircle2 className='h-4 w-4 text-[#12B76A]' />;
  if (status === 'rejected')
    return <XCircle className='h-4 w-4 text-[#F04438]' />;
  return <Clock className='h-4 w-4 text-[#16C5C0]' />;
}

function bottomBarTextClassName(status: AccessRequestStatus) {
  if (status === 'approved')
    return 'font-cairo text-[12px] font-extrabold text-[#027A48]';
  if (status === 'rejected')
    return 'font-cairo text-[12px] font-extrabold text-[#B42318]';
  return 'font-cairo text-[12px] font-extrabold text-[#111827]';
}

export default function AccessRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'list' | 'create'>('list');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return mockRequests;
    const q = searchTerm.toLowerCase();
    return mockRequests.filter((r) => r.patientName.toLowerCase().includes(q));
  }, [searchTerm]);

  const pendingCount = mockRequests.filter(
    (x) => x.status === 'pending',
  ).length;
  const approvedCount = mockRequests.filter(
    (x) => x.status === 'approved',
  ).length;
  const rejectedCount = mockRequests.filter(
    (x) => x.status === 'rejected',
  ).length;

  return (
    <div
      dir='rtl'
      lang='ar'
      className='mx-auto w-full max-w-[1120px] px-4'
    >
      <DashboardOverviewSection
        sectionClassName='flex flex-col gap-[18px] mb-6 py-[22px] px-[24px] rounded-[24px] bg-[#16C5C0] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
        overlay={
          mode === 'create' ? (
            <motion.button
              type='button'
              onClick={() => setMode('list')}
              className='absolute left-[16px] top-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)]'
              aria-label='إغلاق'
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
            >
              <X className='h-5 w-5 text-[#0FA6A3]' />
            </motion.button>
          ) : null
        }
        headerLeft={
          <div className='flex w-full flex-row-reverse items-start justify-between gap-[16px]'>
            <div className='flex flex-row-reverse items-start gap-[12px]'>
              <div className='bg-[#FFFFFF33] w-[56px] h-[56px] flex items-center justify-center rounded-[16px]'>
                <Shield className='text-white w-[28px] h-[28px]' />
              </div>
              <div className='flex flex-col gap-1 text-right'>
                <h1 className='font-cairo text-[12px] font-semibold leading-[18px] text-[#FFFFFFCC]'>
                  طلبات الوصول
                </h1>
                <span className='font-cairo text-[22px] font-black leading-[28px] text-[#FFFFFF]'>
                  {pendingCount} طلب
                </span>
              </div>
            </div>
          </div>
        }
        headerRight={
          mode !== 'create' ? (
            <motion.button
              type='button'
              onClick={() => setMode('create')}
              className='flex items-center justify-center gap-2 rounded-[16px] h-[40px] bg-[#FFFFFF] px-4 font-cairo text-[12px] font-extrabold text-[#16C5C0] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]'
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Plus className='h-4 w-4' />
              إضافة طلب وصول
            </motion.button>
          ) : undefined
        }
        kpiGridClassName='grid grid-cols-3 gap-[10px]'
        cards={[
          <div
            key='rejected'
            className='flex h-[64px] items-center justify-center rounded-[16px] bg-white/15 px-4'
          >
            <div className='text-center'>
              <div className='font-cairo text-[18px] font-black text-white'>
                {rejectedCount}
              </div>
              <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>
                مرفوض
              </div>
            </div>
          </div>,
          <div
            key='approved'
            className='flex h-[64px] items-center justify-center rounded-[16px] bg-white/15 px-4'
          >
            <div className='text-center'>
              <div className='font-cairo text-[18px] font-black text-white'>
                {approvedCount}
              </div>
              <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>
                مقبول
              </div>
            </div>
          </div>,
          <div
            key='pending'
            className='flex h-[64px] items-center justify-center rounded-[16px] bg-white/15 px-4'
          >
            <div className='text-center'>
              <div className='font-cairo text-[18px] font-black text-white'>
                {pendingCount}
              </div>
              <div className='mt-1 font-cairo text-[12px] font-bold text-white/80'>
                قيد المراجعة
              </div>
            </div>
          </div>,
        ]}
      />

      <AnimatePresence
        mode='wait'
        initial={false}
      >
        {mode === 'create' ? (
          <motion.div
            key='create'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <AddAccessRequestForm
              patients={[
                { id: 'p-1', name: 'أحمد محمد العلي' },
                { id: 'p-2', name: 'محمد علي' },
                { id: 'p-3', name: 'سارة عبدالله' },
              ]}
              onCancel={() => setMode('list')}
              onSubmit={() => {
                setMode('list');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key='list'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <section className='mb-6 rounded-[16px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)]'>
              <div className='relative'>
                <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <Search className='h-4 w-4' />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='ابحث في الطلبات...'
                  className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                />
              </div>
            </section>

            <section className='space-y-4'>
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className='rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
                >
                  <div className='flex flex-col items-start gap-2 px-6 pt-5'>
                    <div className='flex w-full items-start justify-between'>
                      <div className='flex flex-1 items-start gap-3'>
                        <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-[#16C5C0] text-white shadow-[0_14px_24px_rgba(22,197,192,0.28)]'>
                          <span className='font-cairo text-[18px] font-extrabold'>
                            {r.patientInitial}
                          </span>
                        </div>
                        <div>
                          <div className='font-cairo text-[16px] font-extrabold leading-[20px] text-[#111827]'>
                            {r.patientName}
                          </div>
                          <div className='mt-1'>
                            <span className={statusChipClassName(r.status)}>
                              {statusLabel(r.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type='button'
                        className='shrink-0 flex justify-center items-center h-9 w-9 rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                        aria-label='توسيع'
                      >
                        <ChevronDown className='h-5 w-5' />
                      </button>
                    </div>

                    <div className='flex ms-2 items-center gap-3'>
                      <Calendar className='h-4 w-4 text-[#98A2B3]' />
                      <div className='rounded-[12px] bg-[#F9FAFB] px-4 py-3'>
                        <p className=' font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                          تاريخ الطلب
                        </p>
                        <div className='mt-1 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                          {r.requestedAt}
                        </div>
                      </div>
                    </div>

                    <div className={`${bottomBarClassName(r.status)} w-full`}>
                      {bottomBarIcon(r.status)}
                      <div className={bottomBarTextClassName(r.status)}>
                        {r.note}
                      </div>
                    </div>
                  </div>

                  <div className='h-6' />
                </div>
              ))}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
