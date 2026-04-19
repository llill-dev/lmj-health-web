import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { adminApi } from '@/lib/admin/client';
import type {
  ComplaintAttachmentRef,
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

/** يطابق عرض القائمة: «اليوم 12:45 ص» */
function formatHeaderTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
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

/** سطر ثالث في التصميم (الصورة تعرض موقعاً؛ الـ API قد لا يوفّر موقعاً — نعرض موضوعاً أو مقتطفاً). */
function detailContextLine(subject?: string, message?: string) {
  const s = subject?.trim();
  if (s) return s;
  if (!message) return '—';
  const oneLine = message.replace(/\s+/g, ' ').trim();
  if (oneLine.length > 120) return `${oneLine.slice(0, 120)}…`;
  return oneLine;
}

export default function AdminComplaintDetailsPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<ComplaintLifecycleStatus | ''>(
    '',
  );
  const [adminResponse, setAdminResponse] = useState('');
  const [fileActionId, setFileActionId] = useState<string | null>(null);

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

  async function openAttachment(
    attachment: ComplaintAttachmentRef,
    mode: 'view' | 'download',
  ) {
    const pid = c?.patientId;
    const fid = attachment.fileId;
    if (!pid || !fid) return;
    setFileActionId(`${fid}-${mode}`);
    try {
      const res = await adminApi.patients.files.getDownloadUrl(pid, fid);
      const url = res.downloadUrl || res.url;
      if (!url) return;
      if (mode === 'view') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        a.download = attachment.label?.replace(/\s+/g, '_') || 'attachment';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {
      // واجهة هادئة؛ يمكن لاحقاً إظهار toast
    } finally {
      setFileActionId(null);
    }
  }

  const attachments = c?.attachments ?? [];
  const hasAttachments =
    attachments.length > 0 || (c?.attachmentCount ?? 0) > 0;

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
          className='mb-5 inline-flex items-center gap-1 font-cairo text-[13px] font-bold text-primary hover:underline'
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
          <div className='flex flex-col gap-8'>
            <div>
              <h1 className='font-cairo text-[20px] font-black text-[#111827] md:text-[22px]'>
                إدارة الشكاوي
              </h1>
              <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                الحالة: {statusLabelAr(c.status)}
              </p>
            </div>

            {/* بطاقة رئيسية — مطابقة هيكل الصورة */}
            <article className='overflow-hidden rounded-[10px] border-[1.5px] border-[#E8ECF2] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]'>
              <div className='p-6 sm:p-8'>
                {/* رأس البطاقة: وقت يسار الشاشة | اسم + أيقونة يمين */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex min-w-0 flex-1 items-start gap-4'>
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] bg-[#148283] text-white shadow-[0_6px_16px_rgba(20,130,131,0.25)]'>
                      <Stethoscope
                        className='h-7 w-7'
                        strokeWidth={2.25}
                      />
                    </div>
                    <div className='min-w-0 flex-1 text-right'>
                      <div className='font-cairo text-[18px] font-black text-[#0F172A] sm:text-[19px]'>
                        {c.contactSnapshot?.fullName ?? '—'}
                      </div>
                      <div className='mt-2 font-cairo text-[16px] font-semibold leading-snug sm:text-[17px]'>
                        <span className='text-primary'>نوع الشكوى : </span>
                        <span className='text-[#1F2937]'>
                          {complaintTypeAr(c.type)}
                        </span>
                      </div>
                      <div className='mt-2 flex flex-wrap items-center gap-2 font-cairo text-[14px] font-semibold text-[#4A5565]'>
                        <span className='text-[#64748B]'>
                          {detailContextLine(c.subject, c.message)}
                        </span>
                      </div>
                      {(c.contactSnapshot?.email || c.contactSnapshot?.phone) ? (
                        <div className='mt-2 font-cairo text-[12px] text-[#94A3B8]'>
                          {[
                            c.contactSnapshot?.email,
                            c.contactSnapshot?.phone,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className='shrink-0 font-cairo text-[15px] font-black text-[#99A1AF] sm:pt-1'>
                    {formatHeaderTime(c.createdAt)}
                  </div>
                </div>

                <hr className='my-6 border-0 border-t border-[#E5E7EB]' />

                <div className='font-cairo text-[15px] font-medium leading-[1.75] text-[#1F2937]'>
                  {c.message}
                </div>

                <hr className='my-6 border-0 border-t border-[#E5E7EB]' />

                <h2 className='mb-4 font-cairo text-[16px] font-black text-[#111827]'>
                  الملفات المرفقة :
                </h2>

                {!hasAttachments ? (
                  <p className='rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#94A3B8]'>
                    لا توجد ملفات مرفقة
                  </p>
                ) : (
                  <div className='flex flex-col gap-3 rounded-[10px] border border-[#D6EEEC] bg-[#F3FBFA] p-3 sm:p-4'>
                    {attachments.length === 0 ? (
                      <p className='font-cairo text-[13px] text-[#64748B]'>
                        يُشار إلى وجود مرفقات ({c.attachmentCount}) لكن التفاصيل غير
                        مُحمّلة في الاستجابة.
                      </p>
                    ) : (
                      attachments.map((att) => (
                        <div
                          key={att.fileId}
                          className='flex items-center justify-between gap-3 rounded-[8px] border border-[#C5E8E4] bg-[#E6F7F6] px-4 py-3'
                        >
                          <div className='flex min-w-0 flex-1 items-center justify-end gap-2'>
                            <span className='truncate font-cairo text-[14px] font-bold text-[#1F2937]'>
                              {att.label?.trim() || 'photo'}
                            </span>
                            <FileText className='h-5 w-5 shrink-0 text-[#148283]' />
                          </div>
                          <div className='flex shrink-0 items-center gap-2'>
                            <button
                              type='button'
                              disabled={
                                !c.patientId ||
                                fileActionId === `${att.fileId}-view`
                              }
                              onClick={() => openAttachment(att, 'view')}
                              className='flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#148283] text-white shadow-sm transition hover:brightness-110 disabled:opacity-50'
                              aria-label='عرض الملف'
                            >
                              {fileActionId === `${att.fileId}-view` ? (
                                <Loader2 className='h-5 w-5 animate-spin' />
                              ) : (
                                <Eye
                                  className='h-5 w-5'
                                  strokeWidth={2.25}
                                />
                              )}
                            </button>
                            <button
                              type='button'
                              disabled={
                                !c.patientId ||
                                fileActionId === `${att.fileId}-download`
                              }
                              onClick={() => openAttachment(att, 'download')}
                              className='flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#148283] text-white shadow-sm transition hover:brightness-110 disabled:opacity-50'
                              aria-label='تحميل الملف'
                            >
                              {fileActionId === `${att.fileId}-download` ? (
                                <Loader2 className='h-5 w-5 animate-spin' />
                              ) : (
                                <Download
                                  className='h-5 w-5'
                                  strokeWidth={2.25}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </article>

            {/* إجراءات الإدارة — أسفل البطاقة */}
            <div className='grid gap-6 lg:grid-cols-2'>
              {c.statusHistory?.length ? (
                <section className='rounded-[10px] border border-[#E8ECF2] bg-white p-5 shadow-sm'>
                  <h2 className='mb-3 font-cairo text-[15px] font-black text-primary'>
                    سجل الحالات
                  </h2>
                  <ul className='list-none space-y-2 p-0'>
                    {c.statusHistory.map((h, i) => (
                      <li
                        key={`${h.changedAt}-${i}`}
                        className='rounded-lg border border-[#F1F5F9] bg-[#FAFAFA] px-3 py-2 font-cairo text-[12px]'
                      >
                        <span className='font-bold'>
                          {statusLabelAr(h.status)}
                        </span>
                        {' — '}
                        {h.actorRole} · {formatDateTime(h.changedAt)}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {c.adminResponse ? (
                <section className='rounded-[10px] border border-emerald-200 bg-emerald-50/60 p-5'>
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
            </div>

            <section className='rounded-[10px] border border-[#E8ECF2] bg-white p-5 shadow-sm sm:p-6'>
              <h2 className='mb-1 font-cairo text-[15px] font-black text-primary'>
                تحديث حالة الشكوى
              </h2>
              <p className='mb-4 font-cairo text-[12px] text-[#64748B]'>
                الحالة الحالية:{' '}
                <strong>{statusLabelAr(c.status)}</strong>. يتم التحقق من انتقال
                الحالة على الخادم.
              </p>
              <div className='flex max-w-xl flex-col gap-3'>
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
                    رد الإدارة (اختياري — يُرسل للمريض عند التحديث)
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
