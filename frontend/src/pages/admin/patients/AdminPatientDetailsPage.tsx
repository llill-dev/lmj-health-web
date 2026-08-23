import { Helmet } from 'react-helmet-async';
import {
  Activity,
  AlertCircle,
  CalendarClock,
  HeartPulse,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Key,
  Calendar,
  Info,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAdminPatient } from '@/hooks/admin/patients/useAdminPatient';
import { useAdminAppointments } from '@/hooks/admin/appointments/useAdminAppointments';
import { useAdminAuditLogs } from '@/hooks/admin/audit/useAdminAuditLogs';
import { AppointmentStatusChip } from '@/components/admin/patients/AppointmentStatusChip';
import { patientStatusLabel } from '@/components/admin/patients/patientListUtils';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminPatientSummary,
  PatientAccountStatus,
} from '@/lib/admin/types';

const accountStatusChip: Record<PatientAccountStatus, string> = {
  active: 'bg-[#ECFDF3] text-[#16A34A]',
  temporary: 'bg-[#E0F2FE] text-[#0369A1]',
  suspended: 'bg-[#FEF3C7] text-[#B45309]',
  locked: 'bg-[#FEE2E2] text-[#B42318]',
};

function formatDate(value: string | null | undefined, locale: 'ar' | 'en') {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value: string | null | undefined, locale: 'ar' | 'en') {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPatientDetailsPage() {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPatient = (location.state as { patient?: AdminPatientSummary } | null)
    ?.patient;
  const { patient, isAwaitingData, error, refetch: refetchPatient } = useAdminPatient(
    patientId,
    initialPatient ?? null,
  );

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
  const [accountAction, setAccountAction] = useState<'activate' | 'unsuspend' | null>(null);

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

  async function runAccountAction(action: 'activate' | 'unsuspend') {
    const resolvedPatientId = patient?._id ?? patientId;
    if (!resolvedPatientId) return;
    setAccountAction(action);
    try {
      if (action === 'activate') {
        await adminApi.patients.activate(resolvedPatientId);
        toast(t('adminPatients.toast.activated'), {
          title: t('adminPatientDetails.toast.activatedTitle'),
          variant: 'success',
          durationMs: 4200,
        });
      } else {
        await adminApi.patients.unsuspend(resolvedPatientId);
        toast(t('adminPatients.toast.reactivatedAfterAppeal'), {
          title: t('adminPatientDetails.toast.unsuspendedTitle'),
          variant: 'success',
          durationMs: 4200,
        });
      }
      await Promise.all([
        refetchPatient(),
        appointmentsQuery.refetch(),
        auditQuery.refetch(),
      ]);
    } catch {
      toast(
        action === 'activate'
          ? t('adminPatientDetails.toast.activateFailed')
          : t('adminPatientDetails.toast.unsuspendFailed'),
        {
          title: t('adminPatientDetails.toast.errorTitle'),
          variant: 'error',
          durationMs: 5000,
        },
      );
    } finally {
      setAccountAction(null);
    }
  }

  return (
    <>
      <Helmet>
        <title>{`${t('adminPatientDetails.pageTitle')} • LMJ Health`}</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
      >
        <div className='flex items-start justify-between'>
          <div className='text-right'>
            <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
              {t('adminPatientDetails.header.title')}
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
              {patientId
                ? t('adminPatientDetails.header.refId').replace('{id}', patientId)
                : '—'}
            </div>
          </div>
          <button
            type='button'
            onClick={() => navigate('/admin/patients')}
            className='inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] hover:bg-[#F9FAFB]'
          >
            → {t('adminPatientDetails.header.back')}
          </button>
        </div>

        {isAwaitingData ? (
          <div className='mt-6 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='font-cairo text-[13px] font-semibold text-[#667085]'>
              {t('adminPatientDetails.loading')}
            </div>
          </div>
        ) : error ? (
          <div className='mt-6 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='font-cairo text-[13px] font-semibold text-[#B42318]'>
              {t('adminPatientDetails.loadError')}
            </div>
          </div>
        ) : !patient ? (
          <div className='mt-6 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-10 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <AlertCircle className='mx-auto h-8 w-8 text-[#D97706]' />
            <div className='mt-3 font-cairo text-[14px] font-extrabold text-[#92400E]'>
              {t('adminPatientDetails.notFound.title')}
            </div>
            <div className='mt-2 font-cairo text-[12px] font-semibold text-[#B45309]'>
              {t('adminPatientDetails.notFound.body')}
            </div>
            <button
              type='button'
              onClick={() => navigate('/admin/patients')}
              className='mt-4 inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-[#D97706] px-4 font-cairo text-[12px] font-extrabold text-white'
            >
              {t('adminPatientDetails.notFound.backButton')}
            </button>
          </div>
        ) : (
          <>
            <section className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.summary.recordType')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {t('adminPatientDetails.summary.recordTypeValue')}
                </div>
              </div>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.summary.accountStatus')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {patientStatusLabel(patient.user.accountStatus, locale)}
                </div>
              </div>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.summary.scope')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {t('adminPatientDetails.summary.scopeValue')}
                </div>
              </div>
              <div className='rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3'>
                <div className='mb-2 font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.summary.currentAction')}
                </div>
                <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                  {patient.user.accountStatus === 'active'
                    ? t('adminPatientDetails.summary.action.followUpOnly')
                    : patient.user.accountStatus === 'suspended'
                      ? t('adminPatientDetails.summary.action.unsuspendOrReactivate')
                      : t('adminPatientDetails.summary.action.reactivateWhenNeeded')}
                </div>
              </div>
            </section>

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
                      {t('adminPatientDetails.patientIdLabel').replace(
                        '{id}',
                        patient.publicId || '—',
                      )}
                    </div>
                    <div className='mt-2'>
                      <span
                        className={`inline-flex h-[24px] items-center rounded-full px-3 font-cairo text-[11px] font-extrabold ${accountStatusChip[patient.user.accountStatus]}`}
                      >
                        {patientStatusLabel(patient.user.accountStatus, locale)}
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
                    {patient.isClaimed
                      ? t('adminPatientDetails.claimed.yes')
                      : t('adminPatientDetails.claimed.no')}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <CalendarClock className='h-4 w-4 text-primary' />
                    {t('adminPatientDetails.claimedAtLabel').replace(
                      '{date}',
                      formatDate(patient.claimedAt, locale),
                    )}
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <Calendar className='h-4 w-4 text-primary' />
                    {t('adminPatientDetails.createdAtLabel').replace(
                      '{date}',
                      formatDate(patient.createdAt, locale),
                    )}
                  </div>
                  {patient.user.mustChangePassword && (
                    <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-bold text-[#92400E]'>
                      <Key className='h-4 w-4 text-[#D97706]' />
                      {t('adminPatientDetails.mustChangePassword')}
                    </div>
                  )}
                  {patient.user.accountStatus === 'suspended' && patient.suspendReason && (
                    <div className='col-span-2 inline-flex items-start gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]'>
                      <Info className='mt-0.5 h-4 w-4 shrink-0' />
                      {t('adminPatientDetails.suspendReasonLabel').replace(
                        '{reason}',
                        patient.suspendReason,
                      )}
                    </div>
                  )}
                  {patient.user.accountStatus !== 'active' && (
                    <div className='col-span-2 flex flex-wrap gap-2'>
                      <button
                        type='button'
                        disabled={accountAction !== null}
                        onClick={() => {
                          void runAccountAction('activate');
                        }}
                        className='inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-[#16A34A] px-4 font-cairo text-[12px] font-extrabold text-white disabled:opacity-60'
                      >
                        {accountAction === 'activate' ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <ShieldCheck className='h-4 w-4' />
                        )}
                        {t('adminPatientDetails.action.activate')}
                      </button>
                      {patient.user.accountStatus === 'suspended' && (
                        <button
                          type='button'
                          disabled={accountAction !== null}
                          onClick={() => {
                            void runAccountAction('unsuspend');
                          }}
                          className='inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#16A34A] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#15803D] disabled:opacity-60'
                        >
                          {accountAction === 'unsuspend' ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <ShieldCheck className='h-4 w-4' />
                          )}
                          {t('adminPatientDetails.action.unsuspend')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className='mt-5 rounded-[14px] border border-[#D5E8E6] bg-[#F8FFFE] px-6 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]'>
              <div className='flex items-start gap-3 text-right'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <Info className='h-5 w-5' />
                </div>
                <div>
                  <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                    {t('adminPatientDetails.readOnlyNotice.title')}
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]'>
                    {t('adminPatientDetails.readOnlyNotice.body')}
                  </div>
                </div>
              </div>
            </section>

            <section className='mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4'>
              <div className='rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.stats.upcoming')}
                </div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#16A34A]'>
                  {appointmentsQuery.isAwaitingData ? '...' : upcomingCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#67E8F9] bg-[#ECFEFF] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.stats.completed')}
                </div>
                <div className='mt-2 font-cairo text-[28px] font-black text-primary'>
                  {appointmentsQuery.isAwaitingData ? '...' : completedCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.stats.cancelled')}
                </div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#B42318]'>
                  {appointmentsQuery.isAwaitingData ? '...' : cancelledCount}
                </div>
              </div>
              <div className='rounded-[12px] border border-[#E9D4FF] bg-[#FAF5FF] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
                <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                  {t('adminPatientDetails.stats.noShow')}
                </div>
                <div className='mt-2 font-cairo text-[28px] font-black text-[#7C3AED]'>
                  {appointmentsQuery.isAwaitingData ? '...' : noShowCount}
                </div>
              </div>
            </section>

            <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)]'>
              <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
                <div className='inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]'>
                  <HeartPulse className='h-4 w-4 text-primary' />
                  {t('adminPatientDetails.appointmentsSection.title')}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    {appointmentsQuery.isAwaitingData
                      ? t('adminPatientDetails.appointmentsSection.loading')
                      : t('adminPatientDetails.appointmentsSection.itemsCount').replace(
                          '{count}',
                          String(patientAppointments.length),
                        )}
                  </div>
                  <div
                    title={t('adminPatients.appointmentsNote.title')}
                    className='inline-flex h-[20px] items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 font-cairo text-[10px] font-bold text-[#98A2B3] cursor-help'
                  >
                    {t('adminPatientDetails.appointmentsSection.approxBadge')}
                  </div>
                </div>
              </div>
              <div className='space-y-3 px-6 py-4'>
                {appointmentsQuery.isAwaitingData ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    {t('adminPatientDetails.appointmentsSection.loadingAppointments')}
                  </div>
                ) : patientAppointments.length === 0 ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    {t('adminPatientDetails.appointmentsSection.empty')}
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
                            {formatDateTime(a.startDateTime || a.date, locale)}
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
                  <Activity className='h-4 w-4 text-primary' />
                  {t('adminPatientDetails.auditSection.title')}
                </div>
                <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  {auditQuery.isAwaitingData
                    ? t('adminPatientDetails.auditSection.loadingLogs')
                    : t('adminPatientDetails.auditSection.eventsCount').replace(
                        '{count}',
                        String(patientAuditLogs.length),
                      )}
                </div>
              </div>
              <div className='space-y-3 px-6 py-4'>
                {auditQuery.isAwaitingData ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    {t('adminPatientDetails.auditSection.loadingLogs')}
                  </div>
                ) : patientAuditLogs.length === 0 ? (
                  <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                    {t('adminPatientDetails.auditSection.empty')}
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
                            {l.actorUserName || '—'} • {formatDateTime(l.createdAt, locale)}
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
