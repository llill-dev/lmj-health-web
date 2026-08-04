import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Stethoscope,
  Save,
} from 'lucide-react';
import { ConfirmActionDialog } from '@/components/admin/dialogs';
import {
  STATUS_OPTIONS,
  complaintTypeAr,
  detailContextLine,
  formatDateTime,
  formatHeaderTime,
  statusLabelAr,
} from '@/components/admin/complaints/complaintDetailsUtils';
import { adminApi } from '@/lib/admin/client';
import { complaintUserFacingError } from '@/lib/admin/complaints/complaintErrors';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import type {
  ComplaintAttachmentRef,
  ComplaintLifecycleStatus,
} from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

export default function AdminComplaintDetailsPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const [nextStatus, setNextStatus] = useState<ComplaintLifecycleStatus | ''>(
    '',
  );
  const [adminResponse, setAdminResponse] = useState('');
  const [fileActionId, setFileActionId] = useState<string | null>(null);
  const [saveStatusOpen, setSaveStatusOpen] = useState(false);

  const nextActionLabel = (status: ComplaintLifecycleStatus) => {
    if (status === 'submitted') return 'الإجراء التالي: بدء المراجعة';
    if (status === 'under_review') return 'الإجراء التالي: تحويلها للمعالجة';
    if (status === 'in_progress') return 'الإجراء التالي: حل الشكوى أو إغلاقها';
    if (status === 'resolved') return 'الإجراء الحالي: مراجعة الإغلاق النهائي';
    return 'الشكوى مغلقة للمتابعة المرجعية فقط';
  };

  const detailQuery = useQuery({
    queryKey: ['admin', 'complaints', 'detail', complaintId],
    queryFn: () => adminApi.complaints.getById(complaintId!),
    enabled: Boolean(complaintId),
  });
  const detailAwaiting = isAwaitingInitialQueryData(
    detailQuery.data,
    detailQuery.isError,
  );

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

  const detailErrorMessage = detailQuery.isError
    ? complaintUserFacingError(
        detailQuery.error,
        'تعذّر تحميل تفاصيل الشكوى.',
      )
    : null;
  const updateErrorMessage = updateMutation.isError
    ? complaintUserFacingError(
        updateMutation.error,
        'تعذّر تحديث حالة الشكوى.',
      )
    : null;

  async function openAttachment(
    attachment: ComplaintAttachmentRef,
    mode: 'view' | 'download',
  ) {
    const pid = c?.patientId;
    const fid = attachment.fileId;
    if (!pid || !fid) {
      toast('تعذّر العثور على بيانات المرفق المطلوبة لهذه الشكوى.', {
        title: 'تعذّر فتح المرفق',
        variant: 'error',
      });
      return;
    }
    setFileActionId(`${fid}-${mode}`);
    try {
      const res = await adminApi.patients.files.getDownloadUrl(pid, fid);
      const url = res.downloadUrl || res.url;
      if (!url) {
        toast('لم يُرجع الخادم رابطًا صالحًا لهذا المرفق.', {
          title: 'تعذّر فتح المرفق',
          variant: 'error',
        });
        return;
      }
      if (mode === 'view') {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast('تم فتح المرفق في تبويب جديد.', {
          title: 'تم فتح المرفق',
          variant: 'success',
          durationMs: 2600,
        });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        a.download = attachment.label?.replace(/\s+/g, '_') || 'attachment';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast('بدأ تنزيل المرفق.', {
          title: 'تم بدء التنزيل',
          variant: 'success',
          durationMs: 2600,
        });
      }
    } catch (error) {
      toast(
        complaintUserFacingError(
          error,
          mode === 'view'
            ? 'تعذّر فتح المرفق.'
            : 'تعذّر تنزيل المرفق.',
        ),
        {
          title: mode === 'view' ? 'تعذّر فتح المرفق' : 'تعذّر تنزيل المرفق',
          variant: 'error',
          durationMs: 4200,
        },
      );
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
        <title>{tr('تفاصيل الشكوى', 'Complaint details')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className='text-start'>
        <button
          type='button'
          onClick={() => navigate('/admin/complaints')}
          className='mb-5 inline-flex items-center gap-1 font-cairo text-[13px] font-bold text-primary hover:underline'
        >
          <ChevronRight className='w-4 h-4' />
          {tr('العودة إلى الشكاوي', 'Back to complaints')}
        </button>

        {detailAwaiting ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : detailQuery.isError || !c ? (
          <div className='px-4 py-6 text-sm font-semibold text-red-800 bg-red-50 rounded-xl border border-red-200 font-cairo'>
            {detailErrorMessage ??
              tr('تعذر تحميل الشكوى.', 'Failed to load complaint.')}
          </div>
        ) : (
          <div className='flex flex-col gap-8'>
            <div>
              <h1 className='font-cairo text-[20px] font-black text-[#111827] md:text-[22px]'>
                {tr('إدارة الشكاوي', 'Complaints management')}
              </h1>
              <p className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                {tr('الحالة:', 'Status:')} {statusLabelAr(c.status)}
              </p>
              <div className='mt-2 inline-flex rounded-[8px] bg-[#F8FAFC] px-3 py-1 font-cairo text-[11px] font-bold text-[#667085]'>
                {nextActionLabel(c.status)}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {tr('نوع الطلب', 'Request type')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {tr('شكوى مستخدم', 'User complaint')}
                </div>
              </div>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {tr('نوع الشكوى', 'Complaint type')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {complaintTypeAr(c.type)}
                </div>
              </div>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {tr('الإجراء الحالي', 'Current action')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {nextActionLabel(c.status).replace('الإجراء التالي: ', '')}
                </div>
              </div>
            </div>

            {/* بطاقة رئيسية — مطابقة هيكل الصورة */}
            <article className='overflow-hidden rounded-[10px] border-[1.5px] border-[#E8ECF2] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]'>
              <div className='p-6 sm:p-8'>
                {/* رأس البطاقة: وقت يسار الشاشة | اسم + أيقونة يمين */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex flex-1 gap-4 items-start min-w-0'>
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] bg-[#148283] text-white shadow-[0_6px_16px_rgba(20,130,131,0.25)]'>
                      <Stethoscope
                        className='w-7 h-7'
                        strokeWidth={2.25}
                      />
                    </div>
                    <div className='flex-1 min-w-0 text-right'>
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

                <div className='mb-4 rounded-[10px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-3'>
                  <div className='flex items-start gap-2'>
                    <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
                    <div className='font-cairo text-[12px] font-semibold leading-6 text-[#5B7B79]'>
                      هذه الواجهة تتيح فتح مرفقات الشكوى أو تنزيلها من سياق
                      المراجعة الإدارية فقط، ولا تُستخدم لإدارة ملفات المريض
                      الطبية أو تعديلها.
                    </div>
                  </div>
                </div>

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
                          <div className='flex flex-1 gap-2 justify-end items-center min-w-0'>
                            <span className='truncate font-cairo text-[14px] font-bold text-[#1F2937]'>
                              {att.label?.trim() || 'photo'}
                            </span>
                            <FileText className='h-5 w-5 shrink-0 text-[#148283]' />
                          </div>
                          <div className='flex gap-2 items-center shrink-0'>
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
                                <Loader2 className='w-5 h-5 animate-spin' />
                              ) : (
                                <Eye
                                  className='w-5 h-5'
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
                                <Loader2 className='w-5 h-5 animate-spin' />
                              ) : (
                                <Download
                                  className='w-5 h-5'
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
                  <ul className='p-0 space-y-2 list-none'>
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
              <div className='flex flex-col gap-3 max-w-xl'>
                <label className='block'>
                  <span className='mb-1 block font-cairo text-[12px] font-bold text-[#475467]'>
                    الحالة الجديدة
                  </span>
                  <StyledSelect
                    value={nextStatus}
                    onChange={(v) =>
                      setNextStatus(v as ComplaintLifecycleStatus | '')
                    }
                    placeholder='— اختر —'
                    options={STATUS_OPTIONS.map((s) => ({
                      value: s,
                      label: statusLabelAr(s),
                    }))}
                    listboxAriaLabel='الحالة الجديدة للشكوى'
                  />
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
                    {updateErrorMessage ?? 'تعذّر تحديث حالة الشكوى.'}
                  </p>
                ) : null}
                <button
                  type='button'
                  disabled={!nextStatus || updateMutation.isPending}
                  onClick={() => setSaveStatusOpen(true)}
                  className='inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-cairo text-[14px] font-extrabold text-white disabled:opacity-50'
                >
                  {updateMutation.isPending ? (
                    <Loader2 className='w-5 h-5 animate-spin' />
                  ) : (
                    'حفظ التحديث'
                  )}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={saveStatusOpen}
        onOpenChange={setSaveStatusOpen}
        variant='primary'
        title='تأكيد تحديث حالة الشكوى'
        icon={<Save className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description={
          nextStatus ? (
            <>
              سيتم تغيير حالة الشكوى من «
              <span className='font-extrabold text-[#344054]'>
                {statusLabelAr(c?.status as ComplaintLifecycleStatus)}
              </span>
              » إلى «
              <span className='font-extrabold text-[#344054]'>
                {statusLabelAr(nextStatus)}
              </span>
              »
              {adminResponse.trim()
                ? '، وإرسال نص الرد للمريض عند دعم الخادم لذلك.'
                : '.'}
            </>
          ) : (
            'اختر حالة جديدة أولاً.'
          )
        }
        confirmLabel='تأكيد الحفظ'
        confirmDisabled={!nextStatus || updateMutation.isPending}
        onConfirm={async () => {
          if (!nextStatus) return;
          await updateMutation.mutateAsync();
        }}
        successToast={{
          title: 'تم التحديث',
          message: 'حُدّثت حالة الشكوى وستنعكس في القوائم.',
          variant: 'success',
        }}
      />
    </>
  );
}
