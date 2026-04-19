import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/admin/client';
import type {
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';

function complaintTypeAr(t: ComplaintType): string {
  const m: Record<ComplaintType, string> = {
    appointment: 'موعد',
    consultation: 'استشارة',
    access_request: 'طلب وصول',
    technical: 'تقني',
    other: 'أخرى',
  };
  return m[t] ?? t;
}

function statusLabelAr(s: ComplaintLifecycleStatus): string {
  const m: Record<ComplaintLifecycleStatus, string> = {
    submitted: 'مقدّمة',
    under_review: 'قيد المراجعة',
    in_progress: 'قيد المعالجة',
    resolved: 'تم الحل',
    closed: 'مغلقة',
  };
  return m[s] ?? s;
}

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-SY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_OPTIONS: ComplaintLifecycleStatus[] = [
  'submitted',
  'under_review',
  'in_progress',
  'resolved',
  'closed',
];

export default function AdminComplaintDetailsPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<ComplaintLifecycleStatus | ''>(
    '',
  );
  const [adminResponse, setAdminResponse] = useState('');

  const detailQuery = useQuery({
    queryKey: ['admin', 'complaints', 'detail', complaintId],
    queryFn: () => adminApi.complaints.getById(complaintId!),
    enabled: Boolean(complaintId),
  });

  const c = detailQuery.data?.complaint;

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!complaintId || !nextStatus) {
        return Promise.reject(new Error('missing'));
      }
      const body: { status: ComplaintLifecycleStatus; adminResponse?: string } =
        { status: nextStatus };
      const trimmed = adminResponse.trim();
      if (trimmed) body.adminResponse = trimmed;
      return adminApi.complaints.updateStatus(complaintId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
      setAdminResponse('');
      setNextStatus('');
      await detailQuery.refetch();
    },
  });

  if (!complaintId) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>تفاصيل الشكوى • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='text-right'
      >
        <button
          type='button'
          onClick={() => navigate('/admin/complaints')}
          className='mb-6 inline-flex items-center gap-1 font-cairo text-[13px] font-bold text-primary hover:underline'
        >
          <ChevronRight className='h-4 w-4' />
          العودة إلى الشكاوي
        </button>

        {detailQuery.isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : detailQuery.isError || !c ? (
          <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-6 font-cairo text-sm font-semibold text-red-800'>
            تعذر تحميل الشكوى.
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            <header>
              <h1 className='font-cairo text-[22px] font-black text-[#111827]'>
                تفاصيل الشكوى
              </h1>
              <p className='mt-1 font-cairo text-[13px] text-[#64748B]'>
                {complaintTypeAr(c.type)} ·{' '}
                <span className='font-bold text-[#334155]'>
                  {statusLabelAr(c.status)}
                </span>
              </p>
            </header>

            <section className='rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm'>
              <h2 className='mb-3 font-cairo text-[15px] font-black text-primary'>
                بيانات المريض (لقطة الاتصال)
              </h2>
              <div className='grid gap-2 font-cairo text-[13px] text-[#374151]'>
                <div>
                  <span className='font-bold'>الاسم: </span>
                  {c.contactSnapshot?.fullName ?? '—'}
                </div>
                <div>
                  <span className='font-bold'>البريد: </span>
                  {c.contactSnapshot?.email ?? '—'}
                </div>
                <div>
                  <span className='font-bold'>الهاتف: </span>
                  {c.contactSnapshot?.phone ?? '—'}
                </div>
              </div>
            </section>

            <section className='rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm'>
              <h2 className='mb-3 font-cairo text-[15px] font-black text-primary'>
                محتوى الشكوى
              </h2>
              <div className='space-y-2 font-cairo text-[13px]'>
                {c.subject ? (
                  <div>
                    <span className='font-bold text-[#64748B]'>الموضوع: </span>
                    {c.subject}
                  </div>
                ) : null}
                <div className='whitespace-pre-wrap rounded-lg bg-[#F9FAFB] p-3 text-[#1F2937]'>
                  {c.message}
                </div>
                <div className='text-[12px] text-[#94A3B8]'>
                  أُرسلت في {formatDateTime(c.createdAt)} · آخر تحديث للحالة{' '}
                  {formatDateTime(c.statusUpdatedAt)}
                </div>
              </div>
            </section>

            {c.statusHistory?.length ? (
              <section className='rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm'>
                <h2 className='mb-3 font-cairo text-[15px] font-black text-primary'>
                  سجل الحالات
                </h2>
                <ul className='list-none space-y-2 p-0'>
                  {c.statusHistory.map((h, i) => (
                    <li
                      key={`${h.changedAt}-${i}`}
                      className='rounded-lg border border-[#F1F5F9] bg-[#FAFAFA] px-3 py-2 font-cairo text-[12px]'
                    >
                      <span className='font-bold'>{statusLabelAr(h.status)}</span>
                      {' — '}
                      {h.actorRole} · {formatDateTime(h.changedAt)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {c.adminResponse ? (
              <section className='rounded-xl border border-emerald-200 bg-emerald-50/50 p-5'>
                <h2 className='mb-2 font-cairo text-[14px] font-black text-emerald-900'>
                  رد الإدارة
                </h2>
                <p className='whitespace-pre-wrap font-cairo text-[13px] text-emerald-950'>
                  {c.adminResponse}
                </p>
                <p className='mt-2 font-cairo text-[11px] text-emerald-800'>
                  {formatDateTime(c.adminRespondedAt ?? undefined)}
                </p>
              </section>
            ) : null}

            <section className='rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm'>
              <h2 className='mb-3 font-cairo text-[15px] font-black text-primary'>
                تحديث الحالة (PATCH /complaints/:id/status)
              </h2>
              <p className='mb-4 font-cairo text-[12px] text-[#64748B]'>
                الحالة الحالية:{' '}
                <strong>{statusLabelAr(c.status)}</strong>. انتقالات الحالة
                تتحقق في الخادم.
              </p>
              <div className='flex flex-col gap-3 sm:max-w-md'>
                <label className='block'>
                  <span className='mb-1 block font-cairo text-[12px] font-bold text-[#475467]'>
                    الحالة الجديدة
                  </span>
                  <select
                    value={nextStatus}
                    onChange={(e) =>
                      setNextStatus(e.target.value as ComplaintLifecycleStatus)
                    }
                    className='h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[13px] font-semibold'
                  >
                    <option value=''>— اختر —</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {statusLabelAr(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='block'>
                  <span className='mb-1 block font-cairo text-[12px] font-bold text-[#475467]'>
                    رد الإدارة (اختياري، يُرسل للمريض عند التحديث)
                  </span>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className='w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-cairo text-[13px]'
                    placeholder='نص الرد للمريض...'
                  />
                </label>
                {updateMutation.isError ? (
                  <p className='font-cairo text-[12px] font-semibold text-red-600'>
                    فشل التحديث. تحقق من انتقال الحالة المسموح.
                  </p>
                ) : null}
                <button
                  type='button'
                  disabled={!nextStatus || updateMutation.isPending}
                  onClick={() => updateMutation.mutate()}
                  className='inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-cairo text-[14px] font-extrabold text-white disabled:opacity-50'
                >
                  {updateMutation.isPending ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                  ) : (
                    'حفظ التحديث'
                  )}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
