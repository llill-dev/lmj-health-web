import { Helmet } from 'react-helmet-async';
import {
  AlertCircle,
  ChevronLeft,
  Stethoscope,
  Clock,
  Filter,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useState } from 'react';
import ReviewVerificationRequestDialog from '@/components/admin/dialogs/ReviewVerificationRequestDialog';
import { adminApi } from '@/lib/admin/client';

export default function AdminVerificationRequestsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'map'>(
    'map',
  );
  const [selected, setSelected] = useState<{
    id: string;
    doctor: string;
    lat: string;
    lng: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('pending');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const verificationQuery = useQuery({
    queryKey: ['admin', 'verification-requests', statusFilter, page, limit],
    queryFn: () =>
      adminApi.verificationRequests.list({
        ...(statusFilter === 'all' ? {} : { status: statusFilter }),
        page,
        limit,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  function formatRequestedAt(value?: string) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const time = d.toLocaleTimeString('ar-SY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return sameDay ? `اليوم ${time}` : d.toLocaleDateString('ar-SY');
  }

  const locationRequests = useMemo(() => {
    return (verificationQuery.data?.requests ?? []).map((request) => {
      const coords = request.doctor?.clinicLocation?.coordinates ?? [];
      const lng = typeof coords[0] === 'number' ? coords[0].toFixed(4) : '—';
      const lat = typeof coords[1] === 'number' ? coords[1].toFixed(4) : '—';
      const doctorName =
        request.doctor?.userId?.fullName ||
        request.requestedBy?.fullName ||
        '—';
      const addressParts = [
        request.doctor?.clinicAddress,
        request.doctor?.locationCity,
        request.doctor?.locationCountry,
      ].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join('، ') : '—';

      return {
        id: request._id,
        doctor: doctorName,
        specialty: request.doctor?.specialization || '—',
        address,
        requestedAt: formatRequestedAt(request.createdAt),
        status:
          request.status === 'pending'
            ? 'معلق'
            : request.status === 'approved'
              ? 'مقبول'
              : 'مرفوض',
        lat,
        lng,
      };
    });
  }, [verificationQuery.data?.requests]);

  const total = verificationQuery.data?.total ?? 0;
  const currentPage = verificationQuery.data?.page ?? page;
  const currentLimit = verificationQuery.data?.limit ?? limit;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(currentLimit, 1)));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <>
      <Helmet>
        <title>طلبات التحقق • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='text-right'>
          <div className='font-cairo text-[20px] font-black leading-[26px] text-[#1F2937]'>
            إدارة الطلبات
          </div>
        </div>

        <section className='mt-6 rounded-[12px] border border-[#F7D7B6] bg-[#FFF7ED] px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-[#F97316]'>
                <AlertCircle className='h-6 w-6 text-white' />
              </div>
              <div className='text-right'>
                <div className='font-cairo text-[14px] font-black text-[#9A3412]'>
                  يوجد طلبات تحتاج لمراجعة:
                </div>
                <div className='mt-2 inline-flex h-[24px] items-center rounded-[8px] bg-[#F97316] px-3 font-cairo text-[12px] font-extrabold text-white'>
                  {verificationQuery.isLoading
                    ? 'جارِ تحميل الطلبات...'
                    : `${total} طلب تحقق`}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.04)]'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='inline-flex items-center gap-2 text-[#475467]'>
              <Filter className='h-4 w-4' />
              <span className='font-cairo text-[12px] font-extrabold'>
                تصفية الطلبات
              </span>
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'pending', label: 'معلق' },
                  { id: 'approved', label: 'مقبول' },
                  { id: 'rejected', label: 'مرفوض' },
                ] as const
              ).map((option) => {
                const active = statusFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type='button'
                    onClick={() => {
                      setStatusFilter(option.id);
                      setPage(1);
                    }}
                    className={
                      active
                        ? 'inline-flex h-[32px] items-center rounded-[8px] border border-primary bg-[#E6FFFB] px-3 font-cairo text-[12px] font-extrabold text-primary'
                        : 'inline-flex h-[32px] items-center rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#667085] hover:bg-[#F9FAFB]'
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className='h-[32px] rounded-[8px] border border-[#EAECF0] bg-white px-2.5 font-cairo text-[12px] font-bold text-[#475467] outline-none'
                aria-label='عدد العناصر في الصفحة'
              >
                {[10, 20, 50, 100].map((v) => (
                  <option
                    key={v}
                    value={v}
                  >
                    {v} / صفحة
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>


        <section className='mt-6'>
          {verificationQuery.isLoading ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              جارِ تحميل طلبات التحقق...
            </div>
          ) : verificationQuery.error ? (
            <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#B42318]'>
              تعذّر تحميل طلبات التحقق من الخادم.
            </div>
          ) : locationRequests.length === 0 ? (
            <div className='rounded-[12px] border border-[#D1E9FF] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              لا توجد طلبات تحقق معلّقة حاليًا.
            </div>
          ) : (
            <div className='space-y-3'>
              {locationRequests.map((r) => (
                <article
                  key={r.id}
                  className='min-h-[122px] flex justify-between  overflow-hidden rounded-[8px] border border-[#B9D8D6] bg-[#F8FAFA]'
                >
                  <div className='px-4 py-3 flex items-center justify-between flex-1'>
                    <div className='flex items-start justify-start gap-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setSelected(r);
                          setDialogMode('map');
                          setDialogOpen(true);
                        }}
                        className='flex h-[58px] w-[58px] items-center justify-center rounded-[8px] bg-[#129692] text-white'
                        aria-label='عرض الخريطة'
                      >
                        <Stethoscope className='h-6 w-6' />
                      </button>
                      <div className='text-right'>
                        <div className='font-cairo text-[14px] font-black leading-[24px] text-[#1F2937]'>
                          {r.doctor}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-bold leading-[22px] text-[#1F2937]'>
                          {r.specialty}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#4B5563]'>
                          {r.address}
                        </div>
                      </div>
                    </div>

                    <div className='mt-2 flex flex-col items-end justify-between h-full'>
                      <div className='inline-flex h-[22px] items-center gap-1 rounded-full bg-[#129692] px-2.5 font-cairo text-[11px] font-bold text-white'>
                        <Clock className='h-3 w-3' />
                        {r.status}
                      </div>
                      <div className='font-cairo text-[12px] font-semibold leading-[20px] text-[#A0A7B0]'>
                        {r.requestedAt}
                      </div>
                    </div>
                  </div>
                  <button
                    type='button'
                    aria-label='فتح تفاصيل الموقع'
                    onClick={() => {
                      setSelected(r);
                      setDialogMode('map');
                      setDialogOpen(true);
                    }}
                    className='flex w-[58px] self-stretch items-center justify-center bg-[#129692] text-white transition hover:bg-[#0F8885]'
                  >
                    <ChevronLeft className='h-6 w-6' />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {!verificationQuery.isLoading && total > 0 ? (
          <section className='mt-4'>
            <div className='flex flex-col gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between'>
              <div className='text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                صفحة {currentPage} من {totalPages} • إجمالي {total} طلب
              </div>
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    if (canPrev) setPage((p) => p - 1);
                  }}
                  disabled={!canPrev}
                  className='inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <ChevronsRight className='h-4 w-4' />
                  السابق
                </button>
                <button
                  type='button'
                  onClick={() => {
                    if (canNext) setPage((p) => p + 1);
                  }}
                  disabled={!canNext}
                  className='inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  التالي
                  <ChevronsLeft className='h-4 w-4' />
                </button>
              </div>
            </div>
          </section>
        ) : null}
        
        <ReviewVerificationRequestDialog
          open={dialogOpen}
          onOpenChange={(next) => {
            setDialogOpen(next);
            if (!next) setSelected(null);
          }}
          onReviewed={async () => {
            await verificationQuery.refetch();
          }}
          requestId={selected?.id ?? null}
          doctorName={selected?.doctor ?? ''}
          lat={selected?.lat}
          lng={selected?.lng}
          mode={dialogMode}
        />
      </div>
    </>
  );
}
