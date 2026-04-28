import { Helmet } from 'react-helmet-async';
import {
  Activity,
  AlertCircle,
  CalendarClock,
  Download,
  FileText,
  HeartPulse,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Key,
  Calendar,
  Info,
} from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAdminPatient } from '@/hooks/useAdminPatient';
import { useAdminAppointments } from '@/hooks/useAdminAppointments';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import { useAdminPatientFiles } from '@/hooks/useAdminPatientFiles';
import { AppointmentStatusChip } from '@/components/admin/patients/AppointmentStatusChip';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminPatientFileItem,
  AdminPatientSummary,
  PatientAccountStatus,
} from '@/lib/admin/types';

const accountStatusLabel: Record<PatientAccountStatus, string> = {
  active: 'نشط',
  temporary: 'مؤقت',
  suspended: 'معلق',
  locked: 'موقوف',
};

const accountStatusChip: Record<PatientAccountStatus, string> = {
  active: 'bg-[#ECFDF3] text-[#16A34A]',
  temporary: 'bg-[#E0F2FE] text-[#0369A1]',
  suspended: 'bg-[#FEF3C7] text-[#B45309]',
  locked: 'bg-[#FEE2E2] text-[#B42318]',
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBytes(bytes?: number) {
  if (!bytes || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function AdminPatientDetailsPage() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPatient = (location.state as { patient?: AdminPatientSummary } | null)
    ?.patient;
  const { patient, isLoading, error } = useAdminPatient(patientId, initialPatient ?? null);

  // Fetch more appointments to improve per-patient accuracy.
  // NOTE: API admin/appointments does not support ?patientId filter,
  // so we fetch a large page and filter locally. Counts are approximate.
  const appointmentsQuery = useAdminAppointments({
    page: 1,
    limit: 500,
  });

  const auditQuery = useAdminAuditLogs({
    page: 1,
    limit: 10,
    ...(patientId ? { patientId } : {}),
  });
  const filesQuery = useAdminPatientFiles(patient?._id ?? patientId, {
    page: 1,
    limit: 8,
    archived: false,
  });

  const patientAppointments = useMemo(() => {
    if (!patientId) return [];
    return appointmentsQuery.appointments.filter((a) => {
      if (a.patient?._id === patientId) return true;
      if (patient?.publicId && a.patient?.publicId === patient.publicId) return true;
      return false;
    });
  }, [appointmentsQuery.appointments, patient?.publicId, patientId]);

  const upcomingCount = useMemo(
    () =>
      patientAppointments.filter(
        (a) => a.status === 'scheduled' || a.status === 'rescheduled',
      ).length,
    [patientAppointments],
  );
  const completedCount = useMemo(
    () => patientAppointments.filter((a) => a.status === 'completed').length,
    [patientAppointments],
  );
  const cancelledCount = useMemo(
    () => patientAppointments.filter((a) => a.status === 'cancelled').length,
    [patientAppointments],
  );
  const noShowCount = useMemo(
    () => patientAppointments.filter((a) => a.status === 'no-show').length,
    [patientAppointments],
  );

  const patientAuditLogs = useMemo(
    () =>
      (auditQuery.data?.auditLogs ?? []).filter((l) => {
        if (patientId && l.patientId === patientId) return true;
        return Boolean(patient?.publicId && l.patientPublicId === patient.publicId);
      }),
    [auditQuery.data?.auditLogs, patient?.publicId, patientId],
  );

  const handleFileDownload = async (file: AdminPatientFileItem) => {
    const resolvedPatientId = patient?._id ?? patientId;
    const fileId = file._id || file.id;
    if (!resolvedPatientId || !fileId) return;
    try {
      const res = await adminApi.patients.files.getDownloadUrl(resolvedPatientId, fileId);
      const url = res.downloadUrl || res.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // Keep UX quiet here; list remains interactive.
    }
  };

  return (
    <>
      <Helmet>
        <title>تفاصيل المريض • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
              بطاقة تفاصيل المريض
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
              {patientId ? `المعرّف المرجعي: ${patientId}` : '—'}
            </div>
          </div>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] hover:bg-[#F9FAFB]'
          >
            → رجوع للقائمة
          </button>
        </div>

        {isLoading ? (
          <div className='mt-6 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='font-cairo text-[13px] font-semibold text-[#667085]'>
              جارِ تحميل تفاصيل المريض...
            </div>
          </div>
        ) : error ? (
          <div className='mt-6 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='font-cairo text-[13px] font-semibold text-[#B42318]'>
              تعذّر تحميل تفاصيل المريض
            </div>
          </div>
        ) : !patient ? (
          <div className='mt-6 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <AlertCircle className='mx-auto h-8 w-8 text-[#D97706]' />
            <div className='mt-3 font-cairo text-[14px] font-extrabold text-[#92400E]'>
              لم يُعثر على بيانات هذا المريض
            </div>
            <div className='mt-2 font-cairo text-[12px] font-semibold text-[#B45309]'>
              قد يكون الـ ID غير صحيح، أو أن المريض محذوف. جرّب العودة لقائمة المرضى والضغط على "عرض التفاصيل" مباشرةً.
            </div>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='mt-4 inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-[#D97706] px-4 font-cairo text-[12px] font-extrabold text-white'
            >
              العودة لقائمة المرضى
            </button>
          </div>
        ) : (
          <>
            <section className='mt-6 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.06)]'>
              <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-[68px] w-[68px] items-center justify-center rounded-[14px] bg-primary text-white'>
                    <UserRound className='h-8 w-8' />
                  </div>
                  <div className='text-right'>
                    <div className='font-cairo text-[22px] font-black leading-[28px] text-[#111827]'>
                      {patient.user.fullName}
                    </div>
                    <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                      رقم المريض: {patient.publicId || '—'}
                    </div>
                    <div className='mt-2'>
                      <span
                        className={`inline-flex h-[24px] items-center rounded-full px-3 font-cairo text-[11px] font-extrabold ${accountStatusChip[patient.user.accountStatus]}`}
                      >
                        {accountStatusLabel[patient.user.accountStatus]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <Phone className='h-4 w-4 text-primary' />
                    {patient.user.phone ?? '—'}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <Mail className='h-4 w-4 text-primary' />
                    {patient.user.email ?? '—'}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <ShieldCheck className='h-4 w-4 text-primary' />
                    {patient.isClaimed ? 'الحساب مُفعّل (Claimed)' : 'الحساب غير مُطالب به'}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <CalendarClock className='h-4 w-4 text-primary' />
                    تاريخ التفعيل: {formatDate(patient.claimedAt)}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <Calendar className='h-4 w-4 text-primary' />
                    تاريخ التسجيل: {formatDate(patient.createdAt)}
                  </div>
                  {patient.user.mustChangePassword && (
                    <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-bold text-[#92400E]'>
                      <Key className='h-4 w-4 text-[#D97706]' />
                      يجب تغيير كلمة المرور
                    </div>
                  )}
                  {patient.user.accountStatus === 'suspended' && patient.suspendReason && (
                    <div className='col-span-2 inline-flex items-start gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]'>
                      <Info className='mt-0.5 h-4 w-4 shrink-0' />
                      سبب التعليق: {patient.suspendReason}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className='mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4'>
              <div className='rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>مواعيد قادمة</div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#16A34A]'>
                  {appointmentsQuery.isLoading ? '...' : upcomingCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#67E8F9] bg-[#ECFEFF] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>مواعيد مكتملة</div>
                <div className='mt-2 font-cairo text-[28px] font-black text-primary'>
                  {appointmentsQuery.isLoading ? '...' : completedCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>مواعيد ملغاة</div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#B42318]'>
                  {appointmentsQuery.isLoading ? '...' : cancelledCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#E9D4FF] bg-[#FAF5FF] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>لم يحضر (No-show)</div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#7C3AED]'>
                  {appointmentsQuery.isLoading ? '...' : noShowCount}
                </div>
              </div>
            </section>

            <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)]'>
              <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
                <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                  <HeartPulse className='h-4 w-4 text-primary' />
                  آخر المواعيد المرتبطة بالمريض
                </div>
                <div className='flex items-center gap-2'>
                  <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    {appointmentsQuery.isLoading ? 'جارِ التحميل...' : `${patientAppointments.length} عنصر`}
                  </div>
                  <div
                    title='الأرقام محسوبة من أحدث 500 موعد. الـ API لا يدعم فلترة بـ patientId مباشرة.'
                    className='inline-flex h-[20px] items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 font-cairo text-[10px] font-bold text-[#98A2B3] cursor-help'
                  >
                    تقريبي
                  </div>
                </div>
              </div>
              <div className='space-y-3 px-6 py-4'>
                {appointmentsQuery.isLoading ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    جارِ تحميل المواعيد...
                  </div>
                ) : patientAppointments.length === 0 ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    لا توجد مواعيد مرتبطة بهذا المريض ضمن البيانات الحالية.
                  </div>
                ) : (
                  patientAppointments.slice(0, 8).map((a) => (
                    <div
                      key={a._id}
                      className='rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-right'>
                          <div className='font-cairo text-[12px] font-black text-[#111827]'>
                            {a.doctor?.userId?.fullName ?? '—'}
                          </div>
                          {a.doctor?.specialization && (
                            <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                              {a.doctor.specialization}
                            </div>
                          )}
                          <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                            {formatDateTime(a.startDateTime || a.date)}
                          </div>
                        </div>
                        <AppointmentStatusChip status={a.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)]'>
              <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
                <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                  <FileText className='h-4 w-4 text-primary' />
                  ملفات المريض
                </div>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {filesQuery.isLoading ? 'جارِ التحميل...' : `${filesQuery.files.length} ملف`}
                </div>
              </div>
              <div className='space-y-3 px-6 py-4'>
                {filesQuery.isLoading ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    جارِ تحميل ملفات المريض...
                  </div>
                ) : filesQuery.error ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#B42318]'>
                    تعذّر تحميل ملفات المريض حالياً.
                  </div>
                ) : filesQuery.files.length === 0 ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    لا توجد ملفات مرفوعة لهذا المريض.
                  </div>
                ) : (
                  filesQuery.files.map((f) => (
                    <div
                      key={f._id || f.id}
                      className='rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-right'>
                          <div className='font-cairo text-[12px] font-black text-[#111827]'>
                            {f.originalName || 'ملف بدون اسم'}
                          </div>
                          <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                            {f.mimeType || 'غير معروف'} • {formatBytes(f.sizeBytes)} •{' '}
                            {formatDateTime(f.createdAt)}
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => {
                            void handleFileDownload(f);
                          }}
                          className='inline-flex h-[30px] items-center gap-1.5 rounded-[8px] border border-[#D1E9FF] bg-[#EFF8FF] px-3 font-cairo text-[11px] font-extrabold text-[#175CD3] hover:bg-[#D1E9FF]'
                        >
                          <Download className='h-3.5 w-3.5' />
                          تنزيل
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)]'>
              <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
                <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                  <Activity className='h-4 w-4 text-primary' />
                  سجل النشاط المرتبط بالمريض (Audit)
                </div>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {auditQuery.isLoading ? 'جارِ التحميل...' : `${patientAuditLogs.length} حدث`}
                </div>
              </div>
              <div className='space-y-3 px-6 py-4'>
                {auditQuery.isLoading ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    جارِ تحميل السجلات...
                  </div>
                ) : patientAuditLogs.length === 0 ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    لا توجد سجلات نشاط ظاهرة لهذا المريض ضمن آخر النتائج.
                  </div>
                ) : (
                  patientAuditLogs.slice(0, 8).map((l) => (
                    <div
                      key={l._id}
                      className='rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-right'>
                          <div className='font-cairo text-[12px] font-black text-[#111827]'>
                            {l.action}
                          </div>
                          <div className='mt-1 font-cairo text-[11px] font-semibold text-[#667085]'>
                            {l.actorUserName || '—'} • {formatDateTime(l.createdAt)}
                          </div>
                        </div>
                        <div className='inline-flex h-[22px] items-center rounded-full bg-[#ECFEFF] px-2.5 font-cairo text-[11px] font-extrabold text-primary'>
                          {l.category}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
