'use client';

import { ChevronLeft, MessageSquare, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DashboardSectionHeading from '@/components/doctor/dashboard/dashboard-section-heading';
import { doctorConsultationDeepLink } from '@/lib/doctor/dashboard/homeSnapshotMappers';

export default function ActiveConsultationsSection({
  subject,
  patientName,
  ticketId,
  unreadCount,
}: {
  subject?: string;
  patientName?: string;
  ticketId?: string;
  unreadCount?: number;
}) {
  const navigate = useNavigate();
  const hasData = Boolean(ticketId || subject || patientName);

  const openConsultation = () => {
    if (ticketId) {
      navigate(doctorConsultationDeepLink(ticketId));
      return;
    }
    navigate('/doctor/online-consultations');
  };

  return (
    <section>
      <DashboardSectionHeading
        title='الاستشارات النشطة'
        actionLabel='عرض الكل'
        onActionClick={() => navigate('/doctor/online-consultations')}
        className='mb-[22px]'
      />

      {hasData ? (
        <article className='h-[160px] w-full rounded-[10px] border-[0.5px] border-[#078F8D] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-1 gap-3'>
              <h3 className='min-w-0 truncate text-right font-cairo text-[16px] font-bold leading-[20px] text-[#1F2937]'>
                {subject ?? 'استشارة نشطة'}
              </h3>
              <span className='inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4F3] px-[8px] py-[3px] font-cairo text-[12px] font-bold text-primary'>
                نشطة
              </span>
              {unreadCount && unreadCount > 0 ? (
                <span className='inline-flex shrink-0 items-center gap-1 rounded-[10px] bg-[#FFF7ED] px-2 py-[3px] font-cairo text-[11px] font-extrabold text-[#C2410C]'>
                  <MessageSquare className='h-3 w-3' aria-hidden />
                  {unreadCount} غير مقروء
                </span>
              ) : null}
            </div>
            <button
              type='button'
              onClick={openConsultation}
              className='flex h-[36px] w-[36px] shrink-0 items-center justify-center text-primary transition-colors hover:text-[#0A7A77]'
              aria-label='متابعة الاستشارة'
            >
              <ChevronLeft className='h-[16px] w-[16px]' aria-hidden />
            </button>
          </div>

          <div className='mt-8 flex items-center justify-between gap-3'>
            <div className='flex h-[31px] flex-1 items-center justify-start gap-4 rounded-[16px] bg-[#E6F4F3] px-6 py-6'>
              <UserRound className='h-[16px] w-[16px] shrink-0 text-primary' strokeWidth={2.4} />
              <div className='font-cairo text-[16px] font-bold leading-[16px] text-[#1F2937]'>
                {patientName ?? '—'}
              </div>
            </div>
            <button
              type='button'
              onClick={openConsultation}
              className='shrink-0 rounded-[8px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white'
            >
              متابعة
            </button>
          </div>
        </article>
      ) : (
        <div className='flex h-[160px] items-center justify-center rounded-[10px] border border-dashed border-[#D0D5DD] bg-white px-4 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
          لا توجد استشارات نشطة تحتاج متابعتك الآن.
        </div>
      )}
    </section>
  );
}
